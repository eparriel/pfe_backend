import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('general')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Test de santé', description: 'Endpoint de test pour vérifier que l\'API fonctionne' })
  @ApiResponse({ status: 200, description: 'API fonctionnelle', example: 'Hello World!' })
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Profil utilisateur', description: 'Récupère le profil de l\'utilisateur connecté' })
  @ApiResponse({ 
    status: 200, 
    description: 'Profil utilisateur récupéré',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        email: { type: 'string', example: 'john.doe@example.com' },
        name: { type: 'string', example: 'John Doe' },
        role: { type: 'string', example: 'user' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Non autorisé - Token JWT requis' })
  getProfile(@Request() req) {
    // req.user contient les données décodées du JWT par la stratégie JWT
    return req.user;
  }
}
