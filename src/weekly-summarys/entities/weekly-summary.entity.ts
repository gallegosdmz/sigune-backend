import { DailySummary } from "src/daily-summary/entities/daily-summary.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('weekly-summarys')
export class WeeklySummary {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('date')
    date: Date;

    @OneToMany(() => DailySummary, (dailySummary) => dailySummary.weeklySummary, {nullable: true})
    dailySummarys?: DailySummary[];

    @Column({default: false})
    isDeleted: boolean;
}
