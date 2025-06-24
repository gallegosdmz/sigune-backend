import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Content } from "./content.entity";

@Entity('contents_files')
export class ContentFile {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Content, (content) => content.contentsFiles)
    content: Content;

    @Column('text', { nullable: true })
    url: string;
    
    @Column({ default: false })
    isDeleted: false;
}