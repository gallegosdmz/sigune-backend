import { Role } from "src/roles/entities/role.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('departments')
export class Department {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { length: 100 })
    name: string;

    @OneToMany(() => Role, (role) => role.department)
    roles: Role[];

    @Column({ default: false })
    isDeleted: boolean;

    @BeforeInsert()
    toUpperBeforeInsert() {
        this.name = this.name.toUpperCase().trim();
    }

    @BeforeUpdate()
    toUpperBeforeUpdate() {
        this.toUpperBeforeInsert();
    }
}
