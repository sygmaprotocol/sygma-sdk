import { useEffect } from 'react'
import { Actions, State } from "../reducers";
import ColorsAbi from '../abis/colors-abi.json'
import { ethers } from 'ethers';
import ColorsAddress from "../colors.json";

const ColorsDestinationChainListener = (state: State, dispatch: React.Dispatch<Actions>) => {
  useEffect(() => {
    if (state.metamaskConnected && state.accountData && state.sygmaInstance && state.accountDataFromSygma) {
      const colorsContractDestinationChain = new ethers.Contract(
        ColorsAddress.colorsAddressNode1,
        ColorsAbi.abi
      )
      const providerDestinationChain = state.sygmaInstance?.getDestinationChainProvider()
      const signerDestinationChain = providerDestinationChain?.getSigner(state.accountData)

      const filters = colorsContractDestinationChain.connect(signerDestinationChain!).filters.setColorEvent()

      colorsContractDestinationChain.connect(signerDestinationChain!).on(filters, (color) => {
        console.warn("🚀 ~ file: colorsDestinationChainListener.ts ~ line 26 ~ colorsContractDestinationChain.on ~ color", color)
        dispatch({
          type: 'depositSuccess',
          payload: 'done'
        })
      })

    }
  }, [state.accountData, state.metamaskConnected, state.sygmaInstance, state.accountDataFromSygma])
}

export { ColorsDestinationChainListener }