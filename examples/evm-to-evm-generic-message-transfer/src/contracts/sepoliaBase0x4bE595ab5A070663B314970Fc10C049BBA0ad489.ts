export const sepoliaBase0x4bE595ab5A070663B314970Fc10C049BBA0ad489 = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_depositer",
        type: "address",
      },
      {
        internalType: "address",
        name: "_index",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_value",
        type: "uint256",
      },
    ],
    name: "store",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_index",
        type: "address",
      },
    ],
    name: "retrieve",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;