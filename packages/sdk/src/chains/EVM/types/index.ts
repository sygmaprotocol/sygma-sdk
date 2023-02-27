import { BigNumber, ethers, utils, Event, providers } from 'ethers';
import {
  Bridge,
  Bridge__factory as BridgeFactory,
  ERC721MinterBurnerPauser,
  ERC721MinterBurnerPauser__factory as Erc721Factory,
} from '@buildwithsygma/sygma-contracts';

export type EvmProposalExecutionCallback = (
  fn: (originDomainId: number, depositNonce: BigNumber, dataHash: string, tx: Event) => void,
) => Bridge;
