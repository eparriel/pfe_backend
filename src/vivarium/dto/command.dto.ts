import { IsString, IsEnum, IsObject, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommandType } from '@prisma/client';

export class CreateCommandDto {
  @ApiProperty({
    description: 'Type de commande à exécuter',
    enum: CommandType,
    example: CommandType.PUMP_ON
  })
  @IsEnum(CommandType)
  type: CommandType;

  @ApiProperty({
    description: 'Données spécifiques à la commande',
    example: { duration: 30, intensity: 80 },
    type: 'object',
    additionalProperties: true
  })
  @IsObject()
  payload: Record<string, any>;

  @ApiProperty({
    description: 'ID du vivarium cible',
    example: 1,
    type: 'number'
  })
  @IsNumber()
  vivariumId: number;
}

export class CommandResponseDto {
  @IsString()
  commandId: string;

  @IsEnum(CommandType)
  type: CommandType;

  @IsObject()
  payload: Record<string, any>;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsNumber()
  createdAt: number;

  @IsOptional()
  @IsNumber()
  executedAt?: number;
}

export class DeviceStatusDto {
  @IsString()
  deviceId: string;

  @IsString()
  status: 'online' | 'offline';

  @IsOptional()
  @IsNumber()
  lastSeen?: number;

  @IsOptional()
  @IsObject()
  systemInfo?: Record<string, any>;
}
