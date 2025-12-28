import crypto from 'crypto';

/**
 * Generates a random base64url string of specified length.
 * YouTube uses 11 characters.
 */
export const generatePublicID = (length: number = 11): string => {
    // 11 chars in base64url is roughly 8.25 bytes. 
    // We'll generate slightly more and slice.
    const bytes = crypto.randomBytes(Math.ceil((length * 3) / 4));
    return bytes
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
        .substring(0, length);
};

export const generateVideoID = () => generatePublicID(11);
export const generateChannelID = () => 'CH-' + generatePublicID(10);
export const generatePlaylistID = () => 'PL-' + generatePublicID(10);
