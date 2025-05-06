import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('newsletters')
export class Newsletter {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    textContent: string;

    @Column('varchar', {length: 150})
    dependence: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @Column({default: false})
    isDeleted: boolean;
}
