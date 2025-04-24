import { User } from "src/auth/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Content } from "./content.entity";

@Entity('scripts')
export class Script {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.scripts)
    user: User;

    @Column('varchar', { length: 100})
    title: string;

    @Column('date')
    dateEmission: Date;

    @Column('text')
    farewell: string;

    @Column({ default: false })
    status: boolean;
    
    @OneToMany(() => Content, (content) => content.script)
    contents: Content[];

    @Column({ default: false })
    isDeleted: boolean;
}
