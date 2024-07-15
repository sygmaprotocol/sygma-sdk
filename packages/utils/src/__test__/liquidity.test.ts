import { hasEnoughLiquidity } from '../liquidity.js';

describe('liquidity tests', () => {
  it('should be able to call the function', () => {
    expect(hasEnoughLiquidity).toBeTruthy();
  });
});
