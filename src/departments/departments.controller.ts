import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Auth } from 'src/auth/decorators';
import { ValidPermissions } from 'src/auth/interfaces';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Auth( ValidPermissions.create_department )
  create(
    @Body() createDepartmentDto: CreateDepartmentDto
  ) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @Auth( ValidPermissions.view_departments )
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.departmentsService.findAll( paginationDto );
  }

  @Get(':id')
  @Auth( ValidPermissions.view_department )
  findOne(
    @Param('id', ParseIntPipe ) id: number
  ) {
    return this.departmentsService.findOne(+id);
  }

  @Patch(':id')
  @Auth( ValidPermissions.update_department )
  update(
    @Param('id', ParseIntPipe ) id: number, 
    @Body() updateDepartmentDto: UpdateDepartmentDto
  ) {
    return this.departmentsService.update(+id, updateDepartmentDto);
  }

  @Delete(':id')
  @Auth( ValidPermissions.delete_department )
  remove(
    @Param('id', ParseIntPipe ) id: number
  ) {
    return this.departmentsService.remove(+id);
  }
}
