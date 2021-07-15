import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigsService } from '@configs';
import * as session from 'express-session';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppClusterService } from './app-cluster.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configsService: ConfigsService = app.get(ConfigsService);

  const port = configsService.get('PORT');
  const sessionSecret = configsService.get('SESSION_SECRET');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.enableCors();
  app.use(helmet());
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
// AppClusterService.clusterize(bootstrap);
bootstrap();
