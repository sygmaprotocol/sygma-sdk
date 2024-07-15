import type { Signer, Psbt } from "bitcoinjs-lib";

type InputData = {
  hash: string;
  index: number;
  witnessUtxo: { value: number; script: Buffer };
  tapInternalKey: Buffer;
};

type OutputData = { value: number; script: Buffer; address: string };


export async function getFeeEstimates(blockstreamUrl: string): Promise<number> {
  if (!blockstreamUrl) throw new Error("Blockstream url is required");
  try {
    const response = await fetch(`${blockstreamUrl}/fee-estimates`);

    const data = await response.json();

    return data["5"]; // fee for 5 blocks confirmation
  } catch (error) {
    throw new Error("Failed to get fee estimates");
  }
}

export async function broadcastTransaction(
  blockstreamUrl: string,
  txHex: string,
): Promise<string> {
  try {
    const response = await fetch(`${blockstreamUrl}/tx`, {
      method: "POST",
      body: txHex,
      headers: {
        "Content-Type": "text/plain",
      },
    });

    return await response.text();
  } catch (error) {
    console.log("error", error);
    throw new Error("Failed to broadcast transaction");
  }
}

export function calculateFee(
  psbt: Psbt,
  feeRate: number,
  inputData: InputData,
  bridgeOutputData: Pick<OutputData, "script" | "value">,
  valueOutputData: Pick<OutputData, "address" | "value">,
  outputFeeData: Pick<OutputData, "address" | "value">,
  tweakedSigner: Signer,
): number {
  psbt.addInput(inputData);
  psbt.addOutput(bridgeOutputData);
  psbt.addOutput(valueOutputData);
  psbt.addOutput(outputFeeData);

  psbt.signInput(0, tweakedSigner);
  psbt.finalizeAllInputs();

  const tx = psbt.extractTransaction(true);

  const virtualSize = tx.virtualSize();

  return Math.round(virtualSize * feeRate);
}
