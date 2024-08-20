import { CreateUserDto } from '@/dtos/create-user.dto';
import { AuthGuard } from '@/guards/auth.guard';
import {
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersController } from './users.controller';
import { User } from './users.entity';
import { UsersService } from './users.service';

// Create mock AuthGuard
@Injectable()
class MockAuthGuard extends AuthGuard {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    // inject mockSession
    request.session = this.mockSession;
    return request.session.userId;
  }

  constructor(private mockSession: any) {
    super();
  }
}

// Create a mock for UsersService
const usersServiceMock = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  findOneOrNull: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Create a mock for AuthService
const authServiceMock = {
  signup: jest.fn(),
  signin: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: AuthGuard,
          useFactory: () => new MockAuthGuard({ userId: 1 }),
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('can create a new user and set session userId', async () => {
    // mock the session
    const mockSession = { userId: null };

    // mock the user data
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password',
    };
    const createdUser = { id: 1, ...createUserDto } as User;

    // mock the signup method
    authServiceMock.signup.mockResolvedValue(createdUser);

    // create a new user
    const user = await controller.createUser(createUserDto, mockSession);

    // assertions
    expect(user).toEqual(createdUser);
    expect(mockSession.userId).toEqual(createdUser.id);
    expect(authServiceMock.signup).toHaveBeenCalledWith(
      createUserDto.email,
      createUserDto.password,
    );
  });

  it('should sign in a user and set session userId', async () => {
    const session = { userId: null };

    // mocking create user data
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password',
    };
    const createdUser = { id: 1, ...createUserDto } as User;

    // mocking signin method
    authServiceMock.signin.mockResolvedValue(createdUser);

    // sign in a user
    const user = await controller.signin(createUserDto, session);

    // assertions
    expect(user).toEqual(createdUser);
    expect(session.userId).toEqual(createdUser.id);
    expect(authServiceMock.signin).toHaveBeenCalledWith(
      createUserDto.email,
      createUserDto.password,
    );
  });

  it('should get the current user', async () => {
    const user = 'test@example.com';
    const result = await controller.currentUser(user);
    expect(result).toBe(user);
  });

  it('should sign out the user', async () => {
    const mockSession = { userId: 1 };

    // sign out the user
    await controller.signOut(mockSession);

    // assertions
    expect(mockSession.userId).toBeNull();
  });

  it('should return an array of users when AuthGuard allows access', async () => {});

  it('should find user by email and throw exception if not found', async () => {
    // mock the user data
    const user = { id: 1, email: 'test2@example.com' } as User;

    // mock the usersService findOne method
    usersServiceMock.findOne.mockResolvedValueOnce(user);

    // Call the method with an existing user
    const foundUser = await controller.findUserByEmail('test2@example.com');

    // Assertions
    expect(foundUser).toEqual(user);

    // mock the user email not found
    usersServiceMock.findOne.mockRejectedValueOnce(
      new NotFoundException('User not found'),
    );

    // assert that the method throws an exception
    await expect(
      controller.findUserByEmail('test@example.com'),
    ).rejects.toThrow(NotFoundException);

    // Verify the calls to the mock
    expect(usersServiceMock.findOne).toHaveBeenCalledWith({
      email: 'test2@example.com',
    });
    expect(usersServiceMock.findOne).toHaveBeenCalledWith({
      email: 'test@example.com',
    });
  });

  it('should find user by id and throw an error if not found', async () => {
    // Mock the user data
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'password',
    } as User;

    // Mock the usersService findOne method
    usersServiceMock.findOne.mockResolvedValueOnce(mockUser);

    // Call the method with an existing user
    const foundUser = await controller.findUserById(1);

    // Assertions
    expect(foundUser).toEqual(mockUser);

    // Mock the user not found
    usersServiceMock.findOne.mockRejectedValueOnce(
      new NotFoundException('User not found'),
    );

    expect(controller.findUserById(2)).rejects.toThrow(NotFoundException);

    // Verify the calls to the mock
    expect(usersServiceMock.findOne).toHaveBeenCalledWith({ id: 1 });
    expect(usersServiceMock.findOne).toHaveBeenCalledWith({ id: 2 });
  });

  it('should update user data', async () => {
    const id = 1;
    const updateUserDto: Partial<CreateUserDto> = {
      email: 'test2@example.com',
    };

    // mock the user data
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'password',
    } as User;

    // mock the usersService update method
    usersServiceMock.update.mockResolvedValueOnce(mockUser);

    // Call the method with an existing user
    const updatedUser = await controller.updateUser(id, updateUserDto);

    // Assertions
    expect(updatedUser).toEqual(mockUser);

    // Verify the calls to the mock
    expect(usersServiceMock.update).toHaveBeenCalledWith(id, updateUserDto);

    // Mock the update method in UsersService to throw a NotFoundException
    usersServiceMock.update.mockRejectedValueOnce(
      new NotFoundException('User not found'),
    );

    // Assert that the controller method throws the correct exception
    await expect(controller.updateUser(id, updateUserDto)).rejects.toThrow(
      NotFoundException,
    );

    // Verify the update method was called correctly
    expect(usersServiceMock.update).toHaveBeenCalledWith(id, updateUserDto);
  });

  it('should remove user', async () => {
    const id = 1;

    // mock the user data
    const mockUser = {
      id: 1,
      email: 'test@example.com',
    } as User;

    // mock the usersService remove method
    usersServiceMock.remove.mockResolvedValueOnce(mockUser);

    // remove the user
    const removedUser = await controller.removeUser(id);

    // assertions
    expect(removedUser).toEqual(mockUser);

    // Verify the calls to the mock
    expect(usersServiceMock.remove).toHaveBeenCalledWith(id);

    // mock the user not found
    usersServiceMock.remove.mockRejectedValueOnce(
      new NotFoundException('User not found'),
    );

    // assert that the method throws an exception
    await expect(controller.removeUser(2)).rejects.toThrow(NotFoundException);

    // Verify the calls to the mock
    expect(usersServiceMock.remove).toHaveBeenCalledWith(2);
  });
});
