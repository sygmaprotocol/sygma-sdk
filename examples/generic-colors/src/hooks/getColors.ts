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
    
    const colorLength = await colorContractNode2.connect(signerNode2).getColorsArrayLenght()
    const iterable = Array.from(Array(colorLength.toNumber()).keys()).map(i => i)

    let colorsDecoded = []
    for await (let k of iterable){
      const color = await colorContractNode2.connect(signerNode2).colorsArray(k)
    const colorDecoded = decodeColor(color)
      colorsDecoded.push(colorDecoded)
    }

    dispatch({
      type: 'getColorsNode2',
      payload: colorsDecoded
    })

  }


  const providerDestinationChain = state?.sygmaInstance && state.sygmaInstance.getDestinationChainProvider()
  const signerDestinationChain = providerDestinationChain && providerDestinationChain!.getSigner(state.accountData)

  useEffect(() => {
    if(state.sygmaInstance && state.accountData && state.accountDataFromSygma){
      console.warn("Getting colors data")
      console.log("Color node 1", colorContractNode1)
      const signerChain1 = state.sygmaInstance.getSigner('chain1')
      getColorHomeChain(signerChain1!)

      getColorDestinationChain(signerDestinationChain)
      // getColorsArrayLenght(signerDestinationChain)
      
    }
  }, [state.sygmaInstance, state.accountData, state.accountDataFromSygma])

  useEffect(() => {
    if(state.depositStatus === 'done'){
      getColorDestinationChain(signerDestinationChain)
    }
  }, [state.depositStatus])
}

export { GetColors }