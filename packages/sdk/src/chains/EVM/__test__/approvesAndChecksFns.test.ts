import { ERC721MinterBurnerPauser, ERC20 } from '@buildwithsygma/sygma-contracts';
import { ContractReceipt, ethers, BigNumber } from 'ethers';
import { isApproved, getERC20Allowance, approve } from '../utils/approvesAndChecksFns.js';

describe('getApproved Function Tests', () => {
  it('should determine whether the specified token is approved for the provided handler address', async () => {
    const tokenId = 1;
    const tokenInstance = {
      getApproved: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
    } as unknown as ERC721MinterBurnerPauser;
    const handlerAddress = '0x1234567890123456789012345678901234567890';

    const approved = await isApproved(tokenId, tokenInstance, handlerAddress);
    expect(approved).toBeTruthy();
  });

  it('should thrown error', async () => {
    const tokenId = 1;
    const tokenInstance = {
      getApproved: jest.fn().mockRejectedValue(new Error('Sick error')),
    } as unknown as ERC721MinterBurnerPauser;
    const handlerAddress = '0x1234567890123456789012345678901234567890';

    await expect(isApproved(tokenId, tokenInstance, handlerAddress)).rejects.toThrowError(
      'Sick error',
    );
  });
});

describe('checkCurrentAllowanceOfErc20', () => {
  let senderAddress: string;
  let erc20Instance: ERC20;
  let erc20HandlerAddress: string;

  beforeEach(() => {
    senderAddress = '0xabc';
    erc20Instance = {} as unknown as ERC20;
    erc20HandlerAddress = '0x123';
  });

  it('should return the correct allowance when allowance is greater than zero', async () => {
    const mockAllowance = { _hex: '0x10000' };
    erc20Instance = {
      allowance: jest.fn().mockResolvedValue(mockAllowance),
    } as unknown as ERC20;

    const result = await getERC20Allowance(senderAddress, erc20Instance, erc20HandlerAddress);
    expect(result.toString()).toEqual('6.5536e-14');
  });

  it('should return zero when allowance is zero', async () => {
    const mockAllowance = { _hex: '0x0' };
    erc20Instance = {
      allowance: jest.fn().mockResolvedValue(mockAllowance),
    } as unknown as ERC20;

    const result = await getERC20Allowance(senderAddress, erc20Instance, erc20HandlerAddress);
    expect(result).toEqual(0);
  });

  it('should throw an error on failure', async () => {
    const mockError = new Error('Could not retrieve allowance');
    erc20Instance = {
      allowance: jest.fn().mockRejectedValue(mockError),
    } as unknown as ERC20;

    await expect(
      getERC20Allowance(senderAddress, erc20Instance, erc20HandlerAddress),
    ).rejects.toEqual(mockError);
  });
});

describe('approve', () => {
  const amountOrIdForApproval = BigNumber.from(100);
  const handlerAddress = '0xabc123';
  const confirmations = 3;
  const overrides: ethers.PayableOverrides = {};

  it('should return a contract receipt when called with valid parameters', async () => {
    const tokenInstance = {
      approve: jest.fn().mockResolvedValueOnce({
        wait: jest.fn().mockResolvedValueOnce({} as ContractReceipt),
      }),
    } as unknown as ERC20;

    const contractReceipt: ContractReceipt = await approve(
      amountOrIdForApproval,
      tokenInstance,
      handlerAddress,
      confirmations,
      overrides,
    );
    expect(contractReceipt).toBeDefined();
  });

  it('should throw an error when called with invalid token instance', async () => {
    const tokenInstance = {
      approve: jest.fn().mockRejectedValue(new Error('NO')),
    } as unknown as ERC20;
    await expect(
      approve(amountOrIdForApproval, tokenInstance, handlerAddress, confirmations, overrides),
    ).rejects.toThrowError('NO');
  });
});
