import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.modules';

@Module({
  imports: [AuthModule],
})
export class ServiceModules {}
