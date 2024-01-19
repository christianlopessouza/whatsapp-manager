import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm'
import Client from './Client';
import Message from './Message';
import Autosender from './Autosender';
import Batch from './Batch';

@Entity('instances')
export default class Instance {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;

    @Column({ type: 'datetime' })
    insert_timestamp: Date;

    @ManyToOne(() => Client, client => client.instance)
    @JoinColumn({ name: 'client_id' })
    client: Client;


    @OneToMany(() => Message, message => message.instance, {
        cascade: ['insert', 'update']
    })
    @JoinColumn({
        name: 'id',
    })
    messages: Message[];



    @OneToOne(() => Autosender, autosender => autosender.instance, {
        cascade: ['insert', 'update'],
    })
    @JoinColumn({
        name: 'id',
    })
    autosender: Autosender;



    @OneToMany(() => Batch, batch => batch.instance, {
        cascade: ['insert', 'update'],
    })
    @JoinColumn({
        name: 'id',
    })
    batches: Batch[];

}