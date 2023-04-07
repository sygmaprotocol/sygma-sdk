import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { useEvm } from "../evm-lib";
// import { evmSetupList } from "../config";

function Main(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const {
    state: { currentAccount, selectedEvmConfig },
    makeDeposit,
  } = useEvm();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      amount: "11",
      address: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", // Bob's address
      from: "1",
      to: "3",
    },
  });

  const submit = async (values: {
    amount: string;
    address: string;
    from: string;
    to: string;
  }): Promise<void> => {
    console.log("form data", values);
    if (values.amount && values.address) {
      // setIsLoading(true);
      await makeDeposit(values.amount, values.address, values.to);
    }
  };

  if (!currentAccount) {
    return <div>Please create accounts</div>;
  }

  return (
    <form action="" onSubmit={(...args) => void handleSubmit(submit)(...args)}>
      <fieldset disabled={isLoading} className="formFieldset">
        <label htmlFor="amount" className="label">
          Amount
        </label>
        <input
          type="text"
          placeholder="amount"
          {...register("amount")}
          className="input"
        />
        <label htmlFor="address" className="label">
          Recepient address
        </label>
        <input
          type="text"
          placeholder="address"
          {...register("address")}
          className="input"
        />
        <label htmlFor="from" className="label">
          Home EVM network domainID: {selectedEvmConfig!.domainId}
        </label>
        <label htmlFor="to" className="label">
          Destination EVM network:
        </label>
        <input
          type="text"
          placeholder="domainId"
          {...register("to")}
          className="input"
        />
        {/* <select {...register("to")} className="input">
          {evmSetupList.map((bridgeItem) => (
            <option key={bridgeItem.domainId} value={bridgeItem.domainId}>
              {bridgeItem.name}
            </option>
          ))}
        </select> */}
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-evenly",
          }}
        >
          <button type="submit" className="button">
            Transfer
          </button>
        </div>
      </fieldset>
    </form>
  );
}
export default Main;
