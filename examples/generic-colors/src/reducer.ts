// @ts-nocheck

export const reducer = (state, action) => {
  switch(action.type){
    case 'getColorNode1': {
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
    default: {
      return state
    }
  }
}