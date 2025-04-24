import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateDepartmentDto {
    @IsString()
    @MaxLength(90)
    name: string
}
