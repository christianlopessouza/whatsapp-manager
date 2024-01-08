import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn } from 'typeorm'
import Instance from './Instance'

@Entity('clients')
export default class Client {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;

    @Column()
    token: string;

    @Column()
    active: boolean;

    @OneToMany(() => Instance, instance => instance.client, {
        cascade: ['update']
    })
    @JoinColumn({
        name: 'client_id'
    })
    instance: Instance[];

}