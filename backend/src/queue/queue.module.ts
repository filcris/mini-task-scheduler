import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { TasksOverdueProcessor } from './tasks-overdue.processor';
import { TasksOverdueService } from './tasks-overdue.service';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

@Module({
  imports: [
    PrismaModule,
    BullModule.forRoot({
      connection: redisUrl,
    }),
    BullModule.registerQueue({
      name: 'tasks',
    }),
  ],
  providers: [TasksOverdueProcessor, TasksOverdueService],
  exports: [],
})
export class QueueModule {}
