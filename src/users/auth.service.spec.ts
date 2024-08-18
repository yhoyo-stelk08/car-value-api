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
      create: (email: string, password: string) =>
        Promise.resolve(fakeUser as User),
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
});
