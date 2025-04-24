import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsInt, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateContentDto {
    @IsString()
    @MaxLength(20)
    type: string;

    @IsString()
    @MaxLength(90)
    title: string;

    @IsString()
    @IsOptional()
    textContent: string;

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