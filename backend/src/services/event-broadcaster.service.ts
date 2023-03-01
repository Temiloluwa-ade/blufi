import { EventBroadcasterInterface } from '@rayvin-flow/flow-scanner-lib/lib/broadcaster/event-broadcaster';
import { FlowEvent } from '@rayvin-flow/flow-scanner-lib/lib/flow/models/flow-event';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DonationEntity } from '../entities/donation.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { EmailService, EmailTemplate } from './email.service';
import { UserService } from './user.service';

@Injectable()
export class EventBroadcasterService implements EventBroadcasterInterface {
  private logger = new Logger(EventBroadcasterService.name);
  constructor(
    @InjectRepository(DonationEntity)
    private flowEventRepository: Repository<DonationEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private emailService: EmailService,
    private userService: UserService,
  ) {}

  async broadcastEvents(
    blockHeight: number,
    events: FlowEvent[],
  ): Promise<void> {
    const registrationEvents = [];
    const donationEvents = [];
    for (const event of events) {
      if (event.type.match(/Bluefi\.Donation/)) {
        donationEvents.push(event);
      }
      if (event.type.match(/Bluefi\.Registration/)) {
        registrationEvents.push(event);
      }
    }
    if (registrationEvents.length > 0) {
      this.logger.debug(
        `Received ${registrationEvents.length} registration events`,
        JSON.stringify(registrationEvents, null, 2),
      );
      await this.processRegistrationEvents(registrationEvents);
    }
    if (donationEvents.length > 0) {
      this.logger.debug(
        `Received ${donationEvents.length} donation events`,
        JSON.stringify(donationEvents, null, 2),
      );
      await this.processDonationEvents(donationEvents);
    }
  }

  private async processDonationEvents(events: FlowEvent[]) {
    try {
      const donations = await this.flowEventRepository.save(
        events.map(
          (event) =>
            ({
              id: `${event.blockHeight}.${event.transactionId}.${event.eventIndex}`,
              ...event,
              ...event.data,
            } as unknown as DonationEntity),
        ),
      );
      await Promise.allSettled(
        donations.map(async (event) => {
          const [receiver, sender] = await Promise.all([
            this.userRepository.findOneBy({
              address: event.to,
            }),
            this.userRepository.findOneBy({
              address: event.from,
            }),
          ]);

          const futures = [];
          if (receiver.email) {
            futures.push(
              this.emailService.send<EmailTemplate.TX_RECEIVED>({
                template: EmailTemplate.TX_RECEIVED,
                templateData: { flowAmount: event.amount },
                to: receiver.email,
              }),
            );
          } else {
            this.logger.debug(
              `Email not found for receiver: ${receiver.address}`,
            );
          }
          if (sender.email) {
            futures.push(
              this.emailService.send<EmailTemplate.TX_SENT>({
                template: EmailTemplate.TX_SENT,
                templateData: {
                  flowAmount: event.amount,
                  receiverAddress: receiver.address,
                },
                to: sender.email,
              }),
            );
          } else {
            this.logger.debug(
              `Email not found for sender: ${receiver.address}`,
            );
          }

          return Promise.allSettled(futures);
        }),
      );
    } catch (e) {
      this.logger.error(`Error processing donation events: ${e}`);
    }
  }

  private async processRegistrationEvents(events: FlowEvent[]) {
    try {
      await this.userRepository.upsert(
        events.map(
          (event) =>
            ({
              createdAt: event.blockTimestamp,
              ...event.data,
            } as UserEntity),
        ),
        { conflictPaths: ['address'] },
      );
      await Promise.allSettled(
        events.map(async (e) =>
          this.userService.sendWelcomeEmail(e.data.address),
        ),
      );
    } catch (e) {
      this.logger.error(`Error processing registration events: ${e}`);
    }
  }
}
