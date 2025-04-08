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
  
  // Configurer le microservice
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')],
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