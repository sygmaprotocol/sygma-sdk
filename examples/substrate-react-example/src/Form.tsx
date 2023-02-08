import React, {CSSProperties} from "react";
import { useForm } from "react-hook-form";

import { useSubstrateState, useSubstrate } from "./substrate-lib";

const inputStyles: CSSProperties = {
  display: "flex",
  alignSelf: "center",
  width: "50%",
  padding: "10px",
  border: "1px solid grey",
  textAlign: "start",
  fontSize: "15px",
  borderRadius: "5px",
  marginBottom: "5px",
  boxSizing: "border-box",
};

const labelStyles: CSSProperties = {
  display: "flex",
  alignSelf: "center",
  width: "50%",
  padding: "5px 10px",
  textAlign: "start",
  fontSize: "15px",
  borderRadius: "5px",
  marginBottom: "5px",
  boxSizing: "border-box",
};

const buttonStyle: CSSProperties = {
  display: "flex",
  alignSelf: "center",
  width: "23%",
  padding: "10px",
  marginTop: "15px",
  justifyContent: "center",
};

function Main(props: any): JSX.Element {
  const {
    makeDeposit
  } = useSubstrate();
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      amount: "11",
      address: "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b",
      from: "2",
      to: "1",
    },
  });

  const submit = async (values: {
    amount: string;
    address: string;
    from: string;
    to: string;
  }): Promise<void> => {
    console.log(values)
    if (values.amount && values.address) {
      makeDeposit(values.amount, values.address, values.to)
    }
  }

  return(
    <form
      action=""
      onSubmit={(...args) => void handleSubmit(submit)(...args)}
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <label htmlFor="amount" style={{ ...labelStyles }}>
        Amount
      </label>
      <input
        type="text"
        placeholder="amount"
        {...register("amount")}
        style={{ ...inputStyles }}
      />
      <label htmlFor="address" style={{ ...labelStyles }}>
        Recepient address
      </label>
      <input
        type="text"
        placeholder="address"
        {...register("address")}
        style={{ ...inputStyles }}
      />
      <label htmlFor="from" style={{ ...labelStyles }}>
        Home chain
      </label>
      <input type="text" {...register("from")} style={{ ...inputStyles }} />
      <label htmlFor="to" style={{ ...labelStyles }}>
        Destination chain
      </label>
      <input type="text"  {...register("to")} style={{ ...inputStyles }} />
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-evenly",
        }}
      >
        <button
          type="submit"
          style={{
            ...buttonStyle,
            background: "white",
            color: "green",
            border: "1px solid green",
            fontWeight: "800",
            borderRadius: "5px",
          }}
        >
          Transfer
        </button>
      </div>
    </form>
  );
}
export default Main;
