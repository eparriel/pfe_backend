import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// helmet import removed for testing

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration de sécurité Helmet avec exceptions pour Swagger
  // TEMPORAIREMENT DÉSACTIVÉ POUR TESTER SWAGGER
  /*
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        connectSrc: ["'self'", "https:", "wss:"],
        frameSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        workerSrc: ["'self'", "blob:"],
        manifestSrc: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  }));
  */

  // Configuration CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8080',
      'http://localhost:4200',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400, // 24 heures
  });

  // Activer la validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('API Vivarium - PFE Backend')
    .setDescription(
      "API complète pour la gestion de vivariums connectés avec ESP32. Permet de recevoir des données de capteurs, envoyer des commandes et gérer les vivariums en temps réel.",
    )
    .setVersion('1.0')
    .addTag('auth', "Endpoints d'authentification")
    .addTag('users', 'Gestion des utilisateurs')
    .addTag('Vivarium', 'Gestion des vivariums, capteurs et commandes')
    .addTag('influx', 'Gestion des données temporelles InfluxDB')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Entrez votre token JWT',
        in: 'header',
      },
      'JWT-auth', // This name here is important for references
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [],
  });
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
      deepLinking: true,
      displayOperationId: true,
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'PFE Backend API Documentation',
    customfavIcon: '/api/favicon-32x32.png',
    customJs: '/api/swagger-ui-init.js',
    customCssUrl: '/api/swagger-ui.css',
  });

  await app.listen(process.env.PORT ?? 3000);

  console.log(
    `🚀 Application is running on: http://localhost:${process.env.PORT ?? 3000}`,
  );
  console.log(
    `📚 Documentation Swagger: http://localhost:${process.env.PORT ?? 3000}/api`,
  );
  console.log(`🛡️  Security headers disabled for testing Swagger`);
  console.log(`🌐 CORS configured for cross-origin requests`);
}
bootstrap();
