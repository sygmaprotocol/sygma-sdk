import { useEffect } from "react";
import { utils } from 'ethers'
import { Actions, State } from "../reducers";
import colorsAddresses from '../colors.json'

function useAccountData(state: State, dispatch: React.Dispatch<Actions>) {
  const getData = async () => {
    if(state.accountDataFromSygma === undefined){
      const balance = await state?.sygmaInstance!.getSignerBalance('chain1')
      const gasPrice = await state?.sygmaInstance!.getSignerGasPrice('chain1')
      dispatch({
        type: 'setAccounDataFromSygma',
        payload: { balance: utils.formatEther(balance!), gasPrice: gasPrice?.toString() }
      })
    }
  }


  useEffect(() => {
    if (state.sygmaInstance !== undefined && state.data !== undefined) {
      console.warn("Getting account info", state.sygmaInstance)
      getData()
      dispatch({
        type: 'setColorsAddresses',
        payload: colorsAddresses
      })
    }
  }, [state.sygmaInstance, state.data])
}

export { useAccountData }