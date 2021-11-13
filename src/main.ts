import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { AuthService } from './app/auth/auth.service';
import { PermissionsGuard } from './app/auth/guards/permission.guard';
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

  const authService = app.resolve<AuthService>(AuthService);

  app.useGlobalFilters(new AllExceptionFilter(await logger, appConfigService));
  app.useGlobalGuards(new PermissionsGuard(new Reflector(), await authService));
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe(validations));
  app.use(helmet());
  const config = new DocumentBuilder()
    .setTitle(`${appConfigService.APP_NAME} API Documents.`)
    .setDescription('')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: `${appConfigService.APP_NAME}`,
    customfavIcon: '',
  };
  SwaggerModule.setup('docs', app, document, customOptions);
  await app.listen(appConfigService.PORT);
}
bootstrap();
