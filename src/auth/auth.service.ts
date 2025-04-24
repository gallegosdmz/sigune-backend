import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { handleDBErrors } from 'src/utils';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository( User )
    private readonly userRepository: Repository< User >,

    private readonly jwtService: JwtService,
  ) {}
  
  async create( createUserDto: CreateUserDto ) {
    try {
      const { password, role , ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        role: { id: role },
        password: bcrypt.hashSync( password, 10 )
      });
      await this.userRepository.save( user );

      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      };

    } catch ( error ) {
      handleDBErrors( error, 'auth' );
    }

  }

  async login( loginUserDto: LoginUserDto ) {
    const { password, institucionalEmail } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { institucionalEmail, isDeleted: false },
      select: { institucionalEmail: true, password: true, id: true },
      relations: { role: true },
    });

    if ( !user ) 
      throw new UnauthorizedException('Credentials are not valid (email)');

    if ( !bcrypt.compareSync( password, user.password ) ) 
      throw new UnauthorizedException('Credentials are not valid (password)');

    const { password: _, ...userLogged } = user;

    return {
      ...userLogged,
      token: this.getJwtToken({ id: user.id })
    };
  }

  async checkAuthStatus( user: User ) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    }
  }

  private getJwtToken( payload: JwtPayload ) {
    const token = this.jwtService.sign( payload );

    return token;
  }
}
