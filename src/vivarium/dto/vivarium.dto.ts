import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVivariumDto {
  @ApiProperty({
    description: 'Nom du vivarium',
    example: 'Mon Vivarium',
    type: 'string'
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Localisation du vivarium',
    example: 'Salon',
    type: 'string'
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'ID unique de l\'appareil ESP32 associé',
    example: 'ESP32_001',
    type: 'string'
  })
  @IsOptional()
  @IsString()
  deviceId?: string;
}

export class UpdateVivariumDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;
}

export class VivariumResponseDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsBoolean()
  isOnline: boolean;

  @IsOptional()
  @IsString()
  lastSeen?: string;

  @IsString()
  createdAt: string;

  @IsNumber()
  userId: number;
}
