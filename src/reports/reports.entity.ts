import { User } from '@/users/users.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  price: number;

  @Column()
  make: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column()
  mileage: number;

  @Column({ type: 'double precision' })
  lat: number;

  @Column({ type: 'double precision' })
  lng: number;

  @Column({ default: false })
  approved: boolean;

  @ManyToOne(() => User, (user) => user.reports)
  user: User;
}
