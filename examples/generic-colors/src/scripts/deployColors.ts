import fs from "fs";
import { promisify } from "util";
import { ContractInterface, ethers } from "ethers";
import { NonceManager } from "@ethersproject/experimental";
import {
  abi as ColorsABI,
  bytecode as ColorsByteCode,
} from "../abis/colors-abi.json";

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const writeFile = promisify(fs.writeFile);

const deployColorsContract = async (): Promise<void> => {
  const provider1 = new ethers.providers.JsonRpcProvider(
    "http://localhost:8545"
  );
  const provider2 = new ethers.providers.JsonRpcProvider(
    "http://localhost:8547"
  );
  const wallet = ethers.Wallet.fromMnemonic(
    "black toward wish jar twin produce remember fluid always confirm bacon slush",
    "m/44'/60'/0'/0/0"
  );

  const walletProvider1 = wallet.connect(provider1);
  const walletProvider2 = wallet.connect(provider2);

  const managedSignerWallet1 = new NonceManager(walletProvider1);
  const managedSignerWallet2 = new NonceManager(walletProvider2);

  console.log(
    await walletProvider1.getAddress(),
    ethers.utils.formatEther(await walletProvider1.getBalance())
  );

  const colorsContractNode1 = new ethers.ContractFactory(
    ColorsABI as ContractInterface,
    ColorsByteCode as string,
    managedSignerWallet1
  );

  const colorsContractNode2 = new ethers.ContractFactory(
    ColorsABI as ContractInterface,
    ColorsByteCode as string,
    managedSignerWallet2
  );

  const colorContracInstanceNode1 = await colorsContractNode1.deploy();
  const colorContractInstanceNode2 = await colorsContractNode2.deploy();

  const colorsAddressNode1 = colorContracInstanceNode1.address;
  const colorsAddressNode2 = colorContractInstanceNode2.address;
  const colors = { colorsAddressNode1, colorsAddressNode2 };

  await writeFile(
    `${process.cwd()}/src/colors.json`,
    JSON.stringify(colors),
    "utf-8"
  );
};

void deployColorsContract();
