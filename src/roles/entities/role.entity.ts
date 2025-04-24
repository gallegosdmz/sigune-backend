import { User } from "src/auth/entities/user.entity";
import { Department } from "src/departments/entities/department.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { length: 100 })
    name: string;

    @ManyToOne(() => Department, (department) => department.roles)
    department: Department;

    @OneToMany(() => User, (user) => user.role)
    users: User[];

    @Column({ default: false })
    isDeleted: boolean;

    @Column('text', {
        array: true,
        default: []
    })
    permissions: string[];

    @BeforeInsert()
    toUpperBeforeInsert() {
        this.name = this.name.toUpperCase().trim();
    }

    @BeforeUpdate()
    toUpperBeforeUpdate() {
        this.name = this.name.toUpperCase().trim();
    }
}
