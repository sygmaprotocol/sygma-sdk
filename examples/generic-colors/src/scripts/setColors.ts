import { ethers, BigNumber } from 'ethers'
import { NonceManager } from '@ethersproject/experimental'
import ColorsAbi from '../abis/colors-abi.json'
const colorsAddress = "0xE54Dc792c226AEF99D6086527b98b36a4ADDe56a";

const toHex = (covertThis: string, padding: number) => {
  return ethers.utils.hexZeroPad(ethers.utils.hexlify(BigNumber.from(covertThis)), padding);
};

const setColor = async () => {
  const bridgeAdmin = "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b";
  const provider1 = new ethers.providers.JsonRpcProvider('http://localhost:8545')
  const provider2 = new ethers.providers.JsonRpcProvider('http://localhost:8547')


  const wallet = ethers.Wallet.fromMnemonic(
    "black toward wish jar twin produce remember fluid always confirm bacon slush",
    "m/44'/60'/0'/0/0",
  );

  const walletSignerNode1 = wallet.connect(provider1);
  console.log(
    "🚀 ~ file: colors.local.tx.ts ~ line 33 ~ walletSignerNode1",
    walletSignerNode1.address,
  );

  const managedSignerNode1 = new NonceManager(walletSignerNode1);

  const walletSignerNode2 = wallet.connect(provider2);
  console.log(
    "🚀 ~ file: colors.local.tx.ts ~ line 33 ~ walletSignerNode1",
    walletSignerNode2.address,
  );

  const managedSignerNode2 = new NonceManager(walletSignerNode2);

  const colorContract = new ethers.Contract(
    colorsAddress,
    ColorsAbi.abi
  )

  const colorsNode1 = ['0x70F3FF', '0xB2B2B2']
  const colorsNode2 = ['0xFF8787', '0x00ABB3']
  const colorsToHexNode1 = colorsNode1.map(color => toHex(color, 32))
  colorsToHexNode1.forEach(color => {
    console.log("🚀 ~ file: setColors.ts ~ line 47 ~ setColor ~ color node 1", color)
  })
  const colorsToHexNode2 = colorsNode2.map(color => toHex(color, 32))
  colorsToHexNode2.forEach(color => {
    console.log("🚀 ~ file: setColors.ts ~ line 47 ~ setColor ~ color node 2", color)
  })
  const depositData = toHex(bridgeAdmin, 32)

  for await (let colorHexed of colorsToHexNode1) {
    try {
      await (
        await colorContract.connect(managedSignerNode1).setColor(depositData, colorHexed)
      ).wait(1)
      console.log(`Success to setup color ${colorHexed} on Node 1`)
    } catch (e) {
      console.log("Error on setting up color", e)
    }
  }

  for await (let colorsHexed of colorsToHexNode2) {
    try {
      await (
        await colorContract.connect(managedSignerNode2).setColor(depositData, colorsHexed)
      ).wait(1)
      console.log(`Success to setup color ${colorsHexed} on Node 2`)
    } catch (e) {
      console.log("Error on setting up color", e)
    }
  }

}

setColor()