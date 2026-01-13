/**
 * Generates a unique, human-readable code for entities.
 * Format: PREFIX-XXXX (e.g., BN-1234)
 * 
 * @param {string} type - The entity type ('band', 'member', 'gear', 'song')
 * @returns {string} - The generated code
 */
export const generateIdCode = (type) => {
    const prefixes = {
        band: 'BN',
        member: 'MU',
        gear: 'GR',
        song: 'SG',
        instrument: 'IN'
    };

    const prefix = prefixes[type] || 'ID';
    // Generate a random 4-digit number
    const number = Math.floor(1000 + Math.random() * 9000);

    return `${prefix}-${number}`;
};
