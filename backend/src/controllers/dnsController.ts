import { Request, Response } from 'express';
import { dnsService } from '../services/dnsService.js';
import { generateDKIMKeys, generateDKIMDNSRecord } from '../services/dkimService.js';

/**
 * Add DKIM record to domain
 * POST /api/dns/add-dkim
 * Body: { domain, selector, publicKey, providerCredentials?, forceProvider? }
 * 
 * SECURITY NOTE:
 * - providerCredentials should be encrypted before storage in production
 * - Consider implementing OAuth2 flow for Cloudflare (and other providers) to avoid storing tokens
 * - TODO: Add credential encryption service (e.g., using crypto or a secrets manager)
 * - TODO: Implement OAuth2 integration for provider authentication
 */
export const addDKIMRecord = async (req: Request, res: Response) => {
  try {
    const { domain, selector, publicKey, providerCredentials, forceProvider } = req.body;

    // TODO: Encrypt providerCredentials before processing
    // const encryptedCredentials = await encryptCredentials(providerCredentials);

    // Validate required fields
    if (!domain || !selector || !publicKey) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: domain, selector, and publicKey are required.',
      });
    }

    // Validate domain format (basic check)
    if (!/^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/.test(domain)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid domain format.',
      });
    }

    // Call service to add DKIM record
    const result = await dnsService.addDKIMRecord(
      domain,
      selector,
      publicKey,
      providerCredentials,
      forceProvider
    );

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error: any) {
    console.error('Error in addDKIMRecord controller:', error);
    return res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

/**
 * Verify DKIM record for domain
 * GET /api/dns/verify-dkim?domain=example.com&selector=email&expectedPublicKey=...
 */
export const verifyDKIMRecord = async (req: Request, res: Response) => {
  try {
    const { domain, selector, expectedPublicKey } = req.query;

    // Validate required fields
    if (!domain || !selector) {
      return res.status(400).json({
        verified: false,
        message: 'Missing required query parameters: domain and selector are required.',
      });
    }

    // Validate domain format (basic check)
    if (typeof domain !== 'string' || !/^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/.test(domain)) {
      return res.status(400).json({
        verified: false,
        message: 'Invalid domain format.',
      });
    }

    // Call service to verify DKIM record
    const result = await dnsService.verifyDKIMRecord(
      domain as string,
      selector as string,
      expectedPublicKey as string | undefined
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in verifyDKIMRecord controller:', error);
    return res.status(500).json({
      verified: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

/**
 * Generate DKIM keys and DNS record values
 * POST /api/dns/generate-dkim
 * Body: { domain, selector? }
 * Returns: { selector, domain, publicKey, privateKey, recordName, recordValue }
 */
export const generateDKIM = async (req: Request, res: Response) => {
  try {
    const { domain, selector = 'email' } = req.body;

    // Validate required fields
    if (!domain) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: domain is required.',
      });
    }

    // Validate domain format (basic check)
    if (!/^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/.test(domain)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid domain format.',
      });
    }

    // Validate selector format (alphanumeric, underscore, hyphen)
    if (!/^[a-zA-Z0-9_-]+$/.test(selector)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid selector format. Selector must contain only alphanumeric characters, underscores, or hyphens.',
      });
    }

    // Generate DKIM keypair
    const { publicKey, privateKey } = await generateDKIMKeys(selector, domain);

    // Generate DNS record value
    const recordValue = generateDKIMDNSRecord(publicKey);
    const recordName = `${selector}._domainkey`;

    return res.status(200).json({
      success: true,
      selector,
      domain,
      publicKey,
      privateKey,
      recordName,
      recordValue,
      instructions: {
        recordType: 'TXT',
        recordName: recordName,
        recordValue: recordValue,
        ttl: 3600,
        message: `Add this TXT record to your DNS: ${recordName}.${domain} with value: ${recordValue}`,
      },
    });
  } catch (error: any) {
    console.error('Error in generateDKIM controller:', error);
    return res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

