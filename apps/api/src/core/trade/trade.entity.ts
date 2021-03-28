import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'trade' })
export class TradeEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createDate: string;

  @Column({ nullable: false, default: 0, type: 'float' })
  weth: number;

  @Column({ nullable: false, default: 0, type: 'float' })
  token: number;

  @Column({ nullable: false, default: 0, type: 'float' })
  ethUsdtCourse: number;

  @Column({ nullable: false, default: 0, type: 'float' })
  tokenUsdtCourse: number;

  @Column({ nullable: false, default: 0, type: 'float' })
  tokenUsdtCourseDepthAsk;

  @Column({ nullable: false, default: 0, type: 'float' })
  tokenUsdtCourseDepthBid;
}
