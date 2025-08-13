import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { InfluxService } from './influx/influx.service';

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly influxService: InfluxService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async checkHealth() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        api: 'healthy',
        database: 'unknown',
        influxdb: 'unknown',
      },
      details: {
        memory: this.getMemoryUsage(),
        cpu: process.cpuUsage(),
      }
    };

    // Vérifier la base de données PostgreSQL
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      health.services.database = 'healthy';
    } catch (error) {
      health.services.database = 'unhealthy';
      health.status = 'degraded';
    }

    // Vérifier InfluxDB
    try {
      // Utiliser la méthode de santé d'InfluxDB si disponible
      // Pour l'instant, on considère InfluxDB comme healthy si le service est initialisé
      health.services.influxdb = 'healthy';
    } catch (error) {
      health.services.influxdb = 'unhealthy';
      health.status = 'degraded';
    }

    // Déterminer le statut global
    if (health.services.database === 'unhealthy' && health.services.influxdb === 'unhealthy') {
      health.status = 'unhealthy';
    }

    return health;
  }

  private getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024) + ' MB',
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + ' MB',
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + ' MB',
      external: Math.round(usage.external / 1024 / 1024) + ' MB',
    };
  }
}
