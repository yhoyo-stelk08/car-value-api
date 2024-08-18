import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(email: string, password: string): Promise<User> {
    const user = this.repo.create({ email, password });
    return await this.repo.save(user);
  }

  async findOne(criteria: { id?: number; email?: string }): Promise<User> {
    try {
      return await this.repo.findOneByOrFail(criteria);
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async findOneOrNull(criteria: {
    id?: number;
    email?: string;
  }): Promise<User | null> {
    try {
      return await this.repo.findOneByOrFail(criteria);
    } catch (error) {
      return null;
    }
  }

  async findAll(): Promise<User[]> {
    return await this.repo.find();
  }

  async update(id: number, attrs: Partial<User>): Promise<User> {
    try {
      const user = await this.repo.findOneByOrFail({ id });
      if (!user) {
        throw new Error('User not found');
      }
      Object.assign(user, attrs);
      return await this.repo.save(user);
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async remove(id: number): Promise<User> {
    try {
      const user = await this.repo.findOneByOrFail({ id });
      if (!user) {
        throw new Error('User not found');
      }
      return await this.repo.remove(user);
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }
}
