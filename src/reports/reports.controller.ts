import { AuthGuard } from '@/guards/auth.guard';
import { Serialize } from '@/interceptors/serialize.interceptor';
import { CurrentUser } from '@/users/decorators/current-user.decorator';
import { User } from '@/users/users.entity';
import {
  Body,
  Controller,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateReportDto } from './dtos/create-report.dto';
import { ReportDto } from './dtos/report.dto';
import { UpdateReportDto } from './dtos/update-report.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
@Serialize(ReportDto)
export class ReportsController {
  constructor(private reportService: ReportsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() body: CreateReportDto, @CurrentUser() user: User) {
    return this.reportService.create(body, user);
  }

  findAll(criteria?: {
    make?: string;
    model?: string;
    year?: number;
    mileage?: number;
    price?: number;
  }) {
    if (criteria) {
      try {
        return this.reportService.findAll(criteria);
      } catch (error) {
        return [];
      }
    }
    try {
      return this.reportService.findAll();
    } catch (error) {
      return [];
    }
  }

  findOne(criteria: {
    id?: number;
    price?: number;
    mileage?: number;
    make?: string;
    model?: string;
    year?: number;
  }) {
    try {
      const report = this.reportService.findOne(criteria);

      if (!report) {
        throw new NotFoundException('Report not found');
      }

      return report;
    } catch (error) {
      throw new NotFoundException('Report not found');
    }
  }

  update(id: number, attrs: UpdateReportDto) {
    try {
      const report = this.reportService.update(id, attrs);

      if (!report) {
        throw new NotFoundException('Report not found');
      }

      return report;
    } catch (error) {
      throw new NotFoundException('Report not found');
    }
  }

  remove(id: number) {
    try {
      const report = this.reportService.remove(id);

      if (!report) {
        throw new NotFoundException('Report not found');
      }

      return report;
    } catch (error) {
      throw new NotFoundException('Report not found');
    }
  }
}
