import { Injectable } from '@nestjs/common';
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

  async findOne(id: number): Promise<User | undefined> {
    return await this.repo.findOneByOrFail({ id });
  }

  async find(): Promise<User[]> {
    return await this.find();
  }

  async update(id: number, attrs: Partial<User>): Promise<User> {
    const user = await this.repo.findOneByOrFail({ id });
    if (!user) {
      throw new Error('User not found');
    }
    Object.assign(user, attrs);
    return await this.repo.save(user);
  }

  async remove(id: number): Promise<User> {
    const user = await this.repo.findOneByOrFail({ id });
    if (!user) {
      throw new Error('User not found');
    }
    return await this.repo.remove(user);
  }
}
