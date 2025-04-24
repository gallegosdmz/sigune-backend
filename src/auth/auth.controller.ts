import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Auth, GetUser, RawHeaders } from './decorators/';
import { User } from './entities/user.entity';
import { ValidPermissions } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Auth( ValidPermissions.create_user )
  create( @Body() createUserDto: CreateUserDto ) {
    return this.authService.create( createUserDto );
  }

  @Post('login')
  loginUser( @Body() loginUserDto: LoginUserDto ) {
    return this.authService.login( loginUserDto );
  }

  @Get('check-auth-status')
  @Auth( ValidPermissions.check_auth_status )
  checkAuthStatus(
    @GetUser() user: User,
  ) {
    return this.authService.checkAuthStatus( user );
  }

}
