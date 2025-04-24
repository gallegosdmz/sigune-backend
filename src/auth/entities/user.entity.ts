import { Role } from "src/roles/entities/role.entity";
import { Content } from "src/scripts/entities/content.entity";
import { Script } from "src/scripts/entities/script.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { length: 100 })
    name: string;

    @Column('varchar', { length: 100 })
    surname: string;

    @Column('varchar', { length: 254, unique: true })
    institucionalEmail: string;

    @Column('varchar', { length: 255 })
    password: string;

    @ManyToOne(() => Role, (role) => role.users)
    role: Role;

    @Column('int', { unique: true })
    numEmployee: number;

    @Column('varchar', { length: 20 })
    phone: string;

    @Column('text')
    address: string;

    @Column('varchar', { length: 18, unique: true })
    curp: string;

    @Column('varchar', { length: 13, unique: true })
    rfc: string;

    @Column('date')
    dateAdmission: Date;

    @Column('int')
    level: number;

    @Column('date')
    birthdate: Date;
    
    @Column('varchar', { length: 10 })
    gender: string;

    @OneToMany(() => Script, (script) => script.user)
    scripts: Script[];

    @OneToMany(() => Content, (content) => content.user)
    contents: Content[];

    @Column({ default: false })
    isDeleted: boolean;


    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.institucionalEmail = this.institucionalEmail.toLowerCase().trim();
        this.gender = this.gender.toUpperCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.checkFieldsBeforeInsert();
    }
}