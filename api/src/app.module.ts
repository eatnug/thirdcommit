import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ClsModule, ClsMiddleware } from 'nestjs-cls';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantModule } from './tenant/tenant.module';
import { TenantMiddleware } from './tenant/tenant.middleware';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectAModule } from './projects/project-a/project-a.module';
import { ProjectBModule } from './projects/project-b/project-b.module';

@Module({
  imports: [
    // ClsModule for AsyncLocalStorage-based context management
    ClsModule.forRoot({
      global: true,
      middleware: { mount: false }, // We'll apply it manually for ordering
    }),
    // Global modules
    TenantModule,
    PrismaModule,
    // Project modules
    ProjectAModule,
    ProjectBModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply ClsMiddleware first to set up async context
    consumer.apply(ClsMiddleware).forRoutes('*');
    // Then apply tenant middleware to extract and set tenant ID
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
