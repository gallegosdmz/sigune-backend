import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Auth } from 'src/auth/decorators';
import { ValidPermissions } from 'src/auth/interfaces';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Auth( ValidPermissions.create_role )
  create(
    @Body() createRoleDto: CreateRoleDto
  ) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Auth( ValidPermissions.view_roles )
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.rolesService.findAll( paginationDto );
  }

  @Get(':id')
  @Auth( ValidPermissions.view_role )
  findOne(@Param('id', ParseIntPipe ) id: number) {
    return this.rolesService.findOne( +id );
  }

  @Patch(':id')
  @Auth( ValidPermissions.update_role )
  update(
    @Param('id', ParseIntPipe ) id: number, 
    @Body() updateRoleDto: UpdateRoleDto
  ) {
    return this.rolesService.update( +id, updateRoleDto );
  }

  @Delete(':id')
  @Auth( ValidPermissions.delete_role )
  remove(
    @Param('id', ParseIntPipe ) id: number
  ) {
    return this.rolesService.remove(+id);
  }
}
