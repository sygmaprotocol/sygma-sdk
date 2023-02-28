import { ERC721MinterBurnerPauser__factory } from "@buildwithsygma/sygma-contracts";
import { ethers } from "ethers";
import { listTokensOfOwner } from "@buildwithsygma/sygma-sdk-core";

async function mintNft(): Promise<void> {
  const provider = new ethers.providers.JsonRpcProvider(
    "http://localhost:8547"
  );
  const wallet = ethers.Wallet.fromMnemonic(
    "black toward wish jar twin produce remember fluid always confirm bacon slush",
    "m/44'/60'/0'/0/0"
  );
  console.log("wallet address: ", wallet.address);
  console.log("wallet private key: ", wallet.privateKey);
  const signer = wallet.connect(provider);

  const nftContract = ERC721MinterBurnerPauser__factory.connect(
    "0x38aAe0b0bC78c44fBA12B1A546954C9bD0F6d5E6",
    signer
  );
  const nftTx1 = await nftContract.mint(
    wallet.address,
    1,
    "ipfs://QmRdLguAmNb1fZRBX4gZg6yBpoJVtrzUCtXPoDCM5basi7"
  );
  const _nftReceipt1 = await nftTx1.wait(1);

  const nftTx2 = await nftContract.mint(
    wallet.address,
    2,
    "ipfs://QmRdLguAmNb1fZRBX4gZg6yBpoJVtrzUCtXPoDCM5basi7"
  );
  const _nftReceipt2 = await nftTx2.wait(1);

  const arr = await listTokensOfOwner({
    token: "0x38aAe0b0bC78c44fBA12B1A546954C9bD0F6d5E6",
    account: wallet.address,
    signer: signer as unknown as ethers.providers.JsonRpcSigner,
  });
  console.log(arr);
}
void mintNft();
