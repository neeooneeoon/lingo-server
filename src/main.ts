import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigsService } from '@configs';
import * as session from 'express-session';
import * as bodyParser from 'body-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');

  const configsService = app.get(ConfigsService);
  const port = configsService.get('PORT');
  const sessionSecret = configsService.get('SESSION_SECRET');

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

  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  await app.listen(port);
  console.log('\nCompile successfully!\n');
  console.log(`🚀 Lingo Server already listening at http://localhost:${port}`);
}
bootstrap();
