import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "src/auth/entities/user.entity";
import { Script } from "./script.entity";

@Entity('contents')
export class Content {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column('varchar', { length: 20 })
    type: string;

    @Column('varchar', { length: 100 })
    title: string;

    @Column('text')
    head: string;

    @Column('text')
    textContent: string;

    @Column('varchar', {length: 150, nullable: true})
    dependence?: string;

    @Column('varchar', {length: 150})
    classification: string;

    @Column('text', { nullable: true })
    url?: string;

    @Column('int2', { nullable: true })
    position?: number;

    @Column({ default: false })
    status: boolean;

    @ManyToOne(() => User, (user) => user.contents)
    user: User;

    @ManyToOne(() => Script, (script) => script.contents, {nullable: true})
    script?: Script;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @Column({ default: false })
    isDeleted: boolean;
}