import { BigNumber, ContractInterface, ethers } from "ethers";
import Chalk from "chalk";
import dotenv from "dotenv";
import { FeeDataResult, Sygma } from "@buildwithsygma/sygma-sdk-core";
import ColorsAddress from "./colors.json";
import { abi as ColorsABI } from "./abis/colors-abi.json";
import { decodeColor } from "./abis/decodeColor";
import { setupSygma } from "./sygmaInstance";
import { bridgeAdmin } from "./bridgeSetup";
import { Colors } from "./types/Colors";

void dotenv.config();

const {
  env: { localNode1, localNode2 },
} = process;

const providerNode1 = new ethers.providers.JsonRpcProvider(localNode1);
const providerNode2 = new ethers.providers.JsonRpcProvider(localNode2);

const depositGeneric = async (): Promise<void> => {
  const account = (await providerNode1.listAccounts())[0];
  const signer = providerNode1.getSigner(account);

  const colorContractNode1 = new ethers.Contract(
    ColorsAddress.colorsAddressNode1,
    ColorsABI as ContractInterface
  ) as Colors;

  const colorContractNode2 = new ethers.Contract(
    ColorsAddress.colorsAddressNode2,
    ColorsABI as ContractInterface
  ) as Colors;

  // Here we prepare to listen on destination chain
  const signerDestinationChain = providerNode2.getSigner(account);

  const connectedColorsNode2 = colorContractNode2.connect(
    signerDestinationChain
  );

  const filters = connectedColorsNode2.filters["setColorEvent(bytes32)"];

  let counter = 0;

  const listener = (color: string): void => {
    const colorDecoded = decodeColor(color);
    counter += 1;
    console.log(
      `${Chalk.keyword("green")(
        "Color decoded on destination chain"
      )}: ${Chalk.hex(colorDecoded).bold(colorDecoded)}`
    );

    if (counter == 2) {
      setTimeout(() => {
        process.exit();
      }, 10000);
    }
  };

  const connectedColors = colorContractNode2.connect(signerDestinationChain);

  connectedColors.on(filters, listener);

  const colorArrayLength = await colorContractNode1
    .connect(signer)
    .getColorsArrayLenght();

  let depositDataArray: Array<{ color: string; depositData: string }>;

  if (colorArrayLength.toNumber() !== 0) {
    const iterable = Array.from(Array(colorArrayLength.toNumber()).keys()).map(
      (i) => i
    );

    const colors = [];

    for await (const k of iterable) {
      const color = await colorContractNode1.connect(signer).colorsArray(k);

      const colorDecoded = decodeColor(color);
      console.log(
        `${Chalk.keyword("orange")("Color decoded")}: ${Chalk.hex(
          colorDecoded
        ).bold(colorDecoded)}`
      );
      colors.push(colorDecoded);
    }

    const colorsFormated = colors.map((color) => color.substring(1));
    const depositFunctionSignature = "0x103b854b";
    const permissionlessGenericHandlerResourceID =
      "0x0000000000000000000000000000000000000000000000000000000000000500";

    const sygmaConnected = setupSygma(account) as unknown;

    const basicFeeData = await (sygmaConnected as Sygma).fetchBasicFeeData({
      amount: "1000000",
      recipientAddress: bridgeAdmin,
    });

    const colorsFormatedToHex = colorsFormated.map((color) => ({
      color: color,
      colorToHex: sygmaConnected.toHex(`0x${color}`, 32),
    }));

    depositDataArray = colorsFormatedToHex.map((color) => ({
      color: color.color,
      depositData: sygmaConnected.formatPermissionlessGenericDepositData(
        depositFunctionSignature,
        ColorsAddress.colorsAddressNode1,
        "2000000",
        account,
        color.colorToHex,
        false
      ),
    }));

    for await (const { color, depositData } of depositDataArray) {
      try {
        const depositTx = await sygmaConnected.depositGeneric(
          permissionlessGenericHandlerResourceID,
          depositData,
          basicFeeData as FeeDataResult
        );
        console.log(
          `${Chalk.keyword("orange")("Status of deposit")} ${Chalk.keyword(
            "yellow"
          )(depositTx?.status)}`
        );
        console.log(
          `${Chalk.keyword("red")("Color being sent:")} ${Chalk.hex(color).bold(
            color
          )}`
        );
      } catch (e) {
        console.log("Error on generic deposit", e);
      }
    }
  }
};

void depositGeneric();
