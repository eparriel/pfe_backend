import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { ConfigService } from '@nestjs/config';
import { BucketsAPI, HealthAPI, OrgsAPI } from '@influxdata/influxdb-client-apis';

@Injectable()
export class InfluxService implements OnModuleInit {
  private readonly logger = new Logger(InfluxService.name);
  private influxDB: InfluxDB;
  private bucketsApi: BucketsAPI;
  private healthApi: HealthAPI;
  private orgsApi: OrgsAPI;
  private readonly orgId: string;
  private readonly token: string;
  private readonly url: string;

  constructor(private configService: ConfigService) {
    this.url = this.configService.get<string>('INFLUXDB_URL');
    this.token = this.configService.get<string>('INFLUXDB_TOKEN');
    this.orgId = this.configService.get<string>('INFLUXDB_ORG');

    if (!this.url) {
      this.logger.error('INFLUXDB_URL is not defined in environment variables');
      throw new Error('INFLUXDB_URL is required');
    }

    if (!this.token) {
      this.logger.error('INFLUXDB_TOKEN is not defined in environment variables');
      throw new Error('INFLUXDB_TOKEN is required');
    }

    if (!this.orgId) {
      this.logger.error('INFLUXDB_ORG is not defined in environment variables');
      throw new Error('INFLUXDB_ORG is required');
    }

    this.logger.log(`Initializing InfluxDB client with URL: ${this.url}`);
    
    try {
      this.influxDB = new InfluxDB({
        url: this.url,
        token: this.token,
      });

      this.bucketsApi = new BucketsAPI(this.influxDB);
      this.healthApi = new HealthAPI(this.influxDB);
      this.orgsApi = new OrgsAPI(this.influxDB);
      
      this.logger.log('InfluxDB client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize InfluxDB client:', error);
      throw error;
    }
  }

  async onModuleInit() {
    try {
      this.logger.log('Initializing InfluxDB service...');
      
      // Vérifier la connexion à InfluxDB
      this.logger.log('Checking InfluxDB health...');
      const health = await this.healthApi.getHealth();
      this.logger.log(`InfluxDB health status: ${health.status}`);
      
      // Vérifier l'existence de l'organisation
      this.logger.log(`Checking organization: ${this.orgId}`);
      const orgs = await this.orgsApi.getOrgs({ org: this.orgId });
      
      if (orgs.orgs.length === 0) {
        throw new Error(`Organization '${this.orgId}' not found`);
      }
      
      this.logger.log(`Found organization: ${orgs.orgs[0].name} (${orgs.orgs[0].id})`);
      
    } catch (error) {
      this.logger.error(`Failed to connect to InfluxDB: ${error.message}`);
      if (error.message.includes('unauthorized')) {
        this.logger.error('Invalid token or insufficient permissions');
      }
      throw error;
    }
  }

  /**
   * Crée un bucket pour un vivarium s'il n'existe pas déjà
   * @param vivariumId - ID du vivarium
   * @returns - true si le bucket a été créé, false sinon
   */
  async createBucketForVivarium(vivariumId: number): Promise<boolean> {
    try {
      const bucketName = `vivarium_${vivariumId}`;
      
      // Vérifier si le bucket existe déjà
      const buckets = await this.bucketsApi.getBuckets({
        org: this.orgId,
        name: bucketName,
      });

      if (buckets.buckets.length > 0) {
        this.logger.log(`Bucket ${bucketName} already exists`);
        return false;
      }

      // Créer le bucket
      await this.bucketsApi.postBuckets({
        body: {
          orgID: this.orgId,
          name: bucketName,
          retentionRules: [
            {
              type: 'expire',
              everySeconds: 2592000, // 30 jours par défaut
            },
          ],
        },
      });

      this.logger.log(`Created bucket ${bucketName} for vivarium ${vivariumId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to create bucket for vivarium ${vivariumId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Insère des données dans le bucket d'un vivarium
   * @param vivariumId - ID du vivarium
   * @param measurement - Type de mesure (température, humidité, etc.)
   * @param value - Valeur de la mesure
   * @param tags - Tags associés à la mesure
   */
  async insertData(
    vivariumId: number,
    measurement: string,
    value: number,
    tags: Record<string, string> = {},
  ): Promise<void> {
    try {
      const bucketName = `vivarium_${vivariumId}`;
      const writeApi = this.influxDB.getWriteApi(this.orgId, bucketName, 'ns');
      
      const point = new Point(measurement)
        .floatField('value', value)
        .timestamp(new Date());
      
      // Ajouter les tags
      Object.entries(tags).forEach(([key, value]) => {
        point.tag(key, value);
      });

      // Ajouter le tag vivariumId
      point.tag('vivariumId', vivariumId.toString());
      
      writeApi.writePoint(point);
      await writeApi.close();
      
      this.logger.log(`Inserted data for vivarium ${vivariumId}: ${measurement} = ${value}`);
    } catch (error) {
      this.logger.error(`Failed to insert data for vivarium ${vivariumId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupère les dernières données d'un vivarium
   * @param vivariumId - ID du vivarium
   * @param measurement - Type de mesure (température, humidité, etc.)
   * @param timeRange - Plage de temps en heures (default: 24)
   */
  async getLatestData(vivariumId: number, measurement: string, timeRange: number = 24) {
    try {
      const bucketName = `vivarium_${vivariumId}`;
      const queryApi = this.influxDB.getQueryApi(this.orgId);
      
      const query = `
        from(bucket: "${bucketName}")
          |> range(start: -${timeRange}h)
          |> filter(fn: (r) => r._measurement == "${measurement}")
          |> filter(fn: (r) => r.vivariumId == "${vivariumId}")
          |> yield()
      `;
      
      const result = await queryApi.collectRows(query);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get data for vivarium ${vivariumId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Supprime un bucket pour un vivarium
   * @param vivariumId - ID du vivarium
   */
  async deleteBucketForVivarium(vivariumId: number): Promise<void> {
    try {
      const bucketName = `vivarium_${vivariumId}`;
      
      // Trouver l'ID du bucket
      const buckets = await this.bucketsApi.getBuckets({
        org: this.orgId,
        name: bucketName,
      });

      if (buckets.buckets.length === 0) {
        this.logger.log(`Bucket ${bucketName} does not exist`);
        return;
      }

      const bucketId = buckets.buckets[0].id;
      
      // Supprimer le bucket
      await this.bucketsApi.deleteBucketsID({ bucketID: bucketId });
      
      this.logger.log(`Deleted bucket ${bucketName} for vivarium ${vivariumId}`);
    } catch (error) {
      this.logger.error(`Failed to delete bucket for vivarium ${vivariumId}: ${error.message}`);
      throw error;
    }
  }
} 