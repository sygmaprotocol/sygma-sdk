/* eslint-disable */
require('dotenv').config();

const {ApiPromise, WsProvider, Keyring} = require('@polkadot/api');
const {cryptoWaitReady} = require('@polkadot/util-crypto');
// Some helper functions used here
const { stringToU8a, u8aToHex } = require('@polkadot/util');
const BN = require('bn.js');

const bn1e12 = new BN(10).pow(new BN(12));

async function main() {
  const sygmaPalletProvider = new WsProvider(process.env.PALLETWSENDPOINT || 'ws://127.0.0.1:9944');
  const api = await ApiPromise.create({
      provider: sygmaPalletProvider,
  });
  // Wait until we are ready and connected
  await api.isReady;
  // Do something
  console.log(api.genesisHash.toHex());


  // The actual address that we will use
  const ADDR1 = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
  const ADDR2 = BOB = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';

  const keyring = new Keyring({type: 'sr25519'});
  // (Advanced, development-only) add with an implied dev seed and hard derivation
  const alice = keyring.addFromUri('//Alice', { name: 'Alice default' });
  // Log some info
// construct a transaction
  const transfer = api.tx.balances.transfer(BOB, 12345);

  // retrieve the payment info
  const { partialFee, weight } = await transfer.paymentInfo(alice);

  console.log(`transaction will have a weight of ${weight}, with ${partialFee.toHuman()} weight fees`);

// // Show the hash
// console.log(`Submitted with hash ${txHash}`);

  // await cryptoWaitReady();
  // const keyring = new Keyring({type: 'sr25519'});
  // const sudo = keyring.addFromUri('//Alice');
  // const asset = 0 // Concrete(MultiLocation::new(0, Here));
  // const basicFeeAmount = bn1e12.mul(new BN(200)); // 200 * 10 ** 12
  // const mpcAddr = process.env.MPCADDR || '0x1c5541A79AcC662ab2D2647F3B141a3B7Cdb2Ae4';
  // const balance = await api.derive.balances?.all(account);
  // await setMpcAddress(api, mpcAddr, true, sudo);
  // await setFee(api, asset, basicFeeAmount, true, sudo);

  // bridge should be unpaused by the end of the setup
  // if (!await queryBridgePauseStatus(api)) console.log('🚀 Sygma substrate pallet setup is done! 🚀');

  // It is unnecessary to set up access segregator here since ALICE will be the sudo account and all methods with access control logic are already setup in this script.
  // so that on Relayer, E2E test cases are only about public extrinsic such as deposit, executionProposal, retry .etc
}

main()
// .catch(console.error).finally(() => process.exit());