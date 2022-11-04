import { ethers } from 'ethers'
import Chalk from 'chalk'
import ColorsABI from './abis/colors-abi.json'
import {
  colorsAddress,
  node1RpcUrl,
  node2RpcUrl,
  bridgeAdmin
} from './bridgeSetup'
import { decodeColor } from './abis/decodeColor';
import { setupSygma } from './sygmaInstance'
import { FeeDataResult } from '@buildwithsygma/sygma-sdk-core'

const providerNode1 = new ethers.providers.JsonRpcProvider(node1RpcUrl);
const providerNode2 = new ethers.providers.JsonRpcProvider(node2RpcUrl)

const depositGeneric = async () => {
  const account = (await providerNode1.listAccounts())[0]
  const signer = providerNode1.getSigner(account)
  const balanceAccount = (await signer.getBalance()).toString()

  console.log(`${Chalk.keyword('orange')(`Balance of account ${account}: `)} ${Chalk.keyword('yellow')(balanceAccount)}`)

  const colorContractNode1 = new ethers.Contract(colorsAddress, ColorsABI.abi)

  const colorArrayLength = await colorContractNode1.connect(signer).getColorsArrayLenght()

  let depositDataArray: Array<{ color: string, depositData: string }>

  if (colorArrayLength.toNumber() !== 0) {
    const iterable = Array.from(Array(colorArrayLength.toNumber()).keys()).map(i => i)

    let colors = []

    for await (let k of iterable) {
      const color = await colorContractNode1.connect(signer).colorsArray(k)
      const colorDecoded = decodeColor(color)
      console.log(`${Chalk.keyword('orange')('Color decoded')}: ${Chalk.hex(colorDecoded).bold(colorDecoded)}`)
      colors.push(colorDecoded)
    }

    const colorsFormated = colors.map(color => color.substr(1))
    const depositFunctionSignature = '0x103b854b'
    const colorsResourceId = '0x0000000000000000000000000000000000000000000000000000000000000500'

    const sygmaConnected = await setupSygma(account)

    const basicFeeData = await sygmaConnected.fetchBasicFeeData({
      amount: '1000000',
      recipientAddress: bridgeAdmin
    })

    const colorsFormatedToHex = colorsFormated.map(color => ({ color: color, colorToHex: sygmaConnected.toHex(`0x${color}`, 32) }))

    depositDataArray = colorsFormatedToHex.map(color => ({
      color: color.color,
      depositData: sygmaConnected.createGenericDepositDataV1(
        depositFunctionSignature,
        colorsAddress,
        '2000000',
        account,
        color.colorToHex,
        false
      )
    }))

    for await (let { color, depositData } of depositDataArray) {
      try {
        const depositTx = await sygmaConnected.depositGeneric(
          colorsResourceId,
          depositData,
          basicFeeData as FeeDataResult
        )
        console.log(`${Chalk.keyword('orange')('Status of deposit')} ${Chalk.keyword('yellow')(depositTx?.status)}`)
        console.log(`${Chalk.keyword('red')('Color being sent:')} ${Chalk.hex(color).bold(color)}`)
      } catch (e) {
        console.log("Error on generic deposit", e)
      }
    }
  }

  const signerDestinationChain = providerNode2.getSigner(account)

  const filters = colorContractNode1.connect(signerDestinationChain).filters.setColorEvent()

  const listener = async (color: string, ...rest: any) => {
    const colorDecoded = decodeColor(color)
    console.log(`${Chalk.keyword('green')('Color decoded on destination chain')}: ${Chalk.hex(colorDecoded).bold(colorDecoded)}`)
    const lastColor = depositDataArray.findIndex(colorData => colorData.color === colorDecoded.substr(1))

    if (lastColor === depositDataArray.length - 1) {
      setTimeout(() => {
        process.exit(0)
      }, 5000)
    }
  }

  colorContractNode1.connect(signerDestinationChain).on(filters, listener)

}

depositGeneric()