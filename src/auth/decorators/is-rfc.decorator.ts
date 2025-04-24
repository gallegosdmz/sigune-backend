import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator";

// DECORADOR PARA VALIDAR RFC
export function IsRFC( validationOptions?: ValidationOptions ) {
    return function ( object: Object, propertyName: string ) {
        registerDecorator({
            name: 'isRFC',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate( value: any, args: ValidationArguments ) {
                    const rfcRegex = /^[A-Z]{4}\d{6}[A-Z\d]{3}$/;
                    return typeof value === 'string' && rfcRegex.test( value );
                },
                defaultMessage( args: ValidationArguments ) {
                    return `${ args.property } is not a valid RFC`;
                }
            }
        });
    }
}