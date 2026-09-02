import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filter/all-exception.filter';
import * as cookieParser from "cookie-parser"; 

export class App {
  static async main() {
    const app = await NestFactory.create(AppModule);
    const PORT = env.PORT;
    const url = 'api/v1';

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.useGlobalFilters(new AllExceptionsFilter());
    app.use(helmet());
    
    app.use(cookieParser.default());

    app.enableCors({ origin: '*' });
    app.setGlobalPrefix(url);

    const config = new DocumentBuilder()
      .setTitle('Uzum marketplace production project')
      .setDescription('Marketplace microservice')
      .setVersion('1.0')
      .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${url}/docs`, app, documentFactory);

    app.listen(env.PORT ?? 3050, () => {
      console.log(`Server is running on http://localhost:${env.PORT}/${url}`);
      console.log(`Swagger is running on http://localhost:${env.PORT}/${url}/docs`);
    });
  }
}
