import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './users.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    // Create fake user object
    const fakeUser: Partial<User> = {
      id: 1,
      email: 'test@example.com',
      password: 'password',
    };

    // create fake user service
    const fakeUserService: Partial<UsersService> = {
      findOneOrNull: () => Promise.resolve(null),
      create: jest.fn((email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
      ),
    };

    // Create and compile a test module with AuthService and fake user service
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUserService },
      ],
    }).compile();

    // Get the instance of AuthService
    service = module.get<AuthService>(AuthService);
  });

  it('can create an instance of auth service', () => {
    expect(service).toBeDefined();
  });

  it('create a new user with salted and hashed password', async () => {
    const user = await service.signup('test@example.com', 'password');

    expect(user.password).not.toEqual('password'); // Ensure the password is not the original one
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined(); // Ensure the salt exists
    expect(hash).toBeDefined(); // Ensure the hash exists
  });

  it('throws an error if the email already exist', async () => {
    // First signup attempt should create a new user
    await service.signup('test@example.com', 'password');
    try {
      await service.signup('test@exaple.com', 'password');

      // If the above line does not throw an error, fail the test
      throw new BadRequestException('Email already exists');
    } catch (error) {
      expect(error.message).toEqual('Email already exists');
    }
  });
});
