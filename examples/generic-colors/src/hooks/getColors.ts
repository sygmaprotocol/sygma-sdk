import { Signer } from "@buildwithsygma/sygma-sdk-core";
import { useEffect } from "react";
import { Actions, State } from "../reducers";
import { Colors__factory } from "../types/Colors__factory";
import { decodeColor } from "../utils";

function useGetColors(state: State, dispatch: React.Dispatch<Actions>){

  const getColorHomeChain = async (signerNode1: Signer) => {
    const colorLength = await Colors__factory.connect(state.colorsAddresses.colorsAddressNode1, signerNode1!).getColorsArrayLenght()
    if(colorLength.toNumber() !== 0) {
      const iterable = Array.from(Array(colorLength.toNumber()).keys()).map(i => i)

      let colorsDecoded = []
      for await (let k of iterable){
        const color = await Colors__factory.connect(state.colorsAddresses.colorsAddressNode1, signerNode1!).colorsArray(k)
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
    const colorLength = await Colors__factory.connect(state.colorsAddresses.colorsAddressNode2, signerNode2!).getColorsArrayLenght()
    if(colorLength.toNumber() !== 0){
      const iterable = Array.from(Array(colorLength.toNumber()).keys()).map(i => i)
  
      let colorsDecoded = []
      for await (let k of iterable){
        const color = await Colors__factory.connect(state.colorsAddresses.colorsAddressNode2 ,signerNode2!).colorsArray(k)
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

export { useGetColors }