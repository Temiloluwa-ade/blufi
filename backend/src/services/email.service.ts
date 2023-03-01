import { Injectable, Logger } from '@nestjs/common';
import * as sendGrid from '@sendgrid/mail';
import { config } from '../config';

export enum EmailTemplate {
  WELCOME = 'welcome',
  TX_SENT = 'transaction-sent',
  TX_RECEIVED = 'transaction-received',
  RECURRING_TX_REMINDER = 'recurring-transaction-reminder',
  RECURRING_TX_SECOND_REMINDER = 'recurring-transaction-second-reminder',
  RECURRING_TX_EXPIRATION_REMINDER = 'recurring-transaction-expiration-reminder',
  RECURRING_TX_CANCELED = 'recurring-transaction-canceled',
}

const emailTemplateToId = {
  [EmailTemplate.WELCOME]: 'd-0c089f8dbf98476f894f9e358df6fa07',
  [EmailTemplate.TX_SENT]: 'd-52fa755b69034793af08ecc8d0bf7391',
  [EmailTemplate.TX_RECEIVED]: 'd-cdf967b5894b49dd87011dfa493eb941',
  [EmailTemplate.RECURRING_TX_REMINDER]: 'd-20e477bb900b4895af536f5aa3e5b1e6',
  [EmailTemplate.RECURRING_TX_SECOND_REMINDER]:
    'd-8192d68f73af4287894df86bf8f1e8d4',
};

type SendEmailArgs<T extends EmailTemplate> = {
  subject?: string;
  template: EmailTemplate;
  to: string;
  templateData: EmailTemplateData[T];
};

type TransactionParams = {
  flowAmount: number;
  receiverName: string;
  receiverAddress: string;
  transactionDate: string;
};

type EmailTemplateData = {
  [EmailTemplate.WELCOME]: {
    name: string;
  };
  [EmailTemplate.TX_SENT]: Pick<
    TransactionParams,
    'flowAmount' | 'receiverAddress'
  >;
  [EmailTemplate.TX_RECEIVED]: Pick<TransactionParams, 'flowAmount'>;
  [EmailTemplate.RECURRING_TX_REMINDER]: Pick<
    TransactionParams,
    'flowAmount' | 'receiverAddress' | 'transactionDate'
  >;
  [EmailTemplate.RECURRING_TX_SECOND_REMINDER]: Pick<
    TransactionParams,
    'flowAmount' | 'receiverName' | 'transactionDate'
  >;
  [EmailTemplate.RECURRING_TX_EXPIRATION_REMINDER]: Pick<
    TransactionParams,
    'flowAmount' | 'receiverName' | 'transactionDate'
  >;
  [EmailTemplate.RECURRING_TX_CANCELED]: Pick<
    TransactionParams,
    'receiverName'
  >;
};

@Injectable()

export class EmailService {
  private logger = new Logger(EmailService.name);

  constructor() {
    sendGrid.setApiKey(config.email.sendgridApiKey);
  }

  // For now, we should easily process all email requests in real time,
  // but in case of large load, we should implement a job queue instead.
  // One thing that would be usefully is a job retry policy in case of error.
  send<T extends EmailTemplate>(args: SendEmailArgs<T>) {
    const templateId = emailTemplateToId[args.template];
    if (!templateId) {
      throw new Error('Email template not supported');
    }

    this.logger.debug(
      `Sending ${args.template} email (to: ${
        args.to
      }, templateData: ${JSON.stringify(args.templateData)})`,
    );

    if (!config.email.enableSendingEmail) {
      return;
    }
    return sendGrid.send({
      to: args.to,
      // subject, TODO: subject field probably not necessary, because subject is already set in the design templates
      replyTo: {
        email: 'support@bluefi.me',
        name: 'bluefi Support',
      },
      from: 'no-reply@bluefi.me',
      templateId,
      dynamicTemplateData: args.templateData,
    });
  }
}
