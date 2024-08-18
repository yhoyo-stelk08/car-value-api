import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './users.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUserService: Partial<UsersService>;

  beforeEach(async () => {
    // Create fake user object
    const fakeUser: Partial<User> = {
      id: 1,
      email: 'test@example.com',
      password: 'password',
    };

    // create fake user service
    fakeUserService = {
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

  it('throws an error if the user sign up with an email that already exist', async () => {
    // Mock `findOneOrNull` to simulate a user already existing with the given email
    fakeUserService.findOneOrNull = jest.fn().mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: 'password',
    } as User);

    // Check that `signup` throws a `BadRequestException`
    await expect(
      service.signup('test@example.com', 'password'),
    ).rejects.toThrow(BadRequestException);

    // Ensure the error message is 'Email already exists'
    await expect(
      service.signup('test@example.com', 'password'),
    ).rejects.toThrow('Email already exists');

    // Ensure the `create` method is not called because the email already exists
    expect(fakeUserService.create).not.toHaveBeenCalled();
  });

  it('throws an error if the email does not exist', async () => {
    // Mock `findOneOrNull` to simulate a user not existing with the given email
    fakeUserService.findOneOrNull = jest.fn().mockResolvedValue(null);

    // Check that `signin` throws a `BadRequestException`
    await expect(
      service.signin('test2@example.com', 'password'),
    ).rejects.toThrow(BadRequestException);

    // Ensure the error message is 'Invalid email'
    await expect(
      service.signin('test@example.com', 'password'),
    ).rejects.toThrow('Invalid email');
  });

  it('throws an error if the password is incorrect', async () => {
    // Mock `findOneOrNull` to simulate a user existing with the given email
    fakeUserService.findOneOrNull = jest.fn().mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: 'password',
    });

    // Check that `signin` throws a `BadRequestException`
    await expect(
      service.signin('test@example.com', 'password2'),
    ).rejects.toThrow(BadRequestException);

    // Ensure the error message is 'Invalid password'
    await expect(
      service.signin('test@example.com', 'password2'),
    ).rejects.toThrow('Invalid password');
  });
});
