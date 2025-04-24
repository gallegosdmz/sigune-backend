import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator";

// DECORADOR PARA VALIDAR CURP
export function IsCURP( validationOptions?: ValidationOptions ) {
    return function ( object: Object, propertyName: string ) {
        registerDecorator({
            name: 'isCURP',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate( value: any, args: ValidationArguments ) {
                    const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]{2}$/;
                    return typeof value === 'string' && curpRegex.test( value );
                },
                defaultMessage( args: ValidationArguments ) {
                    return `${ args.property } is not a valid CURP`;
                }
            }
        });
    }
}