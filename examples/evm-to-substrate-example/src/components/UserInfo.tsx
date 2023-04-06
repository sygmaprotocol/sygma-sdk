import React, { useEffect, useState } from "react";
import { utils } from "ethers";
import { useEvm } from "../evm-lib";

function Main(): JSX.Element {
  const {
    state: {
      currentAccount,
      ethBalance,
      selectedErc20Balance,
      basicFee,
      erc20AllowanceForBridge,
    },
  } = useEvm();
  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h3>Account data</h3>
        Account address: <span>{currentAccount}</span>
        {ethBalance && (
          <p>
            ETH balance: <span>{utils.formatEther(ethBalance)}</span>
          </p>
        )}
        {selectedErc20Balance && (
          <p>
            Balance of ERC20 tokens:{" "}
            <strong>{utils.formatUnits(selectedErc20Balance, 18)}</strong>
          </p>
        )}
        {basicFee && (
          <p>
            Basic fee(ETH):{" "}
            <strong>{basicFee.calculatedRate.toString()}</strong>
          </p>
        )}
        <p>
          ERC20 allowance for Bridge:{" "}
          <strong>{utils.formatUnits(erc20AllowanceForBridge ?? 0, 18)}</strong>
        </p>
      </div>
    </div>
  );
}

export default function UserInfo(
  props: JSX.IntrinsicAttributes
): JSX.Element | null {
  const {
    state: { signer },
  } = useEvm();
  return signer ? <Main {...props} /> : null;
}
