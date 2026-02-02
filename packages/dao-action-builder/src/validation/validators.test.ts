import { describe, it, expect } from 'vitest';
import {
  parseType,
  validateAddress,
  validateUint,
  validateInt,
  validateBool,
  validateBytes,
  validateString,
  validateArray,
  validateTuple,
  validateParameterType,
  getParameterTypeErrorMessage,
} from './validators';

describe('parseType', () => {
  it('should parse simple types', () => {
    expect(parseType('address')).toEqual({
      baseType: 'address',
      isArray: false,
      arrayDimensions: [],
      isTuple: false,
    });

    expect(parseType('uint256')).toEqual({
      baseType: 'uint256',
      isArray: false,
      arrayDimensions: [],
      isTuple: false,
    });
  });

  it('should parse array types', () => {
    expect(parseType('address[]')).toEqual({
      baseType: 'address',
      isArray: true,
      arrayDimensions: [null],
      isTuple: false,
    });

    expect(parseType('uint256[5]')).toEqual({
      baseType: 'uint256',
      isArray: true,
      arrayDimensions: [5],
      isTuple: false,
    });

    expect(parseType('uint256[][]')).toEqual({
      baseType: 'uint256',
      isArray: true,
      arrayDimensions: [null, null],
      isTuple: false,
    });
  });

  it('should parse tuple types', () => {
    expect(parseType('tuple')).toEqual({
      baseType: 'tuple',
      isArray: false,
      arrayDimensions: [],
      isTuple: true,
    });

    expect(parseType('tuple[]')).toEqual({
      baseType: 'tuple',
      isArray: true,
      arrayDimensions: [null],
      isTuple: true,
    });
  });
});

describe('validateAddress', () => {
  it('should validate correct addresses', () => {
    const result = validateAddress('0x1234567890123456789012345678901234567890');
    expect(result.isValid).toBe(true);
    expect(result.normalizedValue).toBe('0x1234567890123456789012345678901234567890');
  });

  it('should handle mixed case addresses', () => {
    const result = validateAddress('0xAbCdEf1234567890123456789012345678901234');
    expect(result.isValid).toBe(true);
    expect(result.normalizedValue).toBe('0xabcdef1234567890123456789012345678901234');
  });

  it('should reject invalid addresses', () => {
    expect(validateAddress('0x123').isValid).toBe(false);
    expect(validateAddress('not an address').isValid).toBe(false);
    expect(validateAddress('').isValid).toBe(false);
  });
});

describe('validateUint', () => {
  it('should validate correct uint values', () => {
    expect(validateUint('0').isValid).toBe(true);
    expect(validateUint('123').isValid).toBe(true);
    expect(validateUint('1000000000000000000').isValid).toBe(true);
  });

  it('should reject negative values', () => {
    expect(validateUint('-1').isValid).toBe(false);
  });

  it('should reject values with spaces', () => {
    expect(validateUint(' 123').isValid).toBe(false);
    expect(validateUint('123 ').isValid).toBe(false);
  });

  it('should validate against bit limits', () => {
    expect(validateUint('255', 8).isValid).toBe(true);
    expect(validateUint('256', 8).isValid).toBe(false);
  });
});

describe('validateInt', () => {
  it('should validate correct int values', () => {
    expect(validateInt('0').isValid).toBe(true);
    expect(validateInt('-123').isValid).toBe(true);
    expect(validateInt('123').isValid).toBe(true);
  });

  it('should validate against bit limits', () => {
    expect(validateInt('127', 8).isValid).toBe(true);
    expect(validateInt('-128', 8).isValid).toBe(true);
    expect(validateInt('128', 8).isValid).toBe(false);
    expect(validateInt('-129', 8).isValid).toBe(false);
  });
});

describe('validateBool', () => {
  it('should validate true/false', () => {
    expect(validateBool('true').isValid).toBe(true);
    expect(validateBool('false').isValid).toBe(true);
    expect(validateBool('TRUE').isValid).toBe(true);
    expect(validateBool('FALSE').isValid).toBe(true);
  });

  it('should reject invalid boolean values', () => {
    expect(validateBool('yes').isValid).toBe(false);
    expect(validateBool('1').isValid).toBe(false);
    expect(validateBool('').isValid).toBe(false);
  });
});

describe('validateBytes', () => {
  it('should validate correct bytes values', () => {
    expect(validateBytes('0x').isValid).toBe(true);
    expect(validateBytes('0x1234').isValid).toBe(true);
    expect(validateBytes('0xabcdef').isValid).toBe(true);
  });

  it('should validate fixed-length bytes', () => {
    expect(validateBytes('0x1234567890123456789012345678901234567890', 20).isValid).toBe(true);
    expect(validateBytes('0x12', 1).isValid).toBe(true);
    expect(validateBytes('0x1234', 1).isValid).toBe(false);
  });

  it('should reject invalid bytes values', () => {
    expect(validateBytes('1234').isValid).toBe(false);
    expect(validateBytes('0xGG').isValid).toBe(false);
    expect(validateBytes('').isValid).toBe(false);
  });
});

describe('validateArray', () => {
  it('should validate address arrays', () => {
    const result = validateArray(
      '["0x1234567890123456789012345678901234567890", "0xabcdef1234567890123456789012345678901234"]',
      'address'
    );
    expect(result.isValid).toBe(true);
    expect(Array.isArray(result.normalizedValue)).toBe(true);
  });

  it('should validate uint arrays', () => {
    const result = validateArray('[1, 2, 3]', 'uint256');
    expect(result.isValid).toBe(true);
  });

  it('should validate fixed-length arrays', () => {
    expect(validateArray('[1, 2, 3]', 'uint256', undefined, 3).isValid).toBe(true);
    expect(validateArray('[1, 2]', 'uint256', undefined, 3).isValid).toBe(false);
  });

  it('should reject invalid array elements', () => {
    const result = validateArray('["not an address"]', 'address');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Invalid element');
  });

  it('should reject invalid JSON', () => {
    expect(validateArray('not json', 'uint256').isValid).toBe(false);
  });
});

describe('validateTuple', () => {
  it('should validate simple tuples', () => {
    const components = [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ];

    const result = validateTuple(
      '{"to": "0x1234567890123456789012345678901234567890", "amount": "1000"}',
      components
    );
    expect(result.isValid).toBe(true);
  });

  it('should reject tuples with missing fields', () => {
    const components = [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ];

    const result = validateTuple(
      '{"to": "0x1234567890123456789012345678901234567890"}',
      components
    );
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Missing required field');
  });

  it('should reject tuples with invalid field values', () => {
    const components = [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ];

    const result = validateTuple('{"to": "invalid", "amount": "1000"}', components);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Invalid field');
  });
});

describe('validateParameterType', () => {
  it('should dispatch to correct validator', () => {
    expect(
      validateParameterType(
        '0x1234567890123456789012345678901234567890',
        'address'
      ).isValid
    ).toBe(true);
    expect(validateParameterType('123', 'uint256').isValid).toBe(true);
    expect(validateParameterType('-123', 'int256').isValid).toBe(true);
    expect(validateParameterType('true', 'bool').isValid).toBe(true);
    expect(validateParameterType('0x1234', 'bytes').isValid).toBe(true);
    expect(validateParameterType('hello', 'string').isValid).toBe(true);
  });

  it('should validate arrays', () => {
    expect(
      validateParameterType(
        '["0x1234567890123456789012345678901234567890"]',
        'address[]'
      ).isValid
    ).toBe(true);
  });
});

describe('getParameterTypeErrorMessage', () => {
  it('should return appropriate error messages', () => {
    expect(getParameterTypeErrorMessage('address')).toContain('address');
    expect(getParameterTypeErrorMessage('uint256')).toContain('positive');
    expect(getParameterTypeErrorMessage('int256')).toContain('number');
    expect(getParameterTypeErrorMessage('bool')).toContain('true or false');
    expect(getParameterTypeErrorMessage('bytes')).toContain('hex');
    expect(getParameterTypeErrorMessage('address[]')).toContain('array');
    expect(getParameterTypeErrorMessage('tuple')).toContain('object');
  });
});
