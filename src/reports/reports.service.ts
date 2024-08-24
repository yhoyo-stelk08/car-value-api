import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dtos/create-report.dto';
import { Report } from './reports.entity';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  async create(createReportDto: CreateReportDto) {
    try {
      const report = this.repo.create(createReportDto);
      return await this.repo.save(report);
    } catch (error) {
      throw new Error('Unable to create and save report');
    }
  }

  async findAll(): Promise<Report[]> {
    try {
      return await this.repo.find();
    } catch (error) {
      return [];
    }
  }

  async findOne(criteria: {
    id?: number;
    price?: number;
    mileage?: number;
    make?: string;
    model?: string;
    year?: number;
  }): Promise<Report> {
    return null;
  }

  async update(id: number, attrs: Partial<Report>): Promise<Report> {
    return null;
  }

  async remove(id: number): Promise<Report> {
    return null;
  }
}
