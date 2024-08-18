import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from 'src/dtos/create-user.dto';
import { UserDto } from 'src/dtos/user.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';

@Controller('auth')
@Serialize(UserDto)
export class UsersController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  @Post('signup')
  createUser(@Body() body: CreateUserDto) {
    return this.authService.signup(body.email, body.password);
  }

  @Get('listUsers')
  findAllUsers() {
    return this.userService.findAll();
  }

  @Get(':id')
  findUserById(@Param('id') id: number) {
    return this.userService.findOne({ id });
  }

  @Get()
  findUserByEmail(@Query('email') email: string) {
    return this.userService.findOne({ email });
  }

  @Patch(':id')
  updateUser(@Param('id') id: number, @Body() body: Partial<CreateUserDto>) {
    return this.userService.update(id, body);
  }

  @Delete(':id')
  removeUser(@Param('id') id: number) {
    return this.userService.remove(id);
  }
}
