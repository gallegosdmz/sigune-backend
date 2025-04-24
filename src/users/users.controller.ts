import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Auth } from 'src/auth/decorators';
import { ValidPermissions } from 'src/auth/interfaces';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Auth( ValidPermissions.view_users )
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.usersService.findAll( paginationDto );
  }

  @Get(':id')
  @Auth( ValidPermissions.view_user )
  findOne(
    @Param('id', ParseIntPipe ) id: number
  ) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @Auth( ValidPermissions.update_user )
  update(
    @Param('id', ParseIntPipe ) id: number, 
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Auth( ValidPermissions.delete_user )
  remove(
    @Param('id', ParseIntPipe ) id: number
  ) {
    return this.usersService.remove(+id);
  }
}
