import { ContractReceipt } from "ethers"
import { Chainbridge } from "../../src"

describe("Chainbridge e2e deposit event", () => {
  const testintAcc = '0xF4314cb9046bECe6AA54bb9533155434d0c76909'
  let chainbridge: Chainbridge
  it("Should transfer some tokens from chain1 to chain2", async () => {
    const amount = 7
    const recipientAddress = testintAcc
    const from = "chain1"
    const to = "chain2"

    const depositAction = await chainbridge.deposit(
      amount,
      recipientAddress,
      from,
      to
    )

    console.log("depositAction", depositAction)
    const { status } = depositAction as ContractReceipt
    expect(status).toBe(1)
  })
})
