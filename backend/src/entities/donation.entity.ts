import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'donation' })
export class DonationEntity {
  @PrimaryColumn({ length: 250 })
  id: string;

  @Column({ length: 250 })
  blockId: string;

  @Column()
  blockHeight: number;

  @Column({ type: 'datetime' })
  blockTimestamp: Date;

  @Column({ length: 250 })
  transactionId: string;

  @Column()
  transactionIndex: number;

  @Column()
  eventIndex: number;

  @Column({ length: 250 })
  type: string;

  @Column({ length: 250 })
  from: string;

  @Column({ length: 250 })
  to: string;

  @Column()
  amount: number;

  @Column({ length: 250 })
  message: string;

  @Column()
  recurring: boolean;
}
