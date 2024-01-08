import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import Client from './Client';

@Entity('instances')
export default class Instance {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => Client, client => client.instance)
    @JoinColumn({ name: 'client_id' })
    client: Client;


}