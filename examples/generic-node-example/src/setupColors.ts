import { ethers, BigNumber } from "ethers";
import dotenv from "dotenv";
import { NonceManager } from "@ethersproject/experimental";
import ColorsAbi from "./abis/colors-abi.json";
import ColorsAddress from "./colors.json";

void dotenv.config();

const toHex = (covertThis: string, padding: number): string => {
  return ethers.utils.hexZeroPad(
    ethers.utils.hexlify(BigNumber.from(covertThis)),
    padding
  );
};

const setColor = async (): Promise<void> => {
  const {
    env: { localNode1, localNode2 },
  } = process;

  const bridgeAdmin = "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b";
  const provider1 = new ethers.providers.JsonRpcProvider(localNode1);
  const provider2 = new ethers.providers.JsonRpcProvider(localNode2);

  const firstAccount = (await provider1.listAccounts())[0];

  const wallet = ethers.Wallet.fromMnemonic(
    "black toward wish jar twin produce remember fluid always confirm bacon slush",
    "m/44'/60'/0'/0/0"
  );

  const walletSignerNode1 = wallet.connect(provider1);

  console.log("wallet address", walletSignerNode1.address);

  const tx = {
    to: firstAccount,
    value: ethers.utils.parseEther("10"),
  };

  const managedSignerNode1 = new NonceManager(walletSignerNode1);
  await managedSignerNode1.signTransaction(tx);
  await (await managedSignerNode1.sendTransaction(tx)).wait(1);

  const walletSignerNode2 = wallet.connect(provider2);
  console.log(
    "🚀 ~ file: colors.local.tx.ts ~ line 33 ~ walletSignerNode1",
    walletSignerNode2.address
  );

  const managedSignerNode2 = new NonceManager(walletSignerNode2);
  await managedSignerNode2.signTransaction(tx);
  await (await managedSignerNode2.sendTransaction(tx)).wait(1);

  const signerProvider1 = provider1.getSigner(firstAccount);
  const signerProvider2 = provider2.getSigner(firstAccount);

  const colorContract = new ethers.Contract(
    ColorsAddress.colorsAddressNode1,
    ColorsAbi.abi
  );

  const colorsNode1 = ["0x70F3FF", "0xB2B2B2"];
  const colorsNode2 = ["0xFF8787", "0x00ABB3"];
  const colorsToHexNode1 = colorsNode1.map((color) => toHex(color, 32));
  const colorsToHexNode2 = colorsNode2.map((color) => toHex(color, 32));

  const depositData = toHex(bridgeAdmin, 32);

  for await (const colorHexed of colorsToHexNode1) {
    try {
      await (
        await colorContract
          .connect(signerProvider1)
          .setColor(depositData, colorHexed)
      ).wait(1);
      console.log(`Success to setup color ${colorHexed} on Node 1`);
    } catch (e) {
      console.log("Error on setting up color", e);
    }
  }

  for await (const colorsHexed of colorsToHexNode2) {
    try {
      await (
        await colorContract
          .connect(signerProvider2)
          .setColor(depositData, colorsHexed)
      ).wait(1);
      console.log(`Success to setup color ${colorsHexed} on Node 2`);
    } catch (e) {
      console.log("Error on setting up color", e);
    }
  }

  const balanceFirstAccountProvider1 = (
    await signerProvider1.getBalance()
  ).toString();
  const balanceFirstAccountProvider2 = (
    await signerProvider2.getBalance()
  ).toString();

  console.log("Balance on Node 1", balanceFirstAccountProvider1);
  console.log("Balance on Node 2", balanceFirstAccountProvider2);
};

void setColor();
