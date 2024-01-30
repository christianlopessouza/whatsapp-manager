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
    hook_url: string;

    @Column()
    active: boolean;

    @OneToMany(() => Instance, instance => instance.client, {
        cascade: ['update','insert']
    })
    
    @JoinColumn({
        name: 'id'
    })
    instance: Instance[];

}