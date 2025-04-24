import { Type } from "class-transformer";
import { IsInt } from "class-validator";

export class ChangePositionContentDto {
    @IsInt()
    @Type(() => Number)
    position: number;
}