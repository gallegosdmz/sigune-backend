import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "src/auth/entities/user.entity";
import { Script } from "./script.entity";
import { DailySummary } from "src/daily-summary/entities/daily-summary.entity";
import { ContentFile } from "./content-file.entity";

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

    @Column('int2', { nullable: true })
    position?: number;

    @Column({ default: false })
    status: boolean;

    @ManyToOne(() => User, (user) => user.contents)
    user: User;

    @ManyToOne(() => Script, (script) => script.contents, {nullable: true})
    script?: Script;

    @ManyToMany(() => DailySummary, (dailySummary) => dailySummary.contents, {nullable: true})
    dailySummarys?: DailySummary[];

    @OneToMany(() => ContentFile, (contentFile) => contentFile.content)
    contentsFiles: ContentFile[];

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @Column({ default: false })
    isDeleted: boolean;
}