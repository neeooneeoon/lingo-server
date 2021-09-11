import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigsService } from '@configs';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import compression from 'compression';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import { AppClusterService } from './app-cluster.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configsService: ConfigsService = app.get(ConfigsService);

  const port = configsService.get('PORT');
  /*Config firebase*/
  const adminConfig: ServiceAccount = {
    projectId: configsService.get('FIREBASE_PROJECT_ID'),
    privateKey: configsService
      .get('FIREBASE_PRIVATE_KEY')
      .replace(/\\n/g, '\n'),
    clientEmail: configsService.get('FIREBASE_CLIENT_EMAIL'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
    databaseURL: configsService.get('DATABASE_URL'),
  });

  /*Interceptors and extensions*/
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.enableCors();
  app.use(helmet());
  app.use(compression());
  /*Config swagger module*/
  const openApiConfig = new DocumentBuilder()
    .addBearerAuth({
      type: 'http',
      scheme: 'Bearer',
      bearerFormat: 'JWT',
      in: 'header',
    })
    .setTitle('Lingo Server API Document')
    .setVersion('0.0.1')
    .build();
  const apiDocument = SwaggerModule.createDocument(app, openApiConfig);
  SwaggerModule.setup('api-docs', app, apiDocument);

  await app.listen(port);
  console.log('\nCompile successfully!\n');
  console.log(`🚀 Lingo Server is listening at http://localhost:${port}`);
}
bootstrap();
// AppClusterService.clusterize(bootstrap);
