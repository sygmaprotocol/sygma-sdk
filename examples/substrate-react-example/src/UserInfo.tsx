// @ts-nocheck
import React, { useEffect, useState } from "react";
import { BN, formatBalance } from "@polkadot/util";
import { useSubstrateState, useSubstrate } from "./substrate-lib";
// type import for TypeScript
import { AccountData } from '@polkadot/types/interfaces';
// import {getBasicFee} from "@buildwithsygma/sygma-sdk-core";

type LocalData = {
  balance: BN;
  accountName: string;
  address: string;
  balanceOfTokens: BN;
  basicFee: BN;
  chainDecimals: number;
};

const acctAddr = (acct) => (acct ? acct.address : "");

function Main(props: any): JSX.Element {
  const { api } = useSubstrateState();

  const {
    setCurrentAccount,
    state: { keyring, currentAccount, currentAccountData, selectedAssetBalance, selectedAssetFee },
  } = useSubstrate();

  // Get the list of accounts we possess the private key for
  const keyringOptions = keyring.getPairs().map((account) => ({
    key: account.address,
    value: account.address,
    text: account.meta.name.toUpperCase(),
    icon: "user",
  }));

  const initialAddress =
    keyringOptions.length > 0
      ? keyringOptions[keyringOptions.length - 1].value
      : "";

  // Set the initial address
  useEffect(() => {
    !currentAccount &&
      initialAddress.length > 0 &&
      setCurrentAccount(keyring.getPair(initialAddress));
  }, [currentAccount, setCurrentAccount, keyring, initialAddress]);

  // useEffect(() => {
  //   if (currentAccount) {
  //     const getMetadata = async () => {
  //       try {
  //         const assetRes = await api.query.assets.account(
  //           2000,
  //           currentAccount.address
  //         );
  //         console.log("🚀 ~ file: UserInfo.tsx:58 ~ getMetadata ~ assetRes", assetRes)
  //         const xsmMultiAssetId = {
  //           concrete: {
  //             parents: 1,
  //             interior: {
  //               x3: [
  //                 { parachain: 2004 },
  //                 { generalKey: "0x7379676d61" },
  //                 { generalKey: "0x0" },
  //               ],
  //             },
  //           },
  //         };

  //         const feeRes = await api.query.sygmaBasicFeeHandler.assetFees([
  //           1, // Destination DomainID
  //           xsmMultiAssetId
  //         ]);

  //         const chainDecimals = api.registry.chainDecimals[0];
  //         const balance: AccountData = await api.query.system.account(
  //           currentAccount.address
  //         );

  //         setAccountData({
  //           balance: balance.data.free,
  //           accountName: currentAccount.meta.name,
  //           address: currentAccount.address ?? "",
  //           balanceOfTokens: assetRes.value.balance,
  //           basicFee: feeRes.value,
  //           chainDecimals: chainDecimals,
  //         });
  //       } catch (e) {
  //         console.error(e);
  //       }
  //     };
  //     getMetadata();
  //   }
  // }, [api.rpc.state, currentAccount]);

  return (
    <div>
      {currentAccount && api && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h3>Account data</h3>
          <p>
            Name: <span>{currentAccount.meta.name}</span>
            <br />
            Address: <span>{currentAccount.address}</span>
            <br />
            NATIVE TOKENS:{" "}
            <span>
              {currentAccountData && formatBalance(currentAccountData.free, {
                decimals: api.registry.chainDecimals[0],
                withSiFull: true,
              })}
            </span>
            <br />
            Balance of tokens(assets):{" "}
            <span>
              {selectedAssetBalance && formatBalance(selectedAssetBalance.unwrapOrDefault(0).balance, {
                decimals: api.registry.chainDecimals[0],
                withSi: true,
                withUnit: "USDC",
              })}
            </span>
            <br />
            Basic fee:{" "}
            <span>
              {!selectedAssetFee.isEmpty ? formatBalance(selectedAssetFee.unwrap(), {
                decimals: api.registry.chainDecimals[0],
                withSi: true,
                withUnit: "",
              }) : "None"}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

export default function Metadata(props: any) {
  const { api } = useSubstrateState();
  return api.rpc && api.rpc.state ? <Main {...props} /> : null;
}
