import { ERC20PresetMinterPauser__factory } from "@buildwithsygma/sygma-contracts";
import { ethers } from "ethers";

async function mintERC20(): Promise<void> {
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

  const tokenContract = ERC20PresetMinterPauser__factory.connect(
    "0x1CcB4231f2ff299E1E049De76F0a1D2B415C563A",
    signer
  );
  const mintTx = await tokenContract.mint(
    wallet.address,
    ethers.utils.parseUnits("99.0", 18)
  );
  await mintTx.wait(1);
  const balance = await tokenContract.balanceOf(wallet.address);
  console.log(
    "🚀 ~ file: feeOracle.ts ~ line 174 ~ testFeeOracle ~ balance",
    balance
  );
  const balanceFormatted = ethers.utils.formatUnits(balance, 18);
  console.log(
    "🚀 ~ file: feeOracle.ts ~ line 175 ~ testFeeOracle ~ balanceFormatted",
    balanceFormatted
  );
}
void mintERC20();
