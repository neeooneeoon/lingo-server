import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
    })
    .setTitle('Swagger SMLing')
    .setDescription('The SMLing API description')
    .setVersion('2.0.0')
    .addTag('books')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  await app.listen(process.env.PORT || 8080);
  console.log('\nCOMPILE SUCCESS!');
  console.log(
    '\n' +
      '🚀 Swagger UI running at ' +
      '\u001b[' +
      32 +
      'm' +
      `http://0.0.0.0:${process.env.PORT || 8080}/api-docs` +
      '\u001b[0m',
  );
}
bootstrap();
