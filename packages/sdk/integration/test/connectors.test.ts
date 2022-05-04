import { BigNumber, ethers } from "ethers"
import { Connector } from "../../src/connectors"

describe('Connectors', () => {
  const url = "http://localhost:8545"
  const address = "0xF4314cb9046bECe6AA54bb9533155434d0c76909"

  it('Should connect to JsonRpcProvider', () => {
    const connector = Connector.getInstance(url)
    expect(Object.keys(connector)).toHaveLength(1)
  })

  it('Should connect to JsonRpcProvider and setup signer', () => {
    const connector = Connector.getInstance(url, address)
    const { signer, provider } = connector
    expect(Object.keys(connector)).toHaveLength(2)
    expect(provider).toBeInstanceOf(ethers.providers.JsonRpcProvider)
    expect(signer).toBeInstanceOf(ethers.providers.JsonRpcSigner)
  })

  it('Should get data from the signer', async () => {
    const connector = Connector.getInstance(url, address)

    const signerAddress = await connector.getSignerAddress()
    const signerBalance = await connector.getSignerBalance()
    const signerGasPrice = await connector.getSignerGasPrice()

    expect(signerAddress).toMatch(address)
    expect(signerBalance).toBeInstanceOf(BigNumber)
    expect(signerGasPrice).toBeInstanceOf(BigNumber)
  })

  it("Should set signer if no address is provider on getInstance call", () => {
    const connector = Connector.getInstance(url)
    expect(Object.keys(connector)).toHaveLength(1)
    connector.setSigner(address)
    expect(Object.keys(connector)).toHaveLength(2)
  })
})
