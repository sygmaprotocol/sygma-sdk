const { ethers, BigNumber } = require('ethers')
const { NonceManager } = require("@ethersproject/experimental");
const colorsAddress = "0xE54Dc792c226AEF99D6086527b98b36a4ADDe56a";
const ColorsAbi = require("../abis/colors-abi.json");

const toHex = (covertThis, padding) => {
	return ethers.utils.hexZeroPad(ethers.utils.hexlify(BigNumber.from(covertThis)), padding);
};

const setColor = async () => {
  const bridgeAdmin = "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b";
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545')

  const walletNode1 = ethers.Wallet.fromMnemonic(
    "black toward wish jar twin produce remember fluid always confirm bacon slush",
    "m/44'/60'/0'/0/0",
  );

  const walletSignerNode1 = walletNode1.connect(provider);
  console.log(
    "🚀 ~ file: colors.local.tx.ts ~ line 33 ~ walletSignerNode1",
    walletSignerNode1.address,
  );

  const managedSignerNode1 = new NonceManager(walletSignerNode1);
  const colorContract = new ethers.Contract(
    colorsAddress,
    ColorsAbi.abi
  )

  const color = '0x70F3FF'
  const colorToHex = toHex(color, 32)
  console.log("🚀 ~ file: setColorNode1.js ~ line 33 ~ setColor ~ colorToHex", colorToHex)
  const depositData = toHex(bridgeAdmin, 32)

  try {
    await (
      await colorContract.connect(managedSignerNode1).setColor(depositData, colorToHex)
    ).wait(1)
    console.log(`Success to setup color ${color} on Node 1`)
  } catch(e){
    console.log("Error on setting up color", e)
  }

}

setColor()