import {
  LoggerService,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerModule,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as helmet from 'helmet';
import { AppConfigService } from './config/app/config/config.service';
import { AllExceptionFilter } from './shared/module/error/all-exception-filter';
import { HttpLoggerService } from './shared/module/logger/http-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    allowedHeaders: '*',
  });
  const validations: ValidationPipeOptions = {
    // whitelist: true,
    // forbidNonWhitelisted: true,
    transform: true,
  };

  const appConfigService = app.get<AppConfigService>(AppConfigService);
  const logger = app.resolve<HttpLoggerService>(HttpLoggerService);

  app.useGlobalFilters(new AllExceptionFilter(await logger, appConfigService));
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe(validations));
  app.use(helmet());
  const config = new DocumentBuilder()
    .setTitle('Webcentriq Profile API Documents.')
    .setDescription('')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Webcentriq Profile',
    customfavIcon: '',
  };
  SwaggerModule.setup('docs', app, document, customOptions);
  await app.listen(appConfigService.PORT);
}
bootstrap();
