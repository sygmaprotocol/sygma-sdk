import { FeeHandlerType } from '@buildwithsygma/core';

import type { EvmFee } from '../../types.js';
import { getTransactionOverrides } from '../depositFn.js';

// Define a test suite
describe('getTransactionOverrides', () => {
  it('should assign correct values', () => {
    const evmFee: EvmFee = {
      fee: 1n,
      type: FeeHandlerType.BASIC,
      handlerAddress: '',
    };

    const overrides = getTransactionOverrides(evmFee);
    expect(overrides.value).toEqual(evmFee.fee);
  });
});
