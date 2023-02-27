import React, {useState} from "react";
import { useForm } from "react-hook-form";

import { useSubstrateState, useSubstrate } from "../substrate-lib";
import { substrateConfig, evmSetupList } from "../config";

function Main(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const { currentAccount, destinationDomainId } = useSubstrateState();
  const { makeDeposit } = useSubstrate();
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      amount: "11",
      address: "0x5C1F5961696BaD2e73f73417f07EF55C62a2dC5b",
      from: "3",
      to: "2",
    },
  });

  const submit = async (values: {
    amount: string;
    address: string;
    from: string;
    to: string;
  }): Promise<void> => {
    console.log('form data', values);
    if (values.amount && values.address) {
      setIsLoading(true)
      makeDeposit(values.amount, values.address, values.to).finally(() => {
        setIsLoading(false)
      });
    }
  };

  if (!currentAccount) {
    return <div>Please create accounts</div>;
  }

  return (
    <form
      action=""
      onSubmit={(...args) => void handleSubmit(submit)(...args)}
    >
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
        Home Substrate network domain ID: {substrateConfig.domainId}
      </label>
      <label htmlFor="to" className="label">
        Destination EVM network:
      </label>
      <select {...register("to")} className="input">
        {evmSetupList.map((bridgeItem) => (
          <option key={bridgeItem.domainId} value={bridgeItem.domainId}>
            {bridgeItem.name}
          </option>
        ))}
      </select>
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-evenly",
        }}
      >
        <button
          type="submit"
          className="button"
        >
          Transfer
        </button>
      </div>
      </fieldset>
    </form>
  );
}
export default Main;
