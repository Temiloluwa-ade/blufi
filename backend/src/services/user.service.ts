import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { EmailService, EmailTemplate } from './email.service';
import { FlowSignature } from '../fcl';
import * as fcl from '../fcl';
import { DonationEntity } from '../entities/donation.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(DonationEntity)
    private donationRepository: Repository<DonationEntity>,
    private emailService: EmailService,
  ) {
    fcl.init();
  }

  async getUserInfo(address: string) {
    const [user, donations] = await Promise.all([
      this.userRepository.findOneOrFail({ where: { address } }),
      this.getUserDonations(address),
    ]);
    return { user, ...donations };
  }

  async getUserDonations(address: string) {
    const [from, to] = await Promise.all([
      this.donationRepository.find({
        where: { from: address },
        order: { blockTimestamp: 'desc' },
      }),
      this.donationRepository.find({
        where: { to: address },
        order: { blockTimestamp: 'desc' },
      }),
    ]);
    return { from, to };
  }

  async updateEmail(email: string, signature: [FlowSignature]) {
    const isValid = await fcl.isValidSignature(email, signature);
    if (!isValid) {
      throw new UnauthorizedException('Signature invalid');
    }
    const address = signature[0].addr;
    await this.userRepository.upsert(
      { address, email },
      { conflictPaths: ['address'] },
    );
    await this.sendWelcomeEmail(address);
  }

  async sendWelcomeEmail(address: string) {
    const user = await this.userRepository.findOneBy({ address });
    if (user.email && !user.isWelcomeEmailSent) {
      await this.emailService.send<EmailTemplate.WELCOME>({
        template: EmailTemplate.WELCOME,
        templateData: { name: user.name },
        to: user.email,
      });
      await this.userRepository.update(user.address, {
        isWelcomeEmailSent: true,
      });
    }
  }
}
