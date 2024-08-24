import { AuthGuard } from '@/guards/auth.guard';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateReportDto } from './dtos/create-report.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private reportService: ReportsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() body: CreateReportDto) {
    return this.reportService.create(body);
  }

  findAll() {
    return null;
  }

  findOne() {
    return null;
  }

  update() {
    return null;
  }

  remove() {
    return null;
  }
}
