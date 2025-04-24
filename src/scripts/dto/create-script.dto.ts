import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsInt, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateScriptDto {
    @IsString()
    @MaxLength(90)
    title: string;

    @IsDate()
    @Type(() => Date)
    dateEmission: Date;

    @IsString()
    farewell: string;

    @IsBoolean()
    @IsOptional()
    status: boolean;
}
