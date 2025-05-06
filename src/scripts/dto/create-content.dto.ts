import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength } from "class-validator";
import { User } from "src/auth/entities/user.entity";

export class CreateContentDto {
    @IsString()
    @MaxLength(20)
    type: string;

    @IsOptional()
    user: User;

    @IsString()
    @MaxLength(90)
    title: string;

    @IsString()
    @IsOptional()
    textContent: string;

    @IsString()
    dependence: string;

    @IsString()
    classification: string;

    @IsString()
    @IsOptional()
    url: string;

    @IsInt()
    @IsOptional()
    @Type(() => Number)
    position: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    script: number;

    @IsOptional()
    @IsBoolean()
    status: boolean;
}