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
import { UsersService } from './users.service';

@Controller('auth')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Post('signup')
  createUser(@Body() body: CreateUserDto) {
    return this.userService.create(body.email, body.password);
  }

  @Get('listUsers')
  @Serialize(UserDto)
  findAllUsers() {
    return this.userService.findAll();
  }

  @Get(':id')
  @Serialize(UserDto)
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
