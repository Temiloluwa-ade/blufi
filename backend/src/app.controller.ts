import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DonationEntity } from './entities/donation.entity';
import { FindOptionsOrder, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { FlowSignature } from './fcl';
import { IsEmail } from 'class-validator';
import { EmailService } from './services/email.service';
import { UserService } from './services/user.service';

class EmailUpdateDto {
  signature: [FlowSignature];
  @IsEmail()
  email: string;
}

@Controller()
export class AppController {
  constructor(
    @InjectRepository(DonationEntity)
    private donationRepository: Repository<DonationEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private userService: UserService,
  ) {}

  @Get('donations')
  async getDonations() {
    const [donations, total] = await this.donationRepository.findAndCount({
      order: { blockTimestamp: 'desc' },
    });
    return { total, donations };
  }

  @Get('users')
  getUsers() {
    return this.userRepository.find();
  }

  @Get('users/:address')
  async getUser(@Param('address') address) {
    return this.userService.getUserInfo(address);
  }

  @Get('users/:address/donations')
  async getUserDonations(@Param('address') address) {
    return this.userService.getUserDonations(address);
  }

  @Put('users/email')
  async updateUserEmailInfo(@Body() data: EmailUpdateDto) {
    return this.userService.updateEmail(data.email, data.signature);
  }
}
