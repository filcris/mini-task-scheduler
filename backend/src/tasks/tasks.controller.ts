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
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { TasksService } from './tasks.service'
import { CreateTaskDto } from './dto/create-task.dto'

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  list(@Req() req: any, @Query() query: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId
    return this.tasksService.list(userId, query)
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateTaskDto) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId
    return this.tasksService.create(userId, dto)
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: Partial<CreateTaskDto>) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId
    return this.tasksService.update(userId, id, dto)
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId
    return this.tasksService.remove(userId, id)
  }
}











