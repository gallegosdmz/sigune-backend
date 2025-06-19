import { Content } from "src/scripts/entities/content.entity";
import { WeeklySummary } from "src/weekly-summarys/entities/weekly-summary.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('daily-summarys')
export class DailySummary {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('date')
    date: Date;

    @ManyToMany(() => Content, (content) => content.dailySummarys)
    @JoinTable()
    contents: Content[];

    @ManyToOne(() => WeeklySummary, (weeklySummary) => weeklySummary.dailySummarys, {nullable: true})
    weeklySummary?: WeeklySummary;

    @Column({default: false})
    isDeleted: boolean;
}
