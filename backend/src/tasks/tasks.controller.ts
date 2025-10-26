import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

interface JwtPayload {
  sub: string;
  email: string;
}

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  async list(
    @Req() req: { user: JwtPayload },
    @Query() query: QueryTasksDto,
  ) {
    return this.tasks.findAll(req.user.sub, query);
  }

  @Post()
  async create(
    @Req() req: { user: JwtPayload },
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasks.create(req.user.sub, dto);
  }

  @Patch(':id')
  async update(
    @Req() req: { user: JwtPayload },
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasks.update(req.user.sub, id, dto);
  }

  @Delete(':id')
  async remove(@Req() req: { user: JwtPayload }, @Param('id') id: string) {
    return this.tasks.remove(req.user.sub, id);
  }
}






