import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { useEvm } from "../evm-lib";

function Main(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const {
    state: { currentAccount, selectedEvmConfig },
    makeDeposit,
  } = useEvm();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      amount: "11",
      address: "3zmVCqbvMRgtrt48zR8C5Kz3Ast6sVsdMXNJt2mAETj7s2z8", // Bob's address
      from: "0",
      to: "5",
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
      setIsLoading(true);
      await makeDeposit(values.amount, values.address, values.to);
      setIsLoading(false);
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
          Destination Substrate network domainID:
        </label>
        <input
          type="text"
          placeholder="domainId"
          {...register("to")}
          className="input"
        />
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
