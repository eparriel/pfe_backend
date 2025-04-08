import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { InfluxModule } from './influx.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('InfluxMicroservice');
  
  // Créer l'application NestJS
  const app = await NestFactory.create(InfluxModule);
  const configService = app.get(ConfigService);
  
  // Vérifier que les variables d'environnement sont bien définies
  const rabbitMqUrl = configService.get<string>('RABBITMQ_URL');
  const influxDbUrl = configService.get<string>('INFLUXDB_URL');
  const influxDbToken = configService.get<string>('INFLUXDB_TOKEN');
  const influxDbOrg = configService.get<string>('INFLUXDB_ORG');
  
  logger.log(`RABBITMQ_URL: ${rabbitMqUrl}`);
  logger.log(`INFLUXDB_URL: ${influxDbUrl}`);
  logger.log(`INFLUXDB_TOKEN: ${influxDbToken ? '***' : 'not defined'}`);
  logger.log(`INFLUXDB_ORG: ${influxDbOrg}`);
  
  if (!influxDbUrl || !influxDbToken || !influxDbOrg) {
    logger.error('Missing required environment variables for InfluxDB');
    process.exit(1);
  }
  
  // Configurer le microservice
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitMqUrl],
      queue: 'influx_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  // Démarrer le microservice
  await app.startAllMicroservices();
  
  logger.log('Influx microservice is running');
}

bootstrap(); 