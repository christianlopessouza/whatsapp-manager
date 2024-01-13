import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import Client from './Client';
import Message from './Message';

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
        cascade: ['update']
    })

    @JoinColumn({
        name: 'instance_id',
    })
    message: Message[]



}