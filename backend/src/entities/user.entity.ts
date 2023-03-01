import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('user')
export class UserEntity {
  @PrimaryColumn({ length: 250 })
  address: string;

  @Column({ nullable: true, length: 250  })
  name: string | null;

  @Column({ type: 'datetime', nullable: true })
  createdAt: Date | null;

  @Column({ nullable: true, length: 250  })
  email: string | null;

  @Column({ type: 'boolean', default: false })
  isWelcomeEmailSent: boolean;
}
