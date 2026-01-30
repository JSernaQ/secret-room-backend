import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  )

  const port = Number(process.env.PORT || 8080)

  await app.listen(port , '0.0.0.0');
  console.log(`Backend + WS listening in port ${port}`);
  
}
bootstrap();
