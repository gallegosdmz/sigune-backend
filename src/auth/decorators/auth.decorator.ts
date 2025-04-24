import { applyDecorators, UseGuards } from "@nestjs/common";
import { ValidPermissions } from "../interfaces";
import { PermissionsProtected } from "./permissions-protected.decorator";
import { AuthGuard } from "@nestjs/passport";
import { UserRoleGuard } from "../guards/user-role/user-role.guard";

// FUNCIÓN QUE ADJUNTA DECORADORES EN UNO MISMO PARA AUTENTICACIÓN
export function Auth( ...permissions: ValidPermissions[] ) {

    return applyDecorators(
        PermissionsProtected( ...permissions ),
        UseGuards( AuthGuard(), UserRoleGuard ),
    );
}