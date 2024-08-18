import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { UsersService } from './users.service';

const mockedRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneOrFail: jest.fn(),
  remove: jest.fn(),
  findOneByOrFail: jest.fn(),
}); // Mocked Repository

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockedRepository(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(
      getRepositoryToken(User),
    ) as jest.Mocked<Repository<User>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user', async () => {
    const email = 'test@example.com';
    const password = 'password';

    const mockUser = { id: 1, email, password } as User;

    repository.create.mockReturnValue(mockUser);
    repository.save.mockResolvedValue(mockUser);

    const user = await service.create(email, password);

    expect(repository.create).toHaveBeenCalledWith({ email, password });
    expect(repository.save).toHaveBeenCalledWith(mockUser);
    expect(user).toEqual(mockUser);
  });
});
