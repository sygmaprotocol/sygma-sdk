import { Signer } from "@buildwithsygma/sygma-sdk-core";
import { ethers } from "ethers";
import { useEffect } from "react";
import { Actions, State } from "../reducers";
import { decodeColor } from "../utils";

function GetColors(state: State, dispatch: React.Dispatch<Actions>, colorContractNode1: ethers.Contract, colorContractNode2: ethers.Contract){

  const getColorHomeChain = async (signerNode1: Signer) => {
    const colorLength = await colorContractNode1.connect(signerNode1!).getColorsArrayLenght()
    if(colorLength.toNumber() !== 0) {
      const iterable = Array.from(Array(colorLength.toNumber()).keys()).map(i => i)

      let colorsDecoded = []
      for await (let k of iterable){
        const color = await colorContractNode2.connect(signerNode1!).colorsArray(k)
        const colorDecoded = decodeColor(color)
        colorsDecoded.push(colorDecoded)
      }
      dispatch({
        type: 'getColorsNode1',
        payload: colorsDecoded
      })
    }
  }

  const getColorDestinationChain = async (signerNode2: Signer) => {
    
    const colorLength = await colorContractNode2.connect(signerNode2!).getColorsArrayLenght()
    if(colorLength.toNumber() !== 0){
      const iterable = Array.from(Array(colorLength.toNumber()).keys()).map(i => i)
  
      let colorsDecoded = []
      for await (let k of iterable){
        const color = await colorContractNode2.connect(signerNode2!).colorsArray(k)
        const colorDecoded = decodeColor(color)
        colorsDecoded.push(colorDecoded)
      }
      
      dispatch({
        type: 'getColorsNode2',
        payload: colorsDecoded
      })
    }

  }


  const providerDestinationChain = state?.sygmaInstance && state.sygmaInstance.getDestinationChainProvider()
  const signerDestinationChain = providerDestinationChain && providerDestinationChain!.getSigner(state.accountData)

  useEffect(() => {
    if(state.sygmaInstance && state.accountData && state.accountDataFromSygma){
      const signerChain1 = state.sygmaInstance.getSigner('chain1')
      getColorHomeChain(signerChain1!)

      getColorDestinationChain(signerDestinationChain!)
      
    }
  }, [state.sygmaInstance, state.accountData, state.accountDataFromSygma])

  useEffect(() => {
    if(state.depositStatus === 'done'){
      getColorDestinationChain(signerDestinationChain!)
    }
  }, [state.depositStatus])
}

export { GetColors }