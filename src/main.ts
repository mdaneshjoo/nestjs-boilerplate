import './instrument';
import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { AuthService } from './app/auth/auth.service';
import { PermissionsGuard } from './app/auth/guards/permission.guard';
import { AppConfigService } from './config/app/config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  app.enableCors({
    origin: '*',
    allowedHeaders: '*',
  });
  const validations: ValidationPipeOptions = {
    transform: true,
  };

  const appConfigService = app.get<AppConfigService>(AppConfigService);
  const authService = await app.resolve<AuthService>(AuthService);

  app.useGlobalGuards(new PermissionsGuard(new Reflector(), authService));
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
