import { ethers } from "ethers";
import fs from "fs";

type Contract = "sprinterNameService" | "storage";

export function getContractInterface(
  contract: Contract
): ethers.utils.Interface {
  const abi = fs.readFileSync(`${process.cwd()}/src/abi/${contract}.json`, {
    encoding: "utf-8",
  });

  const contractInterface = new ethers.utils.Interface(abi);
  return contractInterface;
}

const DEPLOYMENTS: Record<Contract, Record<number, string>> = {
  sprinterNameService: {
    84532: "0x3F9A68fF29B3d86a6928C44dF171A984F6180009",
    11155111: "0xf70fb86F700E8Bb7cDf1c20197633518235c3425",
    1993: "0x17e4C404aD634E429ebCdF9a10F38A96Ce8eEF27",
  },
  storage: {
    11155111: "0x10791B617D2Dad4978Cc18E3A88e422310428430",
    84532: "0xF1bFBbE4174E2E6595E095BDF3ac8b97aF7796aA",
    1993: "0xF5Ac994A5C402F4f426c2D7319C27912d5DBD7a8",
  },
};

export function getContractAddress(
  network: number,
  contract: Contract
): string {
  if (!!DEPLOYMENTS[contract][network]) {
    return DEPLOYMENTS[contract][network];
  }

  throw new Error("Contract address unavailable.");
}
