import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TasksRepository } from './repositories/tasks.repository';
import { FirestoreModule } from '../firestore/firestore.module';

@Module({
  imports: [FirestoreModule],
  controllers: [TasksController],
  providers: [TasksService, TasksRepository],
  exports: [TasksService],
})
export class TasksModule {}
