import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { Repository } from 'typeorm';
import { handleDBErrors } from 'src/utils';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository( Department )
    private readonly departmentRepository: Repository<Department>
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    try {
      const { name } = createDepartmentDto;

      const department = this.departmentRepository.create({ name });
      await this.departmentRepository.save( department );

      return department;

    } catch ( error ) {
      handleDBErrors( error, 'departments' );
    } 
  }

  async findAll( paginationDto: PaginationDto ) {
    const { limit = 10, offset = 0 } = paginationDto;

    try {
      const departments = await this.departmentRepository.find({
        take: limit,
        skip: offset,
        where: {
          isDeleted: false,
        },
        relations: {
          roles: true,
        },
      });

      return departments;

    } catch ( error ) {
      handleDBErrors( error, 'departments' );
    }
  }

  async findOne(id: number) {
    const department = await this.departmentRepository.findOne({
      where: { id, isDeleted: false },
      relations: {
        roles: true
      },
    });
    if ( !department ) throw new NotFoundException(`Department with id: ${ id } not found`);

    return department;
  }

  async update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.findOne( id );

    try { 
      Object.assign( department, updateDepartmentDto );
      await this.departmentRepository.save( department );

      return this.findOne( id );

    } catch ( error ) {
      handleDBErrors( error, 'departments' );
    }
  }

  async remove(id: number) {
    await this.findOne( id );

    try {  
      await this.departmentRepository.update( id, { isDeleted: true } );

      return {
        message: `Department with id: ${ id } is removed successfully`,
      }

    } catch ( error ) {
      handleDBErrors( error, 'departments' );

    }
  }
}
