import type {
  AbiParameter,
  ParameterValidationResult,
  ParameterValue,
  ParsedType,
} from '../types';

// Cached regex patterns for performance
const ADDRESS_REGEX = /^0x[a-f0-9]{40}$/;
const HEX_STRING_REGEX = /^0x[0-9a-fA-F]*$/;
const ARRAY_TYPE_REGEX = /^(.+?)(\[.*\])$/;
const ARRAY_DIMENSION_REGEX = /\[(\d*)\]/g;
const FIXED_DIMENSION_REGEX = /\[(\d+)\]/;

/**
 * Parse a Solidity type string into its components
 */
export function parseType(type: string): ParsedType {
  const result: ParsedType = {
    baseType: type,
    isArray: false,
    arrayDimensions: [],
    isTuple: false,
  };

  // Check for tuple
  if (type === 'tuple' || type.startsWith('tuple[')) {
    result.isTuple = true;
    result.baseType = 'tuple';
  }

  // Extract array dimensions
  const arrayMatch = type.match(ARRAY_TYPE_REGEX);
  if (arrayMatch) {
    result.baseType = arrayMatch[1];
    result.isArray = true;

    // Parse array dimensions
    const dimensionStr = arrayMatch[2];
    const dimensions = dimensionStr.match(ARRAY_DIMENSION_REGEX) || [];
    result.arrayDimensions = dimensions.map((dim) => {
      const numMatch = dim.match(FIXED_DIMENSION_REGEX);
      return numMatch ? parseInt(numMatch[1], 10) : null;
    });

    if (result.baseType === 'tuple') {
      result.isTuple = true;
    }
  }

  return result;
}

/**
 * Validate an Ethereum address
 */
export function validateAddress(value: string): ParameterValidationResult {
  if (!value) {
    return { isValid: false, error: 'Address is required' };
  }

  const lowerValue = value.toLowerCase();
  const isValid = ADDRESS_REGEX.test(lowerValue);

  if (!isValid) {
    return {
      isValid: false,
      error: 'Invalid Ethereum address. Must be 40 hex characters starting with 0x',
    };
  }

  return { isValid: true, normalizedValue: lowerValue };
}

/**
 * Validate a uint value
 */
export function validateUint(value: string, bits: number = 256): ParameterValidationResult {
  if (!value || value.trim() !== value) {
    return { isValid: false, error: 'Invalid number format (no spaces allowed)' };
  }

  try {
    const num = BigInt(value);
    if (num < BigInt(0)) {
      return { isValid: false, error: 'Must be a non-negative number' };
    }

    const maxValue = BigInt(2) ** BigInt(bits) - BigInt(1);
    if (num > maxValue) {
      return { isValid: false, error: `Value exceeds uint${bits} max` };
    }

    return { isValid: true, normalizedValue: num };
  } catch {
    return { isValid: false, error: 'Invalid number format' };
  }
}

/**
 * Validate an int value
 */
export function validateInt(value: string, bits: number = 256): ParameterValidationResult {
  if (!value || value.trim() !== value) {
    return { isValid: false, error: 'Invalid number format (no spaces allowed)' };
  }

  try {
    const num = BigInt(value);
    const maxValue = BigInt(2) ** BigInt(bits - 1) - BigInt(1);
    const minValue = -(BigInt(2) ** BigInt(bits - 1));

    if (num > maxValue || num < minValue) {
      return { isValid: false, error: `Value out of range for int${bits}` };
    }

    return { isValid: true, normalizedValue: num };
  } catch {
    return { isValid: false, error: 'Invalid number format' };
  }
}

/**
 * Validate a bool value
 */
export function validateBool(value: string): ParameterValidationResult {
  const normalized = value.toLowerCase().trim();
  if (normalized === 'true') {
    return { isValid: true, normalizedValue: true };
  }
  if (normalized === 'false') {
    return { isValid: true, normalizedValue: false };
  }
  return { isValid: false, error: 'Must be "true" or "false"' };
}

/**
 * Validate a bytes value
 */
export function validateBytes(value: string, fixedLength?: number): ParameterValidationResult {
  if (!value) {
    return { isValid: false, error: 'Bytes value is required' };
  }

  if (!value.startsWith('0x')) {
    return { isValid: false, error: 'Must start with 0x' };
  }

  if (!HEX_STRING_REGEX.test(value)) {
    return { isValid: false, error: 'Invalid hex string' };
  }

  const byteLength = (value.length - 2) / 2;

  if (fixedLength !== undefined && byteLength !== fixedLength) {
    return { isValid: false, error: `Must be exactly ${fixedLength} bytes` };
  }

  if (fixedLength !== undefined && byteLength > 32) {
    return { isValid: false, error: 'Fixed bytes cannot exceed 32' };
  }

  return { isValid: true, normalizedValue: value };
}

/**
 * Validate a string value
 */
export function validateString(value: string): ParameterValidationResult {
  return { isValid: true, normalizedValue: value };
}

/**
 * Validate an array value (JSON format)
 */
export function validateArray(
  value: string,
  elementType: string,
  components?: AbiParameter[],
  expectedLength?: number
): ParameterValidationResult {
  try {
    let parsed: unknown[];

    if (typeof value === 'string') {
      // Try to parse as JSON array
      parsed = JSON.parse(value);
    } else if (Array.isArray(value)) {
      parsed = value;
    } else {
      return { isValid: false, error: 'Array must be a JSON array string' };
    }

    if (!Array.isArray(parsed)) {
      return { isValid: false, error: 'Must be a valid JSON array' };
    }

    if (expectedLength !== undefined && parsed.length !== expectedLength) {
      return {
        isValid: false,
        error: `Array must have exactly ${expectedLength} elements`,
      };
    }

    const validatedElements: ParameterValue[] = [];

    for (let i = 0; i < parsed.length; i++) {
      const element = parsed[i];
      const elementValue = typeof element === 'object' ? JSON.stringify(element) : String(element);
      const elementResult = validateParameterType(elementValue, elementType, components);

      if (!elementResult.isValid) {
        return {
          isValid: false,
          error: `Invalid element at index ${i}: ${elementResult.error}`,
        };
      }

      validatedElements.push(elementResult.normalizedValue!);
    }

    return { isValid: true, normalizedValue: validatedElements };
  } catch (e) {
    return { isValid: false, error: 'Invalid JSON array format' };
  }
}

/**
 * Validate a tuple value (JSON object format)
 */
export function validateTuple(
  value: string,
  components: AbiParameter[]
): ParameterValidationResult {
  try {
    let parsed: Record<string, unknown>;

    if (typeof value === 'string') {
      parsed = JSON.parse(value);
    } else if (typeof value === 'object' && value !== null) {
      parsed = value as Record<string, unknown>;
    } else {
      return { isValid: false, error: 'Tuple must be a JSON object string' };
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { isValid: false, error: 'Must be a valid JSON object' };
    }

    const validatedTuple: { [key: string]: ParameterValue } = {};

    for (const component of components) {
      const componentValue = parsed[component.name];

      if (componentValue === undefined) {
        return {
          isValid: false,
          error: `Missing required field: ${component.name}`,
        };
      }

      const valueStr =
        typeof componentValue === 'object'
          ? JSON.stringify(componentValue)
          : String(componentValue);

      const result = validateParameterType(valueStr, component.type, component.components);

      if (!result.isValid) {
        return {
          isValid: false,
          error: `Invalid field "${component.name}": ${result.error}`,
        };
      }

      validatedTuple[component.name] = result.normalizedValue!;
    }

    return { isValid: true, normalizedValue: validatedTuple };
  } catch (e) {
    return { isValid: false, error: 'Invalid JSON object format' };
  }
}

/**
 * Main validation function for any parameter type
 */
export function validateParameterType(
  value: string,
  type: string,
  components?: AbiParameter[]
): ParameterValidationResult {
  if (value === undefined || value === null) {
    return { isValid: false, error: 'Value is required' };
  }

  const parsed = parseType(type);

  // Handle arrays
  if (parsed.isArray) {
    const expectedLength =
      parsed.arrayDimensions[0] !== null ? parsed.arrayDimensions[0] : undefined;

    // Get inner type for nested arrays
    let innerType = parsed.baseType;
    if (parsed.arrayDimensions.length > 1) {
      const remainingDimensions = parsed.arrayDimensions.slice(1);
      innerType = `${parsed.baseType}${remainingDimensions.map((d) => `[${d ?? ''}]`).join('')}`;
    }

    return validateArray(value, innerType, components, expectedLength);
  }

  // Handle tuples
  if (parsed.isTuple) {
    if (!components || components.length === 0) {
      return { isValid: false, error: 'Tuple components are required' };
    }
    return validateTuple(value, components);
  }

  // Handle basic types
  if (parsed.baseType === 'address') {
    return validateAddress(value);
  }

  if (parsed.baseType.startsWith('uint')) {
    const bits = parseInt(parsed.baseType.slice(4)) || 256;
    return validateUint(value, bits);
  }

  if (parsed.baseType.startsWith('int')) {
    const bits = parseInt(parsed.baseType.slice(3)) || 256;
    return validateInt(value, bits);
  }

  if (parsed.baseType === 'bool') {
    return validateBool(value);
  }

  if (parsed.baseType === 'bytes') {
    return validateBytes(value);
  }

  if (parsed.baseType.startsWith('bytes')) {
    const length = parseInt(parsed.baseType.slice(5));
    return validateBytes(value, length);
  }

  if (parsed.baseType === 'string') {
    return validateString(value);
  }

  // Unknown type - assume valid
  return { isValid: true, normalizedValue: value };
}

/**
 * Get a user-friendly error message for a parameter type
 */
export function getParameterTypeErrorMessage(type: string): string {
  const parsed = parseType(type);

  if (parsed.isArray) {
    return `Must be a valid JSON array of ${parsed.baseType} values`;
  }

  if (parsed.isTuple) {
    return 'Must be a valid JSON object matching the tuple structure';
  }

  if (parsed.baseType === 'address') {
    return 'Invalid Ethereum address';
  }

  if (parsed.baseType.startsWith('uint')) {
    return 'Must be a positive number (no spaces allowed)';
  }

  if (parsed.baseType.startsWith('int')) {
    return 'Must be a valid number (no spaces allowed)';
  }

  if (parsed.baseType === 'bool') {
    return 'Must be true or false';
  }

  if (parsed.baseType === 'bytes' || parsed.baseType.startsWith('bytes')) {
    return 'Must be a valid hex string starting with 0x';
  }

  if (parsed.baseType === 'string') {
    return 'Must be a valid string';
  }

  return 'Invalid input';
}
