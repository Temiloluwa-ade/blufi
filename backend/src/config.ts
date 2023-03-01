import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export type NodeEnvironment = 'development' | 'staging' | 'production';

export type FlowConfig = {
  accessNode: string;
  deploymentAccountAddress: string;
};
export type EmailConfig = {
  enableSendingEmail: boolean;
  sendgridApiKey: string;
};

type Config = {
  database: TypeOrmModuleOptions;
  flow: FlowConfig;
  email: EmailConfig;
  environment: NodeEnvironment;
  port: number;
  paymentRecurringDayPeriod: number;
};

const database: TypeOrmModuleOptions = {
  type: (process.env.TYPEORM_TYPE as any) || 'mysql',
  host: (process.env.TYPEORM_HOST as any) || '127.0.0.1',
  port: (process.env.TYPEORM_PORT as any) || 3306,
  username: (process.env.TYPEORM_USERNAME as any) || 'root',
  password: (process.env.TYPEORM_PASSWORD as any) || '',
  database: (process.env.TYPEORM_DATABASE as any) || 'blufi',
  synchronize: process.env.NODE_ENV !== 'production',
};

const email = {
  enableSendingEmail: (process.env.EMAIL_ENABLE_SENDING as any) === 'true',
  sendgridApiKey: process.env.EMAIL_SENDGRID_API_KEY as any,
};

const environment = (process.env.NODE_ENV as any) || 'development';

const port = (process.env.PORT as any) || 3001;

const paymentRecurringDayPeriod = process.env.PAYMENT_RECURRING_DAY_PERIOD
  ? parseInt(process.env.PAYMENT_RECURRING_DAY_PERIOD)
  : 1;

const flow: FlowConfig = {
  accessNode: process.env.FLOW_ACCESS_NODE || getAccessNodeApi(),
  deploymentAccountAddress:
    (process.env.FLOW_DEPLOYMENT_ACCOUNT_ADDRESS as any) ||
    '0xf8d6e0586b0a20c7',
};

export const config: Config = {
  database,
  flow,
  email,
  environment,
  port,
  paymentRecurringDayPeriod,
};

if (!config.flow.deploymentAccountAddress) {
  console.log('FLOW_DEPLOYMENT_ACCOUNT_ADDRESS env variable must be set!');
  process.exit(1);
}

function getAccessNodeApi() {
  switch (environment) {
    case 'production':
      return 'https://rest-mainnet.onflow.org/v1';
    case 'staging':
      return 'https://rest-testnet.onflow.org/v1';
    case 'development':
      return 'http://localhost:8080';
  }
}
