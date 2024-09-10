import { Module } from '@nestjs/common';
import { ServiceModules } from './modules/service.modules';
import { PrismaService } from './prisma.service';

@Module({
  imports: [ServiceModules],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}

// import {
//   MiddlewareConsumer,
//   Module,
//   NestModule,
//   RequestMethod,
// } from '@nestjs/common';
// import { JwtMiddleware } from './middlewares/logout';
// import { ServiceModules } from './modules/service.modules';
// import { PrismaService } from './prisma.service';
// import { AuthGuard } from './modules/auths/auth.guard';

// @Module({
//   imports: [ServiceModules],
//   providers: [JwtMiddleware, PrismaService],
// })
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(JwtMiddleware)
//       .exclude(
//         { path: '/auth/login', method: RequestMethod.POST },
//         { path: '/auth/register', method: RequestMethod.POST },
//       )
//       .forRoutes('*');
//   }
// }
