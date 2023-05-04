import React from "react";
import { useEvm } from "../evm-lib";

export default function EnviromentSelect(): JSX.Element {
  const {
    state: { enviroment },
    setEnviroment,
  } = useEvm();

  return (
    <div>
      <label htmlFor="enviroment-select">Enviroment: </label>
      <select
        id="enviroment-select"
        name="enviroment-select"
        value={enviroment?.toString()}
        onChange={(e) => {
          setEnviroment(e.target.value);
          window.location.reload();
        }}
      >
        <option value="local">Local docker setup</option>
        <option value="development">{"Goerli <=> Rococo"}</option>
      </select>
    </div>
  );
}
