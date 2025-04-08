import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { InfluxModule } from './influx.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('InfluxMicroservice');
  
  try {
    logger.log('Starting InfluxDB microservice...');
    
    // Créer l'application NestJS sans écoute HTTP
    logger.log('Creating NestJS application...');
    const app = await NestFactory.create(InfluxModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Récupérer le service de configuration
    logger.log('Getting ConfigService...');
    const configService = app.get(ConfigService);
    
    // Vérifier que les variables d'environnement sont bien définies
    logger.log('Loading environment variables...');
    const rabbitMqUrl = configService.get<string>('RABBITMQ_URL');
    const influxDbUrl = configService.get<string>('INFLUXDB_URL');
    const influxDbToken = configService.get<string>('INFLUXDB_TOKEN');
    const influxDbOrg = configService.get<string>('INFLUXDB_ORG');
    
    logger.log('Environment variables loaded:');
    logger.log(`- RABBITMQ_URL: ${rabbitMqUrl}`);
    logger.log(`- INFLUXDB_URL: ${influxDbUrl}`);
    logger.log(`- INFLUXDB_TOKEN: ${influxDbToken ? '***' : 'not defined'}`);
    logger.log(`- INFLUXDB_ORG: ${influxDbOrg}`);
    
    if (!influxDbUrl || !influxDbToken || !influxDbOrg) {
      throw new Error('Missing required environment variables for InfluxDB');
    }
    
    // Configurer le microservice
    logger.log('Configuring RabbitMQ microservice...');
    const microservice = app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitMqUrl],
        queue: 'influx_queue',
        queueOptions: {
          durable: true,
        },
        noAck: false,
        prefetchCount: 1,
      },
    });

    // Démarrer le microservice
    logger.log('Starting microservices...');
    await app.startAllMicroservices();
    
    logger.log('Influx microservice is running and connected to RabbitMQ');
    logger.log('Ready to process messages from queue: influx_queue');
    logger.log('Press Ctrl+C to stop the service');
  } catch (error) {
    logger.error('Failed to start InfluxDB microservice:', error);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

bootstrap(); 