import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { VivariumService } from './vivarium.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateVivariumDto, UpdateVivariumDto } from './dto/vivarium.dto';
import { SensorDataDto, BulkSensorDataDto } from './dto/sensor-data.dto';
import { CreateCommandDto, DeviceStatusDto } from './dto/command.dto';
import { SensorType } from '@prisma/client';

@ApiTags('Vivarium')
@Controller('vivarium')
export class VivariumController {
  constructor(private readonly vivariumService: VivariumService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Créer un nouveau vivarium',
    description: 'Crée un nouveau vivarium pour l\'utilisateur connecté. Un bucket InfluxDB sera automatiquement créé pour stocker les données de capteurs.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Vivarium créé avec succès',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Mon Vivarium' },
        location: { type: 'string', example: 'Salon' },
        deviceId: { type: 'string', example: 'ESP32_001' },
        userId: { type: 'number', example: 1 },
        isOnline: { type: 'boolean', example: false },
        lastSeen: { type: 'string', example: null },
        createdAt: { type: 'string', example: '2025-09-16T21:30:00.000Z' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Non autorisé - Token JWT requis' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async createVivarium(@Request() req, @Body() createVivariumDto: CreateVivariumDto) {
    return this.vivariumService.createVivarium(req.user.id, createVivariumDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getVivariums(@Request() req) {
    return this.vivariumService.getVivariumsByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getVivarium(@Request() req, @Param('id') id: string) {
    return this.vivariumService.getVivariumById(+id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateVivarium(
    @Request() req,
    @Param('id') id: string,
    @Body() updateVivariumDto: UpdateVivariumDto,
  ) {
    return this.vivariumService.updateVivarium(+id, req.user.id, updateVivariumDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteVivarium(@Request() req, @Param('id') id: string) {
    return this.vivariumService.deleteVivarium(+id, req.user.id);
  }

  // Endpoints pour l'ESP32 (sans authentification JWT)
  @Post('device/sensor-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Envoyer des données de capteur (ESP32 → API)' })
  @ApiResponse({ status: 200, description: 'Données traitées avec succès' })
  @ApiResponse({ status: 404, description: 'Vivarium non trouvé pour cet appareil' })
  @ApiBody({ type: SensorDataDto })
  async receiveSensorData(@Body() sensorDataDto: SensorDataDto) {
    return this.vivariumService.processSensorData(sensorDataDto);
  }

  @Post('device/bulk-sensor-data')
  @HttpCode(HttpStatus.OK)
  async receiveBulkSensorData(@Body() bulkDataDto: BulkSensorDataDto) {
    return this.vivariumService.processBulkSensorData(bulkDataDto);
  }

  @Get('device/:deviceId/commands')
  async getPendingCommands(@Param('deviceId') deviceId: string) {
    return this.vivariumService.getPendingCommandsForDevice(deviceId);
  }

  @Post('device/status')
  @HttpCode(HttpStatus.OK)
  async updateDeviceStatus(@Body() statusDto: DeviceStatusDto) {
    return this.vivariumService.updateDeviceStatus(statusDto.deviceId, statusDto.status === 'online');
  }

  // Endpoints pour les commandes (authentifiés)
  @UseGuards(JwtAuthGuard)
  @Post(':id/commands')
  async createCommand(
    @Request() req,
    @Param('id') vivariumId: string,
    @Body() createCommandDto: CreateCommandDto,
  ) {
    return this.vivariumService.createCommand(req.user.id, {
      ...createCommandDto,
      vivariumId: +vivariumId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/commands')
  async getCommands(@Request() req, @Param('id') vivariumId: string) {
    return this.vivariumService.getCommandsForVivarium(+vivariumId, req.user.id);
  }

  // Endpoints pour les données des capteurs
  @UseGuards(JwtAuthGuard)
  @Get(':id/sensor-data/:sensorType')
  async getSensorData(
    @Request() req,
    @Param('id') vivariumId: string,
    @Param('sensorType') sensorType: string,
    @Query('timeRange') timeRange?: string,
  ) {
    const hours = timeRange ? parseInt(timeRange, 10) : 24;
    return this.vivariumService.getSensorData(+vivariumId, req.user.id, sensorType, hours);
  }

  // Endpoints pour la gestion des capteurs
  @UseGuards(JwtAuthGuard)
  @Post(':id/sensors')
  async addSensor(
    @Request() req,
    @Param('id') vivariumId: string,
    @Body() sensorData: {
      name: string;
      type: SensorType;
      unit?: string;
      minValue?: number;
      maxValue?: number;
    },
  ) {
    return this.vivariumService.addSensor(+vivariumId, req.user.id, sensorData);
  }

  @UseGuards(JwtAuthGuard)
  @Put('sensors/:sensorId')
  async updateSensor(
    @Request() req,
    @Param('sensorId') sensorId: string,
    @Body() updateData: {
      name?: string;
      unit?: string;
      minValue?: number;
      maxValue?: number;
      isActive?: boolean;
    },
  ) {
    return this.vivariumService.updateSensor(+sensorId, req.user.id, updateData);
  }
}
