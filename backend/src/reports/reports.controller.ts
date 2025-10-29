import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportsService } from './reports.service';

interface JwtPayload {
  sub: string;
  email: string;
}

export interface ReportsSummaryDto {
  total: number;
  todo: number;
  doing: number;
  done: number;
  overdue: number;
}

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('summary')
  @ApiOkResponse({ description: 'Summary counters' })
  async summary(@Req() req: { user: JwtPayload }): Promise<ReportsSummaryDto> {
    return this.reports.summary(req.user.sub);
  }
}

