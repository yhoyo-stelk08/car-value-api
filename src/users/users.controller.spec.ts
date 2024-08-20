import { CreateUserDto } from '@/dtos/create-user.dto';
import { AuthGuard } from '@/guards/auth.guard';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersController } from './users.controller';
import { User } from './users.entity';
import { UsersService } from './users.service';

// Create mock AuthGuard
@Injectable()
class MockAuthGuard {
  canActivate(context: ExecutionContext) {
    return true; // Always allow access in the test
  }
}

// create users service mock
const usersServiceMock = {
  findOneOrNull: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
};

// create auth service mock
const authServiceMock = {
  signup: jest.fn(),
  signin: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(
      UsersService,
    ) as jest.Mocked<UsersService>;
    authService = module.get<AuthService>(
      AuthService,
    ) as jest.Mocked<AuthService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('can create a new user and set session userId', async () => {
    const session = { userId: null };

    // Mock the user data
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password',
    };
    const createdUser: Partial<User> = { id: 1, ...createUserDto };

    // Mock the service methods
    authService.signup.mockResolvedValue(createdUser as User);

    // call the controller method
    const result = await controller.createUser(createUserDto, session);

    // assert the service method was called
    expect(authService.signup).toHaveBeenCalledWith(
      createUserDto.email,
      createUserDto.password,
    );
    expect(result).toEqual(createdUser);
    expect(session.userId).toEqual(createdUser.id);
  });

  it('should sign in a user and set session userId', async () => {
    const session = { userId: null };

    // Mock the user data
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password',
    };

    const createdUser: Partial<User> = { id: 1, ...createUserDto };

    // Mock the service methods
    authService.signin.mockResolvedValue(createdUser as User);

    // call the controller method
    const result = await controller.signin(createUserDto, session);

    // assert the service method was called
    expect(authService.signin).toHaveBeenCalledWith(
      createUserDto.email,
      createUserDto.password,
    );
    expect(result).toEqual(createdUser);
    expect(session.userId).toEqual(createdUser.id);
  });

  it('should get the current user', async () => {
    // Mock the current user by applying the mock decorator manually
    const user = 'test@example.com';

    // Call the method directly with the mock user
    const result = await controller.currentUser(user);

    // Assertions
    expect(result).toBe(user);
  });

  it('should sign out the user', async () => {});

  it('should return an array of users when AuthGuard allows access', async () => {});

  it('should find user by email', async () => {});

  it('should find user by id', async () => {});

  it('should update user data', async () => {});

  it('should remove user', async () => {});
});
