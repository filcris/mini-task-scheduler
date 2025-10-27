import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReportsModule } from './reports/reports.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
  PrismaModule,
    UsersModule,
    AuthModule,
    HealthModule,
    TasksModule,
    ReportsModule,
    WebsocketModule,
  ],
})
export class AppModule {}








