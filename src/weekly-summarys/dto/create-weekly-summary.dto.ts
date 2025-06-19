import { Transform, Type } from "class-transformer";
import { IsDate } from "class-validator";

export class CreateWeeklySummaryDto {
    @IsDate()
    @Transform(({ value }) => {
        if (value instanceof Date) {
            // Si ya es un Date, ajustar la zona horaria
            const utcDate = new Date(value.getTime() + (value.getTimezoneOffset() * 60000));
            return utcDate;
        }
        if (typeof value === 'string') {
            // Si es string, crear Date y ajustar
            const date = new Date(value);
            const utcDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
            return utcDate;
        }
        return value;
    })
    @Type(() => Date)
    date: Date;
}
