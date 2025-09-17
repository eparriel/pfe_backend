import { IsString, IsNumber, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SensorType } from '@prisma/client';

export class SensorDataDto {
  @ApiProperty({
    description: 'ID unique de l\'appareil ESP32',
    example: 'ESP32_001',
    type: 'string',
    minLength: 1
  })
  @IsString()
  deviceId: string;

  @ApiProperty({
    description: 'Type de capteur',
    enum: SensorType,
    example: SensorType.TEMPERATURE,
    enumName: 'SensorType'
  })
  @IsEnum(SensorType)
  sensorType: SensorType;

  @ApiProperty({
    description: 'Valeur mesurée par le capteur',
    example: 25.5,
    type: 'number',
    minimum: -1000,
    maximum: 1000
  })
  @IsNumber()
  value: number;

  @ApiPropertyOptional({
    description: 'Unité de mesure',
    example: '°C',
    type: 'string',
    maxLength: 10
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({
    description: 'Métadonnées supplémentaires du capteur',
    example: { sensorId: 'temp_001', calibration: 'factory' },
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Timestamp Unix de la mesure (optionnel, défaut: maintenant)',
    example: 1640995200,
    type: 'number',
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  timestamp?: number; // Unix timestamp
}

export class BulkSensorDataDto {
  @ApiProperty({
    description: 'ID unique de l\'appareil ESP32',
    example: 'ESP32_001',
    type: 'string'
  })
  @IsString()
  deviceId: string;

  @ApiProperty({
    description: 'Données de plusieurs capteurs en une seule requête',
    example: {
      temperature: { value: 25.5, unit: '°C' },
      humidity: { value: 60.2, unit: '%' },
      light: { value: 450, unit: 'lux' }
    },
    type: 'object',
    additionalProperties: true
  })
  @IsObject()
  sensors: Record<string, {
    value: number;
    unit?: string;
    metadata?: Record<string, any>;
  }>;

  @ApiPropertyOptional({
    description: 'Timestamp Unix de la mesure (optionnel, défaut: maintenant)',
    example: 1640995200,
    type: 'number'
  })
  @IsOptional()
  @IsNumber()
  timestamp?: number;
}
