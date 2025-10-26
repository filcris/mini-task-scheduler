import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class TasksOverdueService implements OnModuleInit {
  constructor(@InjectQueue('tasks') private queue: Queue) {}

  async onModuleInit() {
    if (process.env.QUEUE_ENABLED !== 'true') return;

    // cria/atualiza um job repetitivo que corre pelo CRON
    const cron = process.env.OVERDUE_CHECK_CRON || '*/1 * * * *';
    await this.queue.upsertJobScheduler('check-overdue-scheduler', {
      pattern: cron,
      tz: 'Etc/UTC',
    });

    await this.queue.add(
      'check-overdue',
      {},
      {
        repeat: { pattern: cron },
        jobId: 'check-overdue', // evita duplicados
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );

    console.log(`⏰ Overdue checker agendado com CRON: ${cron}`);
  }
}
