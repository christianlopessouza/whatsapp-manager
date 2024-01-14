import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn,ManyToOne, OneToOne } from 'typeorm'
import Instance from './Instance';


@Entity('autosender')
export default class Autosender {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    shooting_min: number;

    @Column()
    shooting_max: number;

    @Column()
    timer_start: string;

    @Column()
    timer_end: string;

    @Column()
    days: string;

    @Column()
    active: boolean;

    @OneToOne(() => Instance, instance => instance.autosender)
    @JoinColumn({ name: 'instance_id' })
    instance: Instance;

}