import { useEffect } from 'react'
import { Actions, State } from "../reducers";
import { Colors__factory } from '../types/Colors__factory'
import { setColorEventEvent } from '../types/Colors';

const ColorsDestinationChainListener = (state: State, dispatch: React.Dispatch<Actions>) => {
  useEffect(() => {
    if (state.metamaskConnected && state.accountData && state.sygmaInstance && state.accountDataFromSygma) {
      const providerDestinationChain = state.sygmaInstance?.getDestinationChainProvider()
      const signerDestinationChain = providerDestinationChain?.getSigner(state.accountData)

      const colorsContractDestinationChain = Colors__factory.connect(state.colorsAddresses.colorsAddressNode2, signerDestinationChain)

      const filters = colorsContractDestinationChain.filters.setColorEvent()

      colorsContractDestinationChain.on(filters, (color: string, tx: setColorEventEvent): void => {
        console.warn("Color on destination chain", color)
        dispatch({
          type: 'depositSuccess',
          payload: 'done'
        })
      })

    }
  }, [state.accountData, state.metamaskConnected, state.sygmaInstance, state.accountDataFromSygma])
}

export { ColorsDestinationChainListener }