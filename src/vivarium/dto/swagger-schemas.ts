import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SensorType, CommandType, CommandStatus } from '@prisma/client';

// Schémas Swagger complets pour tous les DTOs

export class SensorDataDtoSchema {
  @ApiProperty({
    description: 'ID unique de l\'appareil ESP32',
    example: 'ESP32_001',
    type: 'string',
    minLength: 1
  })
  deviceId: string;

  @ApiProperty({
    description: 'Type de capteur',
    enum: SensorType,
    example: SensorType.TEMPERATURE,
    enumName: 'SensorType'
  })
  sensorType: SensorType;

  @ApiProperty({
    description: 'Valeur mesurée par le capteur',
    example: 25.5,
    type: 'number',
    minimum: -1000,
    maximum: 1000
  })
  value: number;

  @ApiPropertyOptional({
    description: 'Unité de mesure',
    example: '°C',
    type: 'string',
    maxLength: 10
  })
  unit?: string;

  @ApiPropertyOptional({
    description: 'Métadonnées supplémentaires du capteur',
    example: { sensorId: 'temp_001', calibration: 'factory' },
    type: 'object',
    additionalProperties: true
  })
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Timestamp Unix de la mesure (optionnel, défaut: maintenant)',
    example: 1640995200,
    type: 'number',
    minimum: 0
  })
  timestamp?: number;
}

export class BulkSensorDataDtoSchema {
  @ApiProperty({
    description: 'ID unique de l\'appareil ESP32',
    example: 'ESP32_001',
    type: 'string',
    minLength: 1
  })
  deviceId: string;

  @ApiProperty({
    description: 'Données de plusieurs capteurs en une seule requête',
    example: {
      temperature: { value: 25.5, unit: '°C' },
      humidity: { value: 60.2, unit: '%' },
      light: { value: 450, unit: 'lux' }
    },
    type: 'object',
    additionalProperties: {
      type: 'object',
      properties: {
        value: { type: 'number', example: 25.5 },
        unit: { type: 'string', example: '°C' },
        metadata: { type: 'object', additionalProperties: true }
      },
      required: ['value']
    }
  })
  sensors: Record<string, {
    value: number;
    unit?: string;
    metadata?: Record<string, any>;
  }>;

  @ApiPropertyOptional({
    description: 'Timestamp Unix de la mesure (optionnel, défaut: maintenant)',
    example: 1640995200,
    type: 'number',
    minimum: 0
  })
  timestamp?: number;
}

export class CreateVivariumDtoSchema {
  @ApiProperty({
    description: 'Nom du vivarium',
    example: 'Mon Vivarium',
    type: 'string',
    minLength: 1,
    maxLength: 100
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Localisation du vivarium',
    example: 'Salon',
    type: 'string',
    maxLength: 100
  })
  location?: string;

  @ApiPropertyOptional({
    description: 'ID unique de l\'appareil ESP32 associé',
    example: 'ESP32_001',
    type: 'string',
    minLength: 1,
    maxLength: 50
  })
  deviceId?: string;
}

export class UpdateVivariumDtoSchema {
  @ApiPropertyOptional({
    description: 'Nom du vivarium',
    example: 'Mon Nouveau Vivarium',
    type: 'string',
    minLength: 1,
    maxLength: 100
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Localisation du vivarium',
    example: 'Bureau',
    type: 'string',
    maxLength: 100
  })
  location?: string;

  @ApiPropertyOptional({
    description: 'ID unique de l\'appareil ESP32 associé',
    example: 'ESP32_002',
    type: 'string',
    minLength: 1,
    maxLength: 50
  })
  deviceId?: string;

  @ApiPropertyOptional({
    description: 'Statut de connexion de l\'appareil',
    example: true,
    type: 'boolean'
  })
  isOnline?: boolean;
}

export class CreateCommandDtoSchema {
  @ApiProperty({
    description: 'Type de commande à exécuter',
    enum: CommandType,
    example: CommandType.PUMP_ON,
    enumName: 'CommandType'
  })
  type: CommandType;

  @ApiProperty({
    description: 'Données spécifiques à la commande',
    example: { duration: 30, intensity: 80 },
    type: 'object',
    additionalProperties: true
  })
  payload: Record<string, any>;

  @ApiProperty({
    description: 'ID du vivarium cible',
    example: 1,
    type: 'number',
    minimum: 1
  })
  vivariumId: number;
}

export class DeviceStatusDtoSchema {
  @ApiProperty({
    description: 'ID unique de l\'appareil ESP32',
    example: 'ESP32_001',
    type: 'string',
    minLength: 1
  })
  deviceId: string;

  @ApiProperty({
    description: 'Statut de connexion de l\'appareil',
    example: 'online',
    enum: ['online', 'offline'],
    enumName: 'DeviceStatus'
  })
  status: 'online' | 'offline';

  @ApiPropertyOptional({
    description: 'Timestamp Unix de la dernière activité',
    example: 1640995200,
    type: 'number',
    minimum: 0
  })
  lastSeen?: number;

  @ApiPropertyOptional({
    description: 'Informations système de l\'appareil',
    example: {
      uptime: 3600,
      freeMemory: 2048,
      temperature: 45.2,
      version: '1.0.0'
    },
    type: 'object',
    additionalProperties: true
  })
  systemInfo?: Record<string, any>;
}

export class CommandResponseDtoSchema {
  @ApiProperty({
    description: 'ID unique de la commande',
    example: '1',
    type: 'string'
  })
  commandId: string;

  @ApiProperty({
    description: 'Type de commande',
    enum: CommandType,
    example: CommandType.PUMP_ON,
    enumName: 'CommandType'
  })
  type: CommandType;

  @ApiProperty({
    description: 'Données de la commande',
    example: { duration: 30, intensity: 80 },
    type: 'object',
    additionalProperties: true
  })
  payload: Record<string, any>;

  @ApiProperty({
    description: 'Statut de la commande',
    enum: CommandStatus,
    example: CommandStatus.EXECUTED,
    enumName: 'CommandStatus'
  })
  status: CommandStatus;

  @ApiPropertyOptional({
    description: 'Message d\'erreur si la commande a échoué',
    example: 'Pompe non disponible',
    type: 'string'
  })
  errorMessage?: string;

  @ApiProperty({
    description: 'Timestamp Unix de création',
    example: 1640995200,
    type: 'number'
  })
  createdAt: number;

  @ApiPropertyOptional({
    description: 'Timestamp Unix d\'exécution',
    example: 1640995260,
    type: 'number'
  })
  executedAt?: number;
}

export class VivariumResponseDtoSchema {
  @ApiProperty({
    description: 'ID unique du vivarium',
    example: 1,
    type: 'number'
  })
  id: number;

  @ApiProperty({
    description: 'Nom du vivarium',
    example: 'Mon Vivarium',
    type: 'string'
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Localisation du vivarium',
    example: 'Salon',
    type: 'string'
  })
  location?: string;

  @ApiPropertyOptional({
    description: 'ID unique de l\'appareil ESP32 associé',
    example: 'ESP32_001',
    type: 'string'
  })
  deviceId?: string;

  @ApiProperty({
    description: 'Statut de connexion de l\'appareil',
    example: true,
    type: 'boolean'
  })
  isOnline: boolean;

  @ApiPropertyOptional({
    description: 'Date de dernière activité',
    example: '2025-09-16T21:30:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  lastSeen?: string;

  @ApiProperty({
    description: 'Date de création',
    example: '2025-09-16T21:30:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  createdAt: string;

  @ApiProperty({
    description: 'ID de l\'utilisateur propriétaire',
    example: 1,
    type: 'number'
  })
  userId: number;
}

// Schémas pour les enums
export class SensorTypeEnum {
  @ApiProperty({
    description: 'Types de capteurs supportés',
    enum: SensorType,
    enumName: 'SensorType',
    example: SensorType.TEMPERATURE
  })
  static readonly values = SensorType;
}

export class CommandTypeEnum {
  @ApiProperty({
    description: 'Types de commandes supportées',
    enum: CommandType,
    enumName: 'CommandType',
    example: CommandType.PUMP_ON
  })
  static readonly values = CommandType;
}

export class CommandStatusEnum {
  @ApiProperty({
    description: 'Statuts de commandes possibles',
    enum: CommandStatus,
    enumName: 'CommandStatus',
    example: CommandStatus.PENDING
  })
  static readonly values = CommandStatus;
}

