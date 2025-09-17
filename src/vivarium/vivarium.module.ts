import { Module } from '@nestjs/common';
import { VivariumController } from './vivarium.controller';
import { VivariumService } from './vivarium.service';
import { VivariumWebSocketGateway } from './vivarium-websocket.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { InfluxModule } from '../influx/influx.module';

@Module({
  imports: [PrismaModule, InfluxModule],
  controllers: [VivariumController],
  providers: [VivariumService, VivariumWebSocketGateway],
  exports: [VivariumService, VivariumWebSocketGateway],
})
export class VivariumModule {}
