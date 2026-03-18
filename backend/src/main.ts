import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS 설정
  app.enableCors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',')
      : 'http://localhost:3000',
    credentials: true,
  });
  
  // 전역 Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
    }),
  );
  
  const port = process.env.PORT || 4001;
  await app.listen(port);
  console.log(`백엔드 서버가 포트 ${port}에서 실행 중입니다.`);
}
bootstrap();
