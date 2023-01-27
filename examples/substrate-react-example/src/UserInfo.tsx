/* eslint-disable */
import React, { useEffect, useState } from "react";
import { BN, formatBalance } from "@polkadot/util";
import { useSubstrateState, useSubstrate } from "./substrate-lib";

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
  const [accountData, setAccountData] = useState<LocalData | undefined>(
    undefined
  );
  const { api } = useSubstrateState();

  const {
    setCurrentAccount,
    state: { keyring, currentAccount },
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
    // `setCurrentAccount()` is called only when currentAccount is null (uninitialized)
    !currentAccount &&
      initialAddress.length > 0 &&
      setCurrentAccount(keyring.getPair(initialAddress));
  }, [currentAccount, setCurrentAccount, keyring, initialAddress]);

  useEffect(() => {
    if (currentAccount) {
      const getMetadata = async () => {
        try {
          const assetRes = await api.query.assets.account(
            2000,
            currentAccount.address
          );
          const xsmMultiAssetId = {
            concrete: {
              parents: 1,
              interior: {
                x3: [
                  { parachain: 2004 },
                  { generalKey: "0x7379676d61" },
                  { generalKey: "0x75736463" },
                ],
              },
            },
          };

          const feeRes = await api.query.sygmaBasicFeeHandler.assetFees([
            1, // Destination DomainID
            xsmMultiAssetId
          ]);

          const chainDecimals = api.registry.chainDecimals[0];
          const balance = await api.query.system.account(
            currentAccount.address
          );

          setAccountData({
            balance: balance.data.free,
            accountName: currentAccount.meta.name,
            address: currentAccount.address ?? "",
            balanceOfTokens: assetRes.value.balance,
            basicFee: feeRes.value,
            chainDecimals: chainDecimals,
          });
        } catch (e) {
          console.error(e);
        }
      };
      getMetadata();
    }
  }, [api.rpc.state, currentAccount]);

  return (
    <div>
      {accountData !== undefined && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h3>Account data</h3>
          <p>
            Name: <span>{accountData.accountName}</span>
            <br />
            Address: <span>{accountData.address}</span>
            <br />
            NATIVE TOKENS:{" "}
            <span>
              {formatBalance(accountData.balance, {
                decimals: accountData.chainDecimals,
                withSiFull: true,
              })}
            </span>
            <br />
            Balance of tokens:{" "}
            <span>
              {formatBalance(accountData.balanceOfTokens, {
                decimals: accountData.chainDecimals,
                withSi: true,
                withUnit: "USDC",
              })}
            </span>
            <br />
            Basic fee:{" "}
            <span>
              {!accountData.basicFee.isEmpty ? formatBalance(accountData.basicFee, {
                decimals: accountData.chainDecimals,
                withSi: true
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
