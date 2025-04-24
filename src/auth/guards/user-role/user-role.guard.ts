import { Reflector } from '@nestjs/core';
import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { META_PERMISSIONS } from 'src/auth/decorators/permissions-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector
  ) {}
  
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const validPermissions: string[] = this.reflector.get( META_PERMISSIONS, context.getHandler() );

    if ( !validPermissions ) return true;
    if ( validPermissions.length === 0 ) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if ( !user ) 
      throw new BadRequestException('User not found');

    if ( !user.role.permissions || user.role.permissions.length === 0 )
      throw new BadRequestException('User not register permissions');

    for ( const permission of user.role.permissions ) {
      if ( validPermissions.includes( permission ) ) {
        return true;
      } 
    }

    throw new ForbiddenException(`User: ${ user.name } ${ user.surname } need a valid permission: [${ validPermissions }]`);
  }
}
