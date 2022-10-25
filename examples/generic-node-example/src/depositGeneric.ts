import { ethers } from 'ethers'
import { NonceManager } from '@ethersproject/experimental'
import Chalk from 'chalk'
import ColorsABI from './abis/colors-abi.json'
import {
  colorsAddress,
  node1RpcUrl,
  bridgeAdmin
} from './bridgeSetup'
import { decodeColor } from './abis/decodeColor';
import { setupSygma } from './sygmaInstance'
import { FeeDataResult } from '@buildwithsygma/sygma-sdk-core'

const providerNode1 = new ethers.providers.JsonRpcProvider(node1RpcUrl);

const walletNode1 = ethers.Wallet.fromMnemonic(
  "black toward wish jar twin produce remember fluid always confirm bacon slush",
  "m/44'/60'/0'/0/0",
);

const walletSignerNode1 = walletNode1.connect(providerNode1);

const managedSignerNode1 = new NonceManager(walletSignerNode1);

const depositGeneric = async () => {

  const colorContractNode1 = new ethers.Contract(colorsAddress, ColorsABI.abi)

  const colorArrayLength = await colorContractNode1.connect(managedSignerNode1).getColorsArrayLenght()

  if (colorArrayLength.toNumber() !== 0) {
    const iterable = Array.from(Array(colorArrayLength.toNumber()).keys()).map(i => i)

    let colors = []

    for await (let k of iterable) {
      const color = await colorContractNode1.connect(managedSignerNode1).colorsArray(k)
      const colorDecoded = decodeColor(color)
      console.log(`${Chalk.keyword('orange')('Color decoded')}: ${Chalk.hex(colorDecoded).bold(colorDecoded)}`)
      colors.push(colorDecoded)
    }

    const colorsFormated = colors.map(color => color.substr(1))
    console.log("🚀 ~ file: depositGeneric.ts ~ line 42 ~ depositGeneric ~ colorsFormated", colorsFormated)
    const depositFunctionSignature = '0x103b854b'
    const colorsResourceId = '0x0000000000000000000000000000000000000000000000000000000000000500'

    const depositDataFee = `0x${
      // @ts-ignore-next-line
      ethers.utils.hexZeroPad(100, 32).substr(2) +
      // @ts-ignore-next-line
      ethers.utils.hexZeroPad(bridgeAdmin.length, 32).substr(2) +
      (await managedSignerNode1.getAddress()).substr(2)
      }`

    const sygmaConnected = await setupSygma(await managedSignerNode1.getAddress())

    const basicFeeData = await sygmaConnected.fetchBasicFeeData({
      amount: '1000000',
      recipientAddress: bridgeAdmin
    })
    console.log("🚀 ~ file: depositGeneric.ts ~ line 61 ~ depositGeneric ~ basicFeeData", basicFeeData)

    const colorsFormatedToHex = colorsFormated.map(color => ({ color: color, colorToHex: sygmaConnected.toHex(`0x${color}`, 32) }))
    console.log("🚀 ~ file: depositGeneric.ts ~ line 64 ~ depositGeneric ~ colorFormatedToHex", colorsFormatedToHex)

    const depositDataArray: Array<{color: string, depositData: string}> = colorsFormatedToHex.map(color => ({
      color: color.color,
      depositData: sygmaConnected.createGenericDepositDataV1(
        depositFunctionSignature,
        colorsAddress,
        '2000000',
        bridgeAdmin,
        color.colorToHex,
        false
      )
    }))
    console.log("🚀 ~ file: depositGeneric.ts ~ line 74 ~ depositGeneric ~ depositDateArray", depositDataArray)

    for await (let {color, depositData} of depositDataArray) {
      try {
        const depositTx = await sygmaConnected.depositGeneric(
          colorsResourceId,
          depositData,
          basicFeeData as FeeDataResult
        )
        console.log(`${Chalk.keyword('red')('Color being sent:')} ${Chalk.hex(color).bold(color)}`)
      } catch (e){
        console.log("Error on generic deposit", e)
      }
    }
  }
}

depositGeneric()