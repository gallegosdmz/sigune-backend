import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { handleDBErrors } from 'src/utils';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository( User )
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll( paginationDto: PaginationDto ) {
    const { limit = 10, offset = 0 } = paginationDto;

    try {
      const users = await this.userRepository.find({
        take: limit,
        skip: offset,
        where: {
          isDeleted: false,
        },
        relations: {
          role: {
            department: true,
          }
        },
        select: {
          id: true,
          name: true,
          surname: true,
          institucionalEmail: true,
          role: {
            id: true,
            name: true,
            department: {
              id: true,
              name: true,
            }
          },
          numEmployee: true,
          phone: true,
          address: true, 
          curp: true,
          rfc: true,
          dateAdmission: true,
          level: true,
          birthdate: true,
          gender:  true,
          isDeleted: true,
        }
      });

      return users;

    } catch ( error ) {
      handleDBErrors( error, 'users' );
    }
  }

  async findOne(id: number) {
    const userDB = await this.userRepository.findOne({
      where: { id, isDeleted: false },
      relations: {
        role: {
          department: true,
        },
      },
    });
    if ( !userDB ) throw new NotFoundException(`User with id: ${ id }`);

    const { password, ...user } = userDB;

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne( id );
    
    try {
      Object.assign( user, updateUserDto );
      await this.userRepository.save( user );

      return this.findOne( id );

    } catch ( error ) {
      handleDBErrors( error, 'users' );
    }
  }

  async remove(id: number) {
    await this.findOne( id );

    try {
      await this.userRepository.update( id, { isDeleted: true } );

      return {
        message: `Role with id: ${ id } is removed successfully`,
      }

    } catch ( error ) {
      handleDBErrors( error, 'users' );
    }
  }
}
