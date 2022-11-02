import { ethers } from "ethers";

const decodeColor = (color: string) => `#${ethers.utils.hexStripZeros(color).substr(2).toUpperCase()}`

export { decodeColor }