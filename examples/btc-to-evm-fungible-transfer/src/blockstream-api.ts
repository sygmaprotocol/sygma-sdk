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
    throw new Error("Failed to broadcast transaction");
  }
}
