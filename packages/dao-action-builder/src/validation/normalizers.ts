import type { AbiParameter, ParameterValue } from '../types';
import { parseType } from './validators';

/**
 * Normalize a parameter value for encoding
 * Converts string inputs to appropriate types for ethers.js encoding
 */
export function normalizeParameterValue(
  value: string | ParameterValue,
  type: string,
  components?: AbiParameter[]
): ParameterValue {
  const parsed = parseType(type);

  // Handle arrays
  if (parsed.isArray) {
    let arrayValue: unknown[];

    if (typeof value === 'string') {
      try {
        arrayValue = JSON.parse(value);
      } catch {
        throw new Error(`Invalid JSON array for type ${type}`);
      }
    } else if (Array.isArray(value)) {
      arrayValue = value;
    } else {
      throw new Error(`Expected array for type ${type}`);
    }

    // Get inner type for nested arrays
    let innerType = parsed.baseType;
    if (parsed.arrayDimensions.length > 1) {
      const remainingDimensions = parsed.arrayDimensions.slice(1);
      innerType = `${parsed.baseType}${remainingDimensions.map((d) => `[${d ?? ''}]`).join('')}`;
    }

    return arrayValue.map((item) => {
      const itemValue = typeof item === 'object' ? JSON.stringify(item) : String(item);
      return normalizeParameterValue(itemValue, innerType, components);
    });
  }

  // Handle tuples
  if (parsed.isTuple && components) {
    let tupleValue: Record<string, unknown>;

    if (typeof value === 'string') {
      try {
        tupleValue = JSON.parse(value);
      } catch {
        throw new Error('Invalid JSON object for tuple');
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      tupleValue = value as Record<string, unknown>;
    } else {
      throw new Error('Expected object for tuple');
    }

    // For ethers.js, tuples can be encoded as arrays in order
    return components.map((comp) => {
      const compValue = tupleValue[comp.name];
      if (compValue === undefined) {
        throw new Error(`Missing tuple field: ${comp.name}`);
      }
      const compValueStr = typeof compValue === 'object' ? JSON.stringify(compValue) : String(compValue);
      return normalizeParameterValue(compValueStr, comp.type, comp.components);
    });
  }

  // Handle basic types
  const stringValue = typeof value === 'string' ? value : String(value);

  if (parsed.baseType === 'address') {
    // Lowercase to avoid checksum issues
    return stringValue.toLowerCase();
  }

  if (parsed.baseType.startsWith('uint') || parsed.baseType.startsWith('int')) {
    // Return as string for BigInt parsing by ethers
    return stringValue;
  }

  if (parsed.baseType === 'bool') {
    return stringValue.toLowerCase() === 'true';
  }

  if (parsed.baseType === 'bytes' || parsed.baseType.startsWith('bytes')) {
    return stringValue;
  }

  if (parsed.baseType === 'string') {
    return stringValue;
  }

  return stringValue;
}

/**
 * Convert an encoded value back to a display-friendly string
 */
export function denormalizeParameterValue(
  value: unknown,
  type: string,
  components?: AbiParameter[]
): string {
  const parsed = parseType(type);

  // Handle arrays
  if (parsed.isArray && Array.isArray(value)) {
    let innerType = parsed.baseType;
    if (parsed.arrayDimensions.length > 1) {
      const remainingDimensions = parsed.arrayDimensions.slice(1);
      innerType = `${parsed.baseType}${remainingDimensions.map((d) => `[${d ?? ''}]`).join('')}`;
    }

    const denormalized = value.map((item) => denormalizeParameterValue(item, innerType, components));
    return JSON.stringify(denormalized);
  }

  // Handle tuples
  if (parsed.isTuple && components && Array.isArray(value)) {
    const result: Record<string, string> = {};
    for (let i = 0; i < components.length; i++) {
      const comp = components[i];
      result[comp.name] = denormalizeParameterValue(value[i], comp.type, comp.components);
    }
    return JSON.stringify(result);
  }

  // Handle basic types
  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}

/**
 * Prepare parameters for ethers.js encoding
 */
export function prepareParametersForEncoding(
  parameters: { [key: string]: string | ParameterValue },
  inputs: AbiParameter[]
): ParameterValue[] {
  return inputs.map((input) => {
    const value = parameters[input.name];
    if (value === undefined) {
      throw new Error(`Missing parameter: ${input.name}`);
    }
    return normalizeParameterValue(
      typeof value === 'string' ? value : value,
      input.type,
      input.components
    );
  });
}
