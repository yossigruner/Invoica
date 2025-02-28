import { logger } from "./logger";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/axios";

interface CloverMerchantResponse {
  id: string;
  name: string;
  owner?: {
    email?: string;
  };
}

/**
 * Validates Clover API credentials by making a test API call
 */
export const validateCloverCredentials = async (apiKey: string, merchantId: string): Promise<boolean> => {
  try {
    // Clover API base URL for sandbox/testing
    const baseUrl = import.meta.env.VITE_CLOVER_API_BASE_URL || 'https://sandbox.dev.clover.com';
    
    // Make a test API call to validate credentials
    const response = await fetch(`${baseUrl}/v3/merchants/${merchantId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      logger.error('Failed to validate Clover credentials', {
        status: response.status,
        statusText: response.statusText,
        merchantId
      });
      return false;
    }

    const data = await response.json() as CloverMerchantResponse;
    
    // Additional validation of the response
    if (!data.id || data.id !== merchantId) {
      logger.error('Invalid merchant ID in response', {
        expectedId: merchantId,
        receivedId: data.id
      });
      return false;
    }

    logger.info('Successfully validated Clover credentials', {
      merchantId: data.id,
      merchantName: data.name
    });

    return true;
  } catch (error) {
    logger.error('Error validating Clover credentials', error);
    return false;
  }
};

/**
 * Encrypts sensitive Clover credentials before storing
 * Uses Supabase's built-in encryption
 */
export const encryptCloverCredentials = async (value: string, userId: string): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc('encrypt_value', {
      input_value: value,
      user_id: userId
    });

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Failed to encrypt Clover credentials', error);
    throw new Error('Failed to encrypt credentials');
  }
};

/**
 * Decrypts Clover credentials after retrieving from storage
 * Uses Supabase's built-in decryption
 */
export const decryptCloverCredentials = async (value: string, userId: string): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc('decrypt_value', {
      encrypted_value: value,
      user_id: userId
    });

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Failed to decrypt Clover credentials', error);
    throw new Error('Failed to decrypt credentials');
  }
};

/**
 * Validates Clover merchant ID format
 */
export const isValidMerchantId = (merchantId: string): boolean => {
  // Clover merchant IDs are typically 8+ characters of uppercase letters and numbers
  const merchantIdRegex = /^[A-Z0-9]{8,}$/;
  return merchantIdRegex.test(merchantId);
};

/**
 * Validates Clover API key format
 */
export const isValidApiKey = (apiKey: string): boolean => {
  // Clover API keys are typically long base64 strings
  const apiKeyRegex = /^[A-Za-z0-9+/=_-]{32,}$/;
  return apiKeyRegex.test(apiKey);
};

/**
 * Encrypts a value using the server's encryption
 * @param value - The value to encrypt
 * @returns The encrypted value
 */
export async function encryptValue(value: string): Promise<string> {
  try {
    const response = await api.post('/api/encrypt', { value });
    return response.data.encryptedValue;
  } catch (error) {
    logger.error('Failed to encrypt value', error);
    throw error;
  }
}

/**
 * Decrypts a value using the server's decryption
 * @param encryptedValue - The value to decrypt
 * @returns The decrypted value
 */
export async function decryptValue(encryptedValue: string): Promise<string> {
  try {
    const response = await api.post('/api/decrypt', { encryptedValue });
    return response.data.decryptedValue;
  } catch (error) {
    logger.error('Failed to decrypt value', error);
    throw error;
  }
} 