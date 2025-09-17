import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVivariumDto, UpdateVivariumDto } from './dto/vivarium.dto';
import { SensorDataDto, BulkSensorDataDto } from './dto/sensor-data.dto';
import { CreateCommandDto } from './dto/command.dto';
import { InfluxService } from '../influx/influx.service';
import { CommandStatus, SensorType } from '@prisma/client';

@Injectable()
export class VivariumService {
  private readonly logger = new Logger(VivariumService.name);

  constructor(
    private prisma: PrismaService,
    private influxService: InfluxService,
  ) {}

  async createVivarium(userId: number, createVivariumDto: CreateVivariumDto) {
    const vivarium = await this.prisma.vivarium.create({
      data: {
        ...createVivariumDto,
        userId,
      },
    });

    // Créer le bucket InfluxDB pour ce vivarium
    await this.influxService.createBucketForVivarium(vivarium.id);

    this.logger.log(`Created vivarium ${vivarium.id} for user ${userId}`);
    return vivarium;
  }

  async getVivariumsByUser(userId: number) {
    return this.prisma.vivarium.findMany({
      where: { userId },
      include: {
        sensors: true,
        _count: {
          select: {
            commands: true,
          },
        },
      },
    });
  }

  async getVivariumById(id: number, userId: number) {
    const vivarium = await this.prisma.vivarium.findUnique({
      where: { id },
      include: {
        sensors: true,
        commands: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!vivarium) {
      throw new NotFoundException('Vivarium not found');
    }

    if (vivarium.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return vivarium;
  }

  async updateVivarium(id: number, userId: number, updateVivariumDto: UpdateVivariumDto) {
    const vivarium = await this.getVivariumById(id, userId);

    return this.prisma.vivarium.update({
      where: { id },
      data: updateVivariumDto,
    });
  }

  async deleteVivarium(id: number, userId: number) {
    const vivarium = await this.getVivariumById(id, userId);

    // Supprimer le bucket InfluxDB
    await this.influxService.deleteBucketForVivarium(id);

    return this.prisma.vivarium.delete({
      where: { id },
    });
  }

  async getVivariumByDeviceId(deviceId: string) {
    return this.prisma.vivarium.findUnique({
      where: { deviceId },
      include: {
        sensors: true,
      },
    });
  }

  async updateDeviceStatus(deviceId: string, isOnline: boolean) {
    try {
      return await this.prisma.vivarium.update({
        where: { deviceId },
        data: {
          isOnline,
          lastSeen: new Date(),
        },
      });
    } catch (error) {
      this.logger.warn(`Vivarium with deviceId ${deviceId} not found, skipping status update`);
      return null;
    }
  }

  async processSensorData(sensorDataDto: SensorDataDto) {
    const vivarium = await this.getVivariumByDeviceId(sensorDataDto.deviceId);
    
    if (!vivarium) {
      throw new NotFoundException('Vivarium not found for device ID');
    }

    // Insérer les données dans InfluxDB
    await this.influxService.insertData(
      vivarium.id,
      sensorDataDto.sensorType.toLowerCase(),
      sensorDataDto.value,
      {
        deviceId: sensorDataDto.deviceId,
        unit: sensorDataDto.unit || '',
        ...sensorDataDto.metadata,
      },
    );

    // Mettre à jour le statut du vivarium
    await this.updateDeviceStatus(sensorDataDto.deviceId, true);

    this.logger.log(`Processed sensor data for vivarium ${vivarium.id}`);
    return { success: true };
  }

  async processBulkSensorData(bulkDataDto: BulkSensorDataDto) {
    const vivarium = await this.getVivariumByDeviceId(bulkDataDto.deviceId);
    
    if (!vivarium) {
      throw new NotFoundException('Vivarium not found for device ID');
    }

    // Traiter chaque capteur
    for (const [sensorType, data] of Object.entries(bulkDataDto.sensors)) {
      await this.influxService.insertData(
        vivarium.id,
        sensorType.toLowerCase(),
        data.value,
        {
          deviceId: bulkDataDto.deviceId,
          unit: data.unit || '',
          ...data.metadata,
        },
      );
    }

    // Mettre à jour le statut du vivarium
    await this.updateDeviceStatus(bulkDataDto.deviceId, true);

    this.logger.log(`Processed bulk sensor data for vivarium ${vivarium.id}`);
    return { success: true };
  }

  async createCommand(userId: number, createCommandDto: CreateCommandDto) {
    const vivarium = await this.getVivariumById(createCommandDto.vivariumId, userId);

    const command = await this.prisma.command.create({
      data: {
        ...createCommandDto,
        userId,
      },
    });

    this.logger.log(`Created command ${command.id} for vivarium ${vivarium.id}`);
    return command;
  }

  async getCommandsForVivarium(vivariumId: number, userId: number) {
    const vivarium = await this.getVivariumById(vivariumId, userId);

    return this.prisma.command.findMany({
      where: { vivariumId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getPendingCommandsForDevice(deviceId: string) {
    const vivarium = await this.getVivariumByDeviceId(deviceId);
    
    if (!vivarium) {
      return [];
    }

    return this.prisma.command.findMany({
      where: {
        vivariumId: vivarium.id,
        status: CommandStatus.PENDING,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateCommandStatus(commandId: number, status: CommandStatus, errorMessage?: string) {
    return this.prisma.command.update({
      where: { id: commandId },
      data: {
        status,
        executedAt: status === CommandStatus.EXECUTED ? new Date() : undefined,
        errorMessage,
      },
    });
  }

  async getSensorData(vivariumId: number, userId: number, sensorType: string, timeRange: number = 24) {
    const vivarium = await this.getVivariumById(vivariumId, userId);
    
    return this.influxService.getLatestData(vivariumId, sensorType, timeRange);
  }

  async addSensor(vivariumId: number, userId: number, sensorData: {
    name: string;
    type: SensorType;
    unit?: string;
    minValue?: number;
    maxValue?: number;
  }) {
    const vivarium = await this.getVivariumById(vivariumId, userId);

    return this.prisma.sensor.create({
      data: {
        ...sensorData,
        vivariumId,
      },
    });
  }

  async updateSensor(sensorId: number, userId: number, updateData: {
    name?: string;
    unit?: string;
    minValue?: number;
    maxValue?: number;
    isActive?: boolean;
  }) {
    // Vérifier que l'utilisateur a accès au capteur
    const sensor = await this.prisma.sensor.findUnique({
      where: { id: sensorId },
      include: { vivarium: true },
    });

    if (!sensor || sensor.vivarium.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.sensor.update({
      where: { id: sensorId },
      data: updateData,
    });
  }
}
