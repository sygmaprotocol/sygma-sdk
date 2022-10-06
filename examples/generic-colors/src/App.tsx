// @ts-nocheck
import React, { useEffect, useReducer, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import ColorContract from './artifacts/contracts/Colors.sol/Colors.json'
import sygmaContractsNode1 from './sygma-contracts-1.json'
import sygmaContractsNode2 from './sygma-contracts-2.json'
import colorNode1 from './deploy-1.json'
import colorNode2 from './deploy-2.json'
import { reducer } from "./reducer";

const node1RpcUrl = "http://localhost:8551";
const node2RpcUrl = "http://localhost:8552";

const providerNode1 = new ethers.providers.JsonRpcProvider(node1RpcUrl);
const providerNode2 = new ethers.providers.JsonRpcProvider(node2RpcUrl);

const charlie = "0x24962717f8fA5BA3b931bACaF9ac03924EB475a0";

const signerNode1 = providerNode1.getSigner(charlie);
const signerNode2 = providerNode2.getSigner(charlie);

const initState = {
  colorsNode1: [],
  colorsNode2: [],
  txInit: false,
  removeColors: false,
  newLength: 3
}
function App() {
  const [txInit, setTxInit] = useState(false);
  const [state, dispatch] = useReducer(reducer, initState)
  
  const colorContractNode1 = new ethers.Contract(
    colorNode1.colorsAddress,
    ColorContract.abi
  )

  const colorContractNode2 = new ethers.Contract(
    colorNode2.colorsAddress,
    ColorContract.abi
  )

  const filtersNode2 = colorContractNode2.connect(signerNode2).filters.setColorEvent()

  // colorContractNode2.connect(signerNode2).on(filtersNode2, color => console.log("color being set", color))

  const handleClick = async () => {
    console.log('handleClick')
    dispatch({
      type: 'txInit',
      payload: true
    })
  };

  // DISPLAY CURRENT LENGHT OF THE ARRAY
  const getNewColors = async () => {
    const newLength = await colorContractNode2.connect(signerNode2).getColorsArrayLenght()
    alert(`new length => ${newLength.toString()}`)
  }

  const removeColors = async () => {
    console.log("remove colors")
    const arrayLength = (await colorContractNode2.connect(signerNode2).getColorsArrayLenght()).toNumber()
    const elems = Array.from({ length: arrayLength - 3 }, ( _, idx) => idx)
    for await (let e of elems) {
      await colorContractNode2.connect(signerNode2).popColor()
    }
    dispatch({
      type: 'removeColors',
      payload: true
    })
  }

  const setColorNode = async () => {
    console.log("colors to node 2", state.colorsNode1)
    for await (let color of state.colorsNode1){
      // console.log("sending color", color)
      await (
        await colorContractNode1.connect(signerNode1).setColor(color)
      ).wait()
      console.log("setting up color")
    }
    // console.log("colors to node 1", state.colorsNode2)
    // for await (let color of state.colorNode2){
    //   await (
    //     await colorContractNode2.connect(signerNode2).setColor(color)
    //   ).wait()
    // }
    dispatch({
      type: 'txInit',
      payload: false
    })
  }


  const getColorsNode1 = async () => {
    const elems = [0,1,2]
    let c = []
    for await (let e of elems) {
      const color = await colorContractNode1.connect(signerNode1).getCurrentColors(e)
      // console.log("🚀 ~ file: App.tsx ~ line 43 ~ forawait ~ color", color)
      c.push(color)
    }
    dispatch({
      type: 'getColorNode1',
      payload: c
    })
  }

  const getColorsNode2 = async () => {
    console.log("get colors node2")
    const arrayLength = (await colorContractNode2.connect(signerNode2).getColorsArrayLenght()).toNumber()
    console.log("🚀 ~ file: App.tsx ~ line 87 ~ getColorsNode2 ~ arrayLength", arrayLength)
    const elems = Array.from({ length: arrayLength }, ( _, idx) => idx)
    let c = []
    for await (let e of elems) {
      const color = await colorContractNode2.connect(signerNode2).getCurrentColors(e)
      c.push(color)
    }
    dispatch({
      type: 'getColorsNode2',
      payload: c
    })
  }

  useEffect(() => {
    getColorsNode1()
    getColorsNode2()
  }, [])

  useEffect(() => {
    if(state.txInit){
      setColorNode()
    } else {
      setTimeout(() => {
        console.log("else")
        getColorsNode1()
        getColorsNode2()
      }, 4000)
    }

    if(state.removeColors){
      setTimeout(() => {
        console.log("remove colors useEffect")
        getColorsNode1()
        getColorsNode2()
        dispatch({
          type: 'removeColors',
          payload: false
        })
      }, 4000)
    }
  }, [state.txInit, state.removeColors])

  console.log(state)

  return (
    <div className="App">
      <div className="title">
        <div className="title-info">
          <h1>Generic Colors</h1>

          <p className={!txInit ? "off-color" : "on-color"}>
            Status: {txInit ? "On" : "Off"}
          </p>
        </div>
      </div>
      <div className="main-content">
        <div className="box">
          <h4>Node 1: {node1RpcUrl}</h4>
          <h5>Signer: {signerNode1._address}</h5>
          <ul>
            {state?.colorsNode1.length && state.colorsNode1.map((color) => (
              <li style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '10px',
              }}>
                {`Color: ${color}`}{" "}
                <span
                  style={{
                    border: '1px solid',
                    marginLeft: '10px',
                    height: "15px",
                    width: "15px",
                    backgroundColor: color,
                  }}
                ></span>
              </li>
            ))}
          </ul>
        </div>
        <div className="box">
          <h4>Node 2: {node2RpcUrl}</h4>
          <h5>Signer: {signerNode2._address}</h5>
          <ul>
            {state?.colorsNode2.length && state.colorsNode2.map((color) => (
              <li style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '10px',
              }}>
                {`Color: ${color}`}{" "}
                <span
                  style={{
                    border: '1px solid',
                    marginLeft: '10px',
                    height: "15px",
                    width: "15px",
                    backgroundColor: color,
                  }}
                ></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="start-button">
        <button onClick={handleClick}>Start transactions</button>
        <button onClick={getNewColors}>Get current colors length</button>
        <button onClick={removeColors}>Remove them</button>
      </div>
    </div>
  );
}

export default App;
