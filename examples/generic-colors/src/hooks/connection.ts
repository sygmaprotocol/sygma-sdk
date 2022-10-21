import { useEffect } from 'react'
import { Actions, State } from "../reducers";
import { bridgeSetupList } from '../bridgeSetup'
import { Sygma } from '@buildwithsygma/sygma-sdk-core';
import { BigNumber, ethers } from 'ethers';

const handleConnect = (state: State, dispatch: React.Dispatch<Actions>) => {
  // IF META IS NOT SIGNIN, TRIGGER POP OF THE WINDOW FOR THE EXTENSION
  if (!state.metamaskConnected) {
    return window.ethereum
      .request({ method: "eth_requestAccounts" })
      .then((address: string[]) => {
        console.log("request to unlock metamask", address);
        const [addr] = address;
        dispatch({
          type: 'connectMetamask',
          payload: true
        })
        dispatch({
          type: 'setAccountData',
          payload: addr
        })
      })
      .catch((error: any) => {
        if (error.code === 4001) {
          // EIP-1193 userRejectedRequest error
          console.log("Please connect to MetaMask.");
        } else {
          console.error(error);
        }
      });
  } else if (state.metamaskConnected) {
    // SETTING ACCOUNT DATA
    window.ethereum.request({ method: "eth_requestAccounts"}).then(async (address: string[]) => {
      console.warn("Metamask is unlocked")
      const [addr] = address;
      dispatch({
        type: 'setAccountData',
        payload: addr
      })
      console.warn("Initializing Sygma instance on handleConnect function")
      const data = await state.sygmaInstance?.initializeConnectionFromWeb3Provider(
        window.ethereum,
      );
      console.warn("NETWORK DATA", data.selectHomeNetwork(1338))
      dispatch({
        type: 'setData',
        payload: data
      })

    })
    // HERE SETTING HOME AND DESTINATION CHAIN
    window.ethereum.request({ method: 'eth_chainId'}).then((num: number) => {
      const currenChainId = BigNumber.from(num).toNumber()
      const homeChain = bridgeSetupList.find((chain: any) => chain.networkId === currenChainId)
      
      const destinationChain = bridgeSetupList.find((chain: any) => chain.networkId !== currenChainId)
      dispatch({
        type: 'setHomeChain',
        payload: homeChain?.rpcUrl!
      })

      dispatch({
        type: 'setDestinationChain',
        payload: destinationChain?.rpcUrl!
      })
    })

  }
};

function Connection(state: State, dispatch: React.Dispatch<Actions>) {

  useEffect(() => {
    if (window.ethereum !== undefined) {
      (window.ethereum as any).on("chainChanged", (ch: any) => {
        window.location.reload();
      });
      window.ethereum._metamask.isUnlocked().then((res: boolean) => {
        console.log("is metamask unlocked?", res);
        dispatch({
          type: 'connectMetamask',
          payload: res
        })
        const setup = { bridgeSetupList }
        const sygma = new Sygma(setup)
        dispatch({
          type: 'setSygmaInstance',
          payload: sygma
        })
      });
    }
  }, []);


  useEffect(() => {
    console.log("State meta is connected", state.metamaskConnected)
    if (state.metamaskConnected) {
      handleConnect(state, dispatch);
    }
  }, [state.metamaskConnected]);

  // useEffect(() => {
  //   if(state.data !== undefined){
  //     console.log("state data", state.data)
  //     state.data.signers['chain1'].getBalance().then((b: any) => console.log("balance", b))
  //   }
  // }, [state.data])
}

export { Connection, handleConnect }