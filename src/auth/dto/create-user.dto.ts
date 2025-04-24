import { Type } from "class-transformer";
import { IsDate, IsEmail, IsInt, IsPhoneNumber, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { IsCURP, IsGender, IsRFC } from "../decorators/";

export class CreateUserDto {
    @IsString()
    @MaxLength(90)
    name: string;

    @IsString()
    @MaxLength(90)
    surname: string;

    @IsString()
    @IsEmail()
    institucionalEmail: string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password: string;

    @IsInt()
    @Type(() => Number)
    role: number;

    @IsInt()
    @Type(() => Number)
    numEmployee: number;

    @IsString()
    @MaxLength(20)
    @MinLength(10)
    phone: string;

    @IsString()
    address: string;

    @IsString()
    @IsCURP()
    curp: string;

    @IsString()
    @IsRFC()
    rfc: string;

    @IsDate()
    @Type(() => Date)
    dateAdmission: Date;

    @IsInt()
    @Type(() => Number)
    level: number;

    @IsDate()
    @Type(() => Date)
    birthdate: Date;

    @IsString()
    @IsGender()
    gender: string;

}