import * as fcl from '@onflow/fcl';
type Environment = 'development' | 'staging' | 'production';

export class FlowSignature {
  addr: string;
  f_type: string;
  f_vsn: string;
  keyId: number;
  signature: string;
}

export function init() {
  const env = process.env.NODE_ENV as Environment;
  fcl
    .config({
      env: getFlowEnv(env),
      'flow.network': getFlowEnv(env),
      'accessNode.api': getAccessNodeApi(env),
    })
}

export async function isValidSignature(
  message: string,
  signatures: [FlowSignature],
) {
  return await fcl.verifyUserSignatures(
    Buffer.from(message).toString('hex'),
    signatures,
  );
}

function getFlowEnv(env: Environment) {
  switch (env) {
    case 'production':
      return 'mainnet';
    case 'staging':
      return 'testnet';
    case 'development':
    default:
      return 'local';
  }
}
function getAccessNodeApi(env: Environment) {
  switch (env) {
    case 'production':
      return 'https://rest-mainnet.onflow.org/v1'; // TODO: this is probably not a correct address
    case 'staging':
      return 'https://access-testnet.onflow.org';
    case 'development':
    default:
      return 'http://localhost:8080';
  }
}
