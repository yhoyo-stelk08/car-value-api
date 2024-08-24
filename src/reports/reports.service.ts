import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dtos/create-report.dto';
import { Report } from './reports.entity';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  async create(createReportDto: CreateReportDto) {
    const report = this.repo.create(createReportDto);
    return await this.repo.save(report);
  }

  async findAll(): Promise<Report[]> {}

  async findOne(criteria: {
    id?: number;
    price?: number;
    mileage?: number;
    make?: string;
    model?: string;
    year?: number;
  }): Promise<Report> {}

  async update(): Promise<Report> {}

  async remove(): Promise<Report> {}
}
