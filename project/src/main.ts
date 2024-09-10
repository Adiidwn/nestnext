import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api/v1');
  const PORT = process.env.PORT;
  if (PORT === undefined) {
    throw new Error('PORT must be defined');
  }
  await app.listen(PORT);
  console.log(`Application is running on: ${PORT}`);
}
bootstrap();
