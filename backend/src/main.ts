import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ScannerService } from './services/scanner.service';
import { ValidationPipe } from '@nestjs/common';
import { config } from './config';
import { HttpExceptionFilter } from './exception.filter';

const address = config.flow.deploymentAccountAddress?.replace('0x', '');

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: '*' });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  const flowService = app.get(ScannerService);
  flowService.init([
    // TODO: handle profile updates
    `A.${address}.bluefi.Donation`,
    `A.${address}.bluefi.Registration`,
  ]);
  flowService.start();
  await app.listen(config.port);
}

bootstrap();
