import { describe, it, expect } from 'vitest';
import { encodeCalldata, encodeCalldataByName } from './calldata-encoder';
import { decodeCalldata, decodeCalldataBySignature } from './calldata-decoder';
import type { AbiFunction } from '../types';

const erc20Abi: AbiFunction[] = [
  {
    type: 'function',
    name: 'transfer',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'transferFrom',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
];

describe('encodeCalldata', () => {
  it('should encode transfer calldata', () => {
    const result = encodeCalldata({
      abi: erc20Abi,
      functionSignature: 'transfer(address,uint256)',
      parameters: {
        to: '0x1234567890123456789012345678901234567890',
        amount: '1000000000000000000',
      },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.calldata).toMatch(/^0x/);
      expect(result.data.calldata.length).toBeGreaterThan(10);
      expect(result.data.functionSignature).toBe('transfer(address,uint256)');
    }
  });

  it('should handle function not found', () => {
    const result = encodeCalldata({
      abi: erc20Abi,
      functionSignature: 'nonexistent(uint256)',
      parameters: {},
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('FUNCTION_NOT_FOUND');
    }
  });

  it('should handle missing parameters', () => {
    const result = encodeCalldata({
      abi: erc20Abi,
      functionSignature: 'transfer(address,uint256)',
      parameters: {
        to: '0x1234567890123456789012345678901234567890',
        // missing 'amount'
      },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('ENCODING_FAILED');
    }
  });
});

describe('encodeCalldataByName', () => {
  it('should encode by function name', () => {
    const result = encodeCalldataByName({
      abi: erc20Abi,
      functionName: 'transfer',
      parameters: [
        '0x1234567890123456789012345678901234567890',
        '1000000000000000000',
      ],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.calldata).toMatch(/^0x/);
    }
  });
});

describe('decodeCalldata', () => {
  it('should decode calldata back to parameters', () => {
    // First encode
    const encodeResult = encodeCalldata({
      abi: erc20Abi,
      functionSignature: 'transfer(address,uint256)',
      parameters: {
        to: '0x1234567890123456789012345678901234567890',
        amount: '1000000000000000000',
      },
    });

    expect(encodeResult.success).toBe(true);
    if (!encodeResult.success) return;

    // Then decode
    const decodeResult = decodeCalldata(encodeResult.data.calldata, erc20Abi);

    expect(decodeResult.success).toBe(true);
    if (decodeResult.success) {
      expect(decodeResult.data.functionName).toBe('transfer');
      expect(decodeResult.data.functionSignature).toBe('transfer(address,uint256)');
      expect(decodeResult.data.parameters.to).toBe(
        '0x1234567890123456789012345678901234567890'
      );
      expect(decodeResult.data.parameters.amount).toBe('1000000000000000000');
    }
  });
});

describe('decodeCalldataBySignature', () => {
  it('should decode using function signature only', () => {
    const encodeResult = encodeCalldata({
      abi: erc20Abi,
      functionSignature: 'transfer(address,uint256)',
      parameters: {
        to: '0x1234567890123456789012345678901234567890',
        amount: '1000000000000000000',
      },
    });

    expect(encodeResult.success).toBe(true);
    if (!encodeResult.success) return;

    const decodeResult = decodeCalldataBySignature(
      encodeResult.data.calldata,
      'transfer(address,uint256)'
    );

    expect(decodeResult.success).toBe(true);
    if (decodeResult.success) {
      expect(decodeResult.data.functionName).toBe('transfer');
      expect(decodeResult.data.parameterTypes).toEqual(['address', 'uint256']);
    }
  });
});

describe('roundtrip encoding/decoding', () => {
  it('should handle multiple parameter types', () => {
    const testCases = [
      {
        signature: 'transfer(address,uint256)',
        params: {
          to: '0xabcdef1234567890abcdef1234567890abcdef12',
          amount: '9999999999999999999',
        },
      },
      {
        signature: 'transferFrom(address,address,uint256)',
        params: {
          from: '0x1111111111111111111111111111111111111111',
          to: '0x2222222222222222222222222222222222222222',
          amount: '5000',
        },
      },
    ];

    for (const testCase of testCases) {
      const encodeResult = encodeCalldata({
        abi: erc20Abi,
        functionSignature: testCase.signature,
        parameters: testCase.params,
      });

      expect(encodeResult.success).toBe(true);
      if (!encodeResult.success) continue;

      const decodeResult = decodeCalldata(encodeResult.data.calldata, erc20Abi);

      expect(decodeResult.success).toBe(true);
      if (!decodeResult.success) continue;

      // Check that all parameters match (normalized to lowercase for addresses)
      for (const [key, value] of Object.entries(testCase.params)) {
        const decoded = decodeResult.data.parameters[key];
        if (typeof value === 'string' && value.startsWith('0x')) {
          expect(decoded?.toString().toLowerCase()).toBe(value.toLowerCase());
        } else {
          expect(decoded).toBe(value);
        }
      }
    }
  });
});
