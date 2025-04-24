import { SetMetadata } from '@nestjs/common';
import { ValidPermissions } from '../interfaces';
export const META_PERMISSIONS = 'permissions';

export const PermissionsProtected = ( ...args: ValidPermissions[] ) => {
    return SetMetadata( META_PERMISSIONS, args );
}