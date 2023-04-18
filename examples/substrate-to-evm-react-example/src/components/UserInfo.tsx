import React, { useEffect, useState } from "react";
import { formatBalance } from "@polkadot/util";
import { useSubstrateState, useSubstrate } from "../substrate-lib";
import { substrateConfig } from "../config";

function Main(): JSX.Element {
  const { api } = useSubstrateState()!;

  const {
    setCurrentAccount,
    state: {
      keyring,
      currentAccount,
      currentAccountData,
      selectedAssetBalance,
      selectedAssetFee,
    },
  } = useSubstrate()!;

  const keyringOptions = keyring?.getPairs().map((account) => ({
    key: account.address,
    value: account.address,
    text: (account.meta.name as String).toUpperCase(),
    icon: "user",
  }));
  const initialAddress =
    keyringOptions!.length > 0
      ? keyringOptions![keyringOptions!.length - 1].value
      : "";
  // Set the initial address
  useEffect(() => {
    !currentAccount &&
      initialAddress.length > 0 &&
      setCurrentAccount(keyring?.getPair(initialAddress));
  }, [currentAccount, setCurrentAccount, keyring]);

  return (
    <div>
      {currentAccount ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h3>Account data</h3>
          <p>
            {"Account name: "}
            {keyring && keyringOptions && (
              <select
                defaultValue={currentAccount.address}
                onChange={(event) =>
                  setCurrentAccount(keyring?.getPair(event.target.value))
                }
              >
                {keyringOptions.map((account) => (
                  <option key={account.key} value={account.value}>
                    {account.text}
                  </option>
                ))}
              </select>
            )}
            <br />
            Account address: <span>{currentAccount.address}</span>
            <br />
            NATIVE TOKENS(gas):{" "}
            <span>
              {currentAccountData &&
                formatBalance(currentAccountData.free, {
                  decimals: api?.registry.chainDecimals[0],
                  withSiFull: true,
                  withZero: false,
                })}
            </span>
            <br />
            Balance of custom tokens(assets):{" "}
            <strong>
              {selectedAssetBalance &&
                formatBalance(selectedAssetBalance.balance, {
                  decimals: api?.registry.chainDecimals[0],
                  withSi: true,
                  withUnit: substrateConfig.assets[0].assetName,
                  withZero: false,
                })}
            </strong>
            <br />
            Basic fee:{" "}
            <strong>
              {!selectedAssetFee?.isEmpty
                ? formatBalance(selectedAssetFee?.unwrap(), {
                    decimals: api?.registry.chainDecimals[0],
                    withSi: true,
                    withUnit: substrateConfig.assets[0].assetName,
                    withZero: false,
                  })
                : "None"}
            </strong>
          </p>
        </div>
      ) : (
        "No accounts found"
      )}
    </div>
  );
}

export default function Metadata(props: any) {
  const state = useSubstrateState();
  const api = state?.api;
  return api?.rpc && api.rpc.state ? <Main {...props} /> : null;
}
