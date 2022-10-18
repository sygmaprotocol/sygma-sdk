import { Sygma } from "@buildwithsygma/sygma-sdk-core"

export type State = {
  colorsNode1: Array<any>,
  colorsNode2: Array<any>,
  txInit: boolean,
  removeColors: boolean,
  newLength: number,
  metamaskConnected: boolean | undefined
  accountData: string | undefined,
  sygmaInstance: Sygma,
  data: any | undefined,
  accountDataFromSygma: { balance: string, gasPrice: string } | undefined,
  homeChainUrl: string,
  destinationChainUrl: string,
  depositStatus: string
}

export type Actions = { type: 'connectMetamask', payload: boolean } | { type: 'getColorsNode1', payload: any } | { type: 'getColorsNode2', payload: any } | { type: 'txInit', payload: boolean } | { type: 'removeColors', payload: any } | { type: 'changeLength', payload: any } | { type: 'setAccountData', payload: string } | { type: 'setSygmaInstance', payload: Sygma } | { type: 'setData', payload: any } | { type: 'setAccounDataFromSygma', payload: any } | { type: 'getColorsNode1', payload: any } | { type: 'getColorsNode2', payload: any } | { type: 'setHomeChain', payload: string } | { type: 'setDestinationChain', payload: string } | { type: 'depositSuccess', payload: "init" | "done" | "error" | "none" }

export const reducer = (state: State, action: Actions): State => {
  switch (action.type) {
    case 'getColorsNode1': {
      console.log("🚀 ~ file: reducer.ts ~ line 6 ~ reducer ~ getColorNode1")
      const colors = action.payload
      return {
        ...state,
        colorsNode1: colors
      }
    }
    case 'getColorsNode2': {
      console.log("🚀 ~ file: reducer.ts ~ line 14 ~ reducer ~ getColorsNode2")
      const colors = action.payload
      return {
        ...state,
        colorsNode2: colors
      }
    }
    case 'txInit': {
      return {
        ...state,
        txInit: action.payload
      }
    }
    case 'removeColors': {
      return {
        ...state,
        removeColors: action.payload
      }
    }
    case 'changeLength': {
      return {
        ...state,
        newLength: action.payload
      }
    }
    case "connectMetamask": {
      return {
        ...state,
        metamaskConnected: action.payload
      }
    }
    case 'setAccountData': {
      return {
        ...state,
        accountData: action.payload
      }
    }
    case "setSygmaInstance": {
      return {
        ...state,
        sygmaInstance: action.payload
      }
    }
    case 'setData': {
      console.log("setData", action.payload)
      return {
        ...state,
        data: action.payload
      }
    }
    case 'setAccounDataFromSygma': {
      return {
        ...state,
        accountDataFromSygma: action.payload
      }
    }
    case 'setHomeChain': {
      return {
        ...state,
        homeChainUrl: action.payload
      }
    }
    case 'setDestinationChain': {
      return {
        ...state,
        destinationChainUrl: action.payload
      }
    }
    case "depositSuccess": {
      console.warn("DEPOSIT STATUS", action.payload)
      return {
        ...state,
        depositStatus: action.payload
      }
    }
    default: {
      return state
    }
  }
}