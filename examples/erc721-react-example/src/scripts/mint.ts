import {
  ERC721MinterBurnerPauser__factory,
} from '@buildwithsygma/sygma-contracts';
import { utils, BigNumber, ethers } from 'ethers';
import {
  listTokensOfOwner
} from "@buildwithsygma/sygma-sdk-core";


async function mintNft() {
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8547');
  const wallet = ethers.Wallet.fromMnemonic('black toward wish jar twin produce remember fluid always confirm bacon slush', "m/44'/60'/0'/0/0")
  console.log('wallet address: ', wallet.address)
  console.log('wallet private key: ', wallet.privateKey)
  const signer = wallet.connect(provider);

  const nftContract = ERC721MinterBurnerPauser__factory.connect('0x8dA96a8C2b2d3e5ae7e668d0C94393aa8D5D3B94', signer);
  const nftTx1 = await nftContract.mint(wallet.address, 1, "ipfs://QmRdLguAmNb1fZRBX4gZg6yBpoJVtrzUCtXPoDCM5basi7")
  const nftReceipt1 = await (nftTx1).wait(1)

  const nftTx2 = await nftContract.mint(wallet.address, 2, "ipfs://QmRdLguAmNb1fZRBX4gZg6yBpoJVtrzUCtXPoDCM5basi7")
  const nftReceipt2 = await (nftTx2).wait(1)

  const arr = await listTokensOfOwner({
    token: '0x8dA96a8C2b2d3e5ae7e668d0C94393aa8D5D3B94', account: wallet.address, signer
  })
  console.log(arr)

}
mintNft();