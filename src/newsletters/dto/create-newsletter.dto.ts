import { IsString, MaxLength } from "class-validator";

export class CreateNewsletterDto {    
    @IsString()
    textContent: string;

    @IsString()
    @MaxLength(140)
    dependence: string;
}
