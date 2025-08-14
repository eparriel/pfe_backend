import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InfluxService } from './influx.service';

interface MeasurementDto {
  vivariumId: number;
  measurement: string;
  value: number;
  tags?: Record<string, string>;
}

interface QueryDto {
  vivariumId: number;
  measurement: string;
  timeRange?: number;
}

@Controller()
export class InfluxController {
  private readonly logger = new Logger(InfluxController.name);

  constructor(private readonly influxService: InfluxService) {}

  @MessagePattern('influx.create_bucket')
  async createBucket(@Payload() vivariumId: number) {
    this.logger.log(`Creating bucket for vivarium: ${vivariumId}`);
    return this.influxService.createBucketForVivarium(vivariumId);
  }

  @MessagePattern('influx.insert_data')
  async insertData(@Payload() data: MeasurementDto) {
    this.logger.log(`Inserting data for vivarium: ${data.vivariumId}`);
    return this.influxService.insertData(
      data.vivariumId,
      data.measurement,
      data.value,
      data.tags,
    );
  }

  @MessagePattern('influx.get_data')
  async getData(@Payload() query: QueryDto) {
    this.logger.log(`Getting data for vivarium: ${query.vivariumId}`);
    return this.influxService.getLatestData(
      query.vivariumId,
      query.measurement,
      query.timeRange,
    );
  }

  @MessagePattern('influx.delete_bucket')
  async deleteBucket(@Payload() vivariumId: number) {
    this.logger.log(`Deleting bucket for vivarium: ${vivariumId}`);
    return this.influxService.deleteBucketForVivarium(vivariumId);
  }
}
