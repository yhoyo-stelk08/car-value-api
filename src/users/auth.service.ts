import { BadRequestException, Injectable } from '@nestjs/common';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { UsersService } from './users.service';

const scrypt = promisify(_scrypt);
@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    // Find if user by email
    const user = await this.usersService.findOneOrNull({ email });
    // Check if the email already exists
    if (user) {
      // If it does, throw an error
      throw new BadRequestException('Email already exists');
    }
    // If it doesn't, Hash the password and create a new user

    // generate a salt
    const salt = randomBytes(8).toString('hex');

    // hash the salt and the password
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // Join the hashed result and the salt together
    const result = salt + '.' + hash.toString('hex');

    // Create a new user and save it
    const newUser = await this.usersService.create(email, result);

    // Return the user
    return newUser;
  }

  signin(email: string, password: string) {}
}
