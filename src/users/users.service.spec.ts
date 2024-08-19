import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
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
    // Mock the user data
    const email = 'test@example.com';
    const password = 'password';

    // Mock the user object
    const mockUser = { id: 1, email, password } as User;

    // Mock the repository methods
    repository.create.mockReturnValue(mockUser);
    repository.save.mockResolvedValue(mockUser);

    // Create a new user
    const user = await service.create(email, password);

    // Assertions
    expect(repository.create).toHaveBeenCalledWith({ email, password });
    expect(repository.save).toHaveBeenCalledWith(mockUser);
    expect(user).toEqual(mockUser);
  });

  it('should find a user by id or email and throw an error if the user not found', async () => {
    // Mock the user object
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'password',
    } as User;

    // Mock the repository methods
    repository.findOneByOrFail.mockImplementation(
      (criteria: FindOptionsWhere<User>) => {
        if ('id' in criteria && criteria.id === 1) {
          return Promise.resolve(mockUser);
        }
        if ('email' in criteria && criteria.email === 'test@example.com') {
          return Promise.resolve(mockUser);
        }

        // Simulate user not found by throwing an error
        return Promise.reject(new Error('User not found'));
      },
    );

    // Find a user by id or email
    const user = await service.findOne({ id: 1 });
    const userByEmail = await service.findOne({ email: 'test@example.com' });
    const userEmailNotFound = service.findOne({ email: 'test2@example.com' });
    const userIdNotFound = service.findOne({ id: 2 });

    // assert find by id
    expect(repository.findOneByOrFail).toHaveBeenCalledWith({ id: 1 });
    expect(user).toEqual(mockUser);

    // assert find by email
    expect(repository.findOneByOrFail).toHaveBeenCalledWith({
      email: 'test@example.com',
    });
    expect(userByEmail).toEqual(mockUser);

    // assert user not found
    await expect(userEmailNotFound).rejects.toThrow('User not found');
    await expect(userIdNotFound).rejects.toThrow('User not found');
    await expect(userEmailNotFound).rejects.toThrow(NotFoundException);
    await expect(userIdNotFound).rejects.toThrow(NotFoundException);
  });

  it('should return null if user not found by findOneOrNull', async () => {
    // Mock the repository methods
    repository.findOneByOrFail.mockRejectedValue(new Error());

    // Find a user by email
    const user = await service.findOneOrNull({ email: 'test@example.com' });

    // Assertions
    expect(repository.findOneByOrFail).toHaveBeenCalledWith({
      email: 'test@example.com',
    });
    expect(user).toBeNull();
  });

  it('should find all users', async () => {
    const mockUsers = [
      { id: 1, email: 'test1@example.com', password: 'password' } as User,
      { id: 2, email: 'test2@example.com', password: 'password' } as User,
    ];

    // Mock the repository methods
    repository.find.mockResolvedValue(mockUsers);

    // Find all users
    const users = await service.findAll();

    // Assertions
    expect(repository.find).toHaveBeenCalled();
    // console.log(users);
    expect(users).toEqual(mockUsers);
  });

  it('should update a user and throws an error if user not found', async () => {
    // mock the user data
    const user = {
      id: 1,
      email: 'test@example.com',
      password: 'password',
    } as User;

    // mock the repository methods
    repository.findOneByOrFail.mockResolvedValue(user);
    repository.save.mockResolvedValue(user);

    // mock the updated data
    const updateData = await service.update(1, { email: 'test2@example.com' });

    // assertions
    expect(repository.findOneByOrFail).toHaveBeenCalledWith({ id: 1 });
    expect(repository.save).toHaveBeenCalledWith({
      ...user,
      email: 'test2@example.com',
    });
    expect(updateData.email).toEqual('test2@example.com');

    // mock user not found
    repository.findOneByOrFail.mockRejectedValue(new Error('User not found'));

    // Try to update a non-existing user and expect an error
    await expect(
      service.update(2, { email: 'test3@example.com' }),
    ).rejects.toThrow('User not found');
    await expect(
      service.update(2, { email: 'test3@example.com' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should remove a user and throws an error if user not found', async () => {
    // mock the user data
    const user = {
      id: 1,
      email: 'test@example.com',
    } as User;

    // mock the repository methods
    repository.findOneByOrFail.mockResolvedValue(user);
    repository.remove.mockResolvedValue(user);

    // remove the user
    const removedUser = await service.remove(1);

    // assertions
    expect(repository.findOneByOrFail).toHaveBeenCalledWith({ id: 1 });
    expect(repository.remove).toHaveBeenCalledWith(user);
    expect(removedUser).toEqual(user);

    // mock user not found
    repository.findOneByOrFail.mockRejectedValue(new Error('User not found'));

    // Try to remove a non-existing user and expect an error
    await expect(service.remove(2)).rejects.toThrow('User not found');
    await expect(service.remove(2)).rejects.toThrow(NotFoundException);
  });
});
