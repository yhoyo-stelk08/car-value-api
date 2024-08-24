import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findAll(criteria?: {
    make?: string;
    model?: string;
    year?: number;
    mileage?: number;
    price?: number;
  }): Promise<Report[]> {
    try {
      if (criteria) {
        return await this.repo.findBy(criteria);
      }
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
    try {
      return await this.repo.findOneByOrFail(criteria);
    } catch (error) {
      throw new NotFoundException('Report not found');
    }
  }

  async update(id: number, attrs: Partial<Report>): Promise<Report> {
    try {
      const report = await this.repo.findOneByOrFail({ id });

      if (!report) {
        throw new NotFoundException('Report not found');
      }

      Object.assign(report, attrs);
      return await this.repo.save(report);
    } catch (error) {
      throw new NotFoundException('Report not found');
    }
  }

  async remove(id: number): Promise<Report> {
    try {
      const report = await this.repo.findOneByOrFail({ id });

      if (!report) {
        throw new NotFoundException('Report not found');
      }

      return await this.repo.remove(report);
    } catch (error) {
      throw new NotFoundException('Report not found');
    }
  }
}
