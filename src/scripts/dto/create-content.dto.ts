import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
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
    @MinLength(50)
    head: string;

    @IsString()
    @IsOptional()
    textContent: string;

    @IsString()
    @IsOptional()
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