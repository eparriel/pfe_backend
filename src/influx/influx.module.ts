import { Module } from '@nestjs/common';
import { InfluxService } from './influx.service';
import { InfluxController } from './influx.controller';
import { InfluxClientService } from './influx-client.service';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '.env'),
      cache: true,
      expandVariables: true,
      ignoreEnvFile: false,
    }),
  ],
  controllers: [InfluxController],
  providers: [InfluxService, InfluxClientService],
  exports: [InfluxService, InfluxClientService],
})
export class InfluxModule {} 