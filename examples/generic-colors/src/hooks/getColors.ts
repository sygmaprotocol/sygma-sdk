import { ethers } from "ethers";
import { useEffect } from "react";
import { Actions, State } from "../reducer";
import { decodeColor } from "../utils";

function GetColors(state: State, dispatch: React.Dispatch<Actions>, colorContractNode1: ethers.Contract, colorContractNode2: ethers.Contract){
  const getColorHomeChain = async (signerNode1: ethers.providers.JsonRpcSigner) => {
    const color = await colorContractNode1.connect(signerNode1).colorsArray(0)
    console.log("🚀 ~ file: getColors.ts ~ line 8 ~ getColorNode1 ~ color", color)
    
    const colorDecoded = decodeColor(color)
    console.log("🚀 ~ file: getColors.ts ~ line 12 ~ getColorNode1 ~ colorDecoded", colorDecoded)

    dispatch({
      type: 'getColorsNode1',
      payload: [colorDecoded]
    })
  }

  const getColorDestinationChain = async (signerNode2: ethers.providers.JsonRpcSigner) => {
    const color = await colorContractNode2.connect(signerNode2).colorsArray(0)
    const colorDecoded = decodeColor(color)

    dispatch({
      type: 'getColorsNode2',
      payload: [colorDecoded]
    })
  }

  useEffect(() => {
    if(state.sygmaInstance && state.accountData && state.accountDataFromSygma){
      console.warn("Getting colors data")
      console.log("Color node 1", colorContractNode1)
      const signerChain1 = state.sygmaInstance.getSigner('chain1')
      getColorHomeChain(signerChain1!)

      const providerDestinationChain = state.sygmaInstance.getDestinationChainProvider()
      const signerDestinationChain = providerDestinationChain!.getSigner(state.accountData)
      getColorDestinationChain(signerDestinationChain)
      
    }
  }, [state.sygmaInstance, state.accountData, state.accountDataFromSygma])
}

export { GetColors }