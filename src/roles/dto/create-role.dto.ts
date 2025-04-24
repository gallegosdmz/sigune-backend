import { Type } from "class-transformer";
import { IsArray, IsInt, IsString, MaxLength } from "class-validator";

export class CreateRoleDto {
    @IsString()
    @MaxLength(90)
    name: string;

    @IsInt()
    @Type(() => Number)
    department: number;

    @IsString({ each: true })
    @IsArray()
    permissions: string[];
}
