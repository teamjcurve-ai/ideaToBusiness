import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // 보안 헤더
  app.use(helmet());

  // CORS 설정
  app.enableCors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map((s) => s.trim())
      : 'http://localhost:3000',
    credentials: true,
  });

  // 전역 예외 필터
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 전역 Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 4001;
  await app.listen(port);
  logger.log(`서버가 포트 ${port}에서 실행 중입니다.`);
}
bootstrap();
