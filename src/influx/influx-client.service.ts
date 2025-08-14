import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InfluxClientService implements OnModuleInit {
  private client: ClientProxy;
  private readonly logger = new Logger(InfluxClientService.name);

  constructor(private configService: ConfigService) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get<string>('RABBITMQ_URL')],
        queue: 'influx_queue',
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      this.logger.log('Connected to InfluxDB microservice');
    } catch (error) {
      this.logger.error(
        `Failed to connect to InfluxDB microservice: ${error.message}`,
      );
    }
  }

  async createBucketForVivarium(vivariumId: number): Promise<boolean> {
    try {
      return await firstValueFrom(
        this.client.send('influx.create_bucket', vivariumId),
      );
    } catch (error) {
      this.logger.error(
        `Failed to create bucket for vivarium ${vivariumId}: ${error.message}`,
      );
      throw error;
    }
  }

  async insertData(
    vivariumId: number,
    measurement: string,
    value: number,
    tags: Record<string, string> = {},
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.client.send('influx.insert_data', {
          vivariumId,
          measurement,
          value,
          tags,
        }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to insert data for vivarium ${vivariumId}: ${error.message}`,
      );
      throw error;
    }
  }

  async getLatestData(
    vivariumId: number,
    measurement: string,
    timeRange: number = 24,
  ) {
    try {
      return await firstValueFrom(
        this.client.send('influx.get_data', {
          vivariumId,
          measurement,
          timeRange,
        }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to get data for vivarium ${vivariumId}: ${error.message}`,
      );
      throw error;
    }
  }

  async deleteBucketForVivarium(vivariumId: number): Promise<void> {
    try {
      await firstValueFrom(
        this.client.send('influx.delete_bucket', vivariumId),
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete bucket for vivarium ${vivariumId}: ${error.message}`,
      );
      throw error;
    }
  }
}
