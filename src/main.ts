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
import MongoStore from 'connect-mongo';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configsService: ConfigsService = app.get(ConfigsService);

  const port = configsService.get('PORT');
  const dbUrl = configsService.get('MONGODB_URI_LOCAL');
  const sessionSecret = configsService.get('SESSION_SECRET');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  console.log(process.env.MONGODB_URI_LOCAL);
  app.use(
    session({
      cookie: {
        secure: true,
        maxAge: 60000,
      },
      secret: sessionSecret,
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({
        mongoUrl: dbUrl,
        autoRemove: 'disabled',
      }),
    }),
  );
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.enableCors();
  app.use(helmet());
  // app.useGlobalInterceptors(new TimeoutInterceptor());
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
