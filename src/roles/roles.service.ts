import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { handleDBErrors } from 'src/utils';
import { Department } from 'src/departments/entities/department.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository( Role )
    private readonly roleRepository: Repository<Role>,
  ) {}
  
  async create(createRoleDto: CreateRoleDto) {
    const { name, department, permissions } = createRoleDto;

    try {
      const role = this.roleRepository.create({ name, department: { id: department }, permissions })
      await this.roleRepository.save( role );

      return role;

    } catch ( error ) {
      handleDBErrors( error, 'roles' );
    }
  }

  async findAll( paginationDto: PaginationDto ) {
    const { limit = 10, offset = 0 } = paginationDto;

    try {
      const roles = await this.roleRepository.find({
        take: limit,
        skip: offset,
        where: {
          isDeleted: false,
        },
        relations: {
          department: true,
          users: true,
        },
      });

      return roles;

    } catch ( error ) {
      handleDBErrors( error, 'roles' );
    }
  }

  async findOne(id: number) {
    const role = await this.roleRepository.findOne({
      where: { id, isDeleted: false },
      relations: { department: true },
    });
    if ( !role ) throw new NotFoundException(`Role with id: ${ id } not found`);

    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.findOne( id );

    try {
      Object.assign( role, updateRoleDto );
      await this.roleRepository.save( role );

      return this.findOne( id );

    } catch ( error ) {
      handleDBErrors( error, 'roles' );
    }
  }

  async remove(id: number) {
    await this.findOne( id );

    try {
      await this.roleRepository.update( id, { isDeleted: true } );

      return {
        message: `Role with id: ${ id } is removed successfully`,
      }

    } catch ( error ) {
      handleDBErrors( error, 'roles' );
    }
  }


}
