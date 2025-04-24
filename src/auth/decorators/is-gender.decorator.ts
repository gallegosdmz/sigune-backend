import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator";

// DECORADOR PARA VALIDAR GENERO
export function IsGender( validationOptions?: ValidationOptions ) {
    return function ( object: Object, propertyName: string ) {
        registerDecorator({
            name: 'isGender',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate( value: any, args: ValidationArguments ) {
                    const genders = ['MASCULINO', 'FEMENINO', 'OTRO'];
                    return genders.includes( value );
                },
                defaultMessage( args: ValidationArguments ) {
                    return `${ args.property } must be one of the following`;
                },
            },
        });
    }
}