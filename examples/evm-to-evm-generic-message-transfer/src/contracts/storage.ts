export const storageAbi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "depositor",
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
    {
        inputs: [
            {
                internalType: "address",
                name: "depositor",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "val",
                type: "uint256",
            },
        ],
        name: "store",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
] as const;