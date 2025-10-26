import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TasksService } from './tasks.service';
import { QueryTasksDto } from './dto/query-tasks.dto';

// Helper robusto para extrair o ID do utilizador do token (req.user)
function getUserId(req: any): string {
  const id = req?.user?.sub ?? req?.user?.id ?? req?.user?.userId;
  if (!id) throw new UnauthorizedException('Missing user id in token');
  return id;
}

@UseGuards(JwtAuthGuard) // protege todas as rotas deste controller
@Controller('tasks')     // prefixo global 'api' -> rotas finais /api/tasks
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  list(@Req() req, @Query() q: QueryTasksDto) {
    return this.tasks.findAll(getUserId(req), q);
  }

  @Post()
  create(
    @Req() req,
    @Body()
    body: {
      title: string;
      priority?: 'low' | 'medium' | 'high';
      dueAt?: string;
    },
  ) {
    const dueAt = body.dueAt ? new Date(body.dueAt) : undefined;
    return this.tasks.create(getUserId(req), {
      title: body.title,
      priority: body.priority ?? 'medium',
      dueAt,
    });
  }

  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() body: any) {
    return this.tasks.update(getUserId(req), id, body);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.tasks.remove(getUserId(req), id);
  }
}





