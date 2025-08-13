import { Controller, Get, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AppService } from './app.service';

@ApiTags('Application')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Endpoint de test principal' })
  @ApiResponse({ status: 200, description: 'API fonctionnelle' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Healthcheck complet de l\'API' })
  @ApiResponse({ 
    status: 200, 
    description: 'API en bonne santé',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2025-08-13T06:40:50.633Z' },
        uptime: { type: 'number', example: 45.65 },
        environment: { type: 'string', example: 'development' },
        version: { type: 'string', example: '1.0.0' },
        services: {
          type: 'object',
          properties: {
            api: { type: 'string', example: 'healthy' },
            database: { type: 'string', example: 'healthy' },
            influxdb: { type: 'string', example: 'healthy' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 503, description: 'API en mauvaise santé' })
  async getHealth() {
    return await this.appService.checkHealth();
  }

  @Get('health/simple')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Healthcheck simple (ping/pong)' })
  @ApiResponse({ status: 200, description: 'API accessible' })
  getSimpleHealth() {
    return {
      status: 'ok',
      message: 'pong',
      timestamp: new Date().toISOString()
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Profil de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Profil récupéré avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  getProfile(@Request() req) {
    return req.user;
  }
}
