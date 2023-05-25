import { ApiPromise, WsProvider } from '@polkadot/api';
import { getAssetBalance } from './src/chains/Substrate/utils/getAssetBalance';
import { getNativeTokenBalance } from './src/chains/Substrate/utils/getNativeTokenBalance';
import { getBasicFee } from './src/chains/Substrate/utils/getBasicFee';
import { deposit } from './src/chains/Substrate/utils/depositFns';
import { localConfig } from './src/localConfig';
import { SubstrateResource } from './src/types';
import { Keyring } from '@polkadot/keyring';

// Construct API provider
const wsProvider = new WsProvider('ws://127.0.0.1:9944');
const api = await ApiPromise.create({ provider: wsProvider });
const nativeBalance = await getNativeTokenBalance(
  api,
  '5EL7yNGnw9JyynfGzNfEsNSbDdubrVGteCan1bgR91djHkky',
);
console.log('native balance');
console.log(nativeBalance);

const assetBalance = await getAssetBalance(
  api,
  2000,
  '5EL7yNGnw9JyynfGzNfEsNSbDdubrVGteCan1bgR91djHkky',
);

console.log('asset balance');
console.log(assetBalance);

const fee = await getBasicFee(
  api,
  1,
  (localConfig.domains[1].resources[0] as SubstrateResource).xsmMultiAssetId,
);

console.log('Fee');
console.log(fee);

const submittableTx = deposit(
  api,
  (localConfig.domains[1].resources[0] as SubstrateResource).xsmMultiAssetId,
  '100',
  '2',
  '0x0da26cd0578c98b44b9ff554dd234e2822e6bf11000000000000000000000000',
);

console.log(submittableTx);

const keyring = new Keyring({ type: 'sr25519' });
const mnemonic = 'zoo slim stable violin scorpion enrich cancel bar shrug warm proof chimney';
const account = keyring.addFromUri(mnemonic);

const unsub = await submittableTx.signAndSend(account, ({ status }) => {
  console.log(`Current status is ${status.toString()}`);

  if (status.isInBlock) {
    console.log(`Transaction included at blockHash ${status.asInBlock.toString()}`);
  } else if (status.isFinalized) {
    console.log(`Transaction finalized at blockHash ${status.asFinalized.toString()}`);
    unsub();
  }
});
