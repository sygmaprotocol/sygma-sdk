import {
  FeeHandlerWithOracle__factory,
  ERC20__factory,
  BasicFeeHandler__factory,
  Bridge__factory,
  ERC20Handler__factory,
  ERC721MinterBurnerPauser__factory,
  ERC721MinterBurnerPauser
} from '@buildwithsygma/sygma-contracts';
import { utils, BigNumber, ethers } from 'ethers';

async function listTokensOfOwner({ token: tokenAddress, account, signer }: any) {
  const token = ERC721MinterBurnerPauser__factory.connect(tokenAddress, signer);

  console.error(await token.name(), 'tokens owned by', account);

  const sentLogs = await token.queryFilter(
    token.filters.Transfer(account, null),
  );
  const receivedLogs = await token.queryFilter(
    token.filters.Transfer(null, account),
  );

  const logs = sentLogs.concat(receivedLogs)
    .sort(
      (a, b) =>
        a.blockNumber - b.blockNumber ||
        a.transactionIndex - b.transactionIndex,
    );

  const owned = new Set();

  for (const log of logs) {
    const { from, to, tokenId } = log.args;

    if (addressEqual(to, account)) {
      owned.add(tokenId.toString());
    } else if (addressEqual(from, account)) {
      owned.delete(tokenId.toString());
    }
  }

  console.log([...owned].join('\n'));
};

function addressEqual(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}

async function mintNft() {
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
  const wallet = new ethers.Wallet(
    '0x00000000000000000000000000000000000000000000000000636861726c6965'
  );
  const signer = wallet.connect(provider);

  const nftContract = ERC721MinterBurnerPauser__factory.connect('0xd6D787253cc022E6839583aD0cBECfc9c60b581c', signer);
  const nftTx1 = await nftContract.mint('0x24962717f8fA5BA3b931bACaF9ac03924EB475a0', 1, "ipfs://QmRdLguAmNb1fZRBX4gZg6yBpoJVtrzUCtXPoDCM5basi7")
  const nftReceipt1 = await (nftTx1).wait(1)

  const nftTx2 = await nftContract.mint('0x24962717f8fA5BA3b931bACaF9ac03924EB475a0', 2, "ipfs://QmRdLguAmNb1fZRBX4gZg6yBpoJVtrzUCtXPoDCM5basi7")
  const nftReceipt2 = await (nftTx2).wait(1)

  const arr = await listTokensOfOwner({
    token: '0xd6D787253cc022E6839583aD0cBECfc9c60b581c', account: '0x24962717f8fA5BA3b931bACaF9ac03924EB475a0', signer
  })
  console.log("🚀 ~ file: feeOracleScript.ts ~ line 76 ~ testFeeOracle ~ arr", arr)

}
mintNft();