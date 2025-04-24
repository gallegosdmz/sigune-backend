import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class LoginUserDto {
    @IsString()
    @IsEmail()
    institucionalEmail: string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    password: string
}