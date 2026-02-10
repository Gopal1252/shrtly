import getNanoid from '../utils/shortCode.js';
import pool from '../db/index.js';
import ValidationError from '../utils/ValidationError.js';

const RESERVED_WORDS = ['api', 'health', 'admin'];
const SLUG_REGEX = /^[a-zA-Z0-9_-]+$/;

async function createShortUrl(originalUrl, userId, customSlug){
    try{
        let shortCode;

        if(customSlug){
            if(customSlug.length < 3 || customSlug.length > 20){
                throw new ValidationError('Custom slug must be between 3 and 20 characters');
            }
            if(!SLUG_REGEX.test(customSlug)){
                throw new ValidationError('Custom slug can only contain letters, numbers, hyphens, and underscores');
            }
            if(RESERVED_WORDS.includes(customSlug.toLowerCase())){
                throw new ValidationError('This slug is reserved and cannot be used');
            }
            const existing = await pool.query('SELECT id FROM urls WHERE short_code = $1', [customSlug]);
            if(existing.rows.length > 0){
                throw new ValidationError('This custom slug is already taken');
            }
            shortCode = customSlug;
        } else {
            let attempts = 0;
            while(attempts < 5){
                shortCode = getNanoid();
                const existing = await pool.query('SELECT id FROM urls WHERE short_code = $1', [shortCode]);
                if(existing.rows.length === 0){
                    break;
                }
                attempts++;
            }
            if(attempts === 5){
                throw new Error('Failed to generate a unique short code');
            }
        }

        const result = await pool.query('INSERT INTO urls (short_code,original_url,user_id) VALUES ($1,$2,$3) RETURNING short_code', [shortCode,originalUrl,userId]);
        return result.rows[0].short_code;
    }
    catch(error){
        console.error('Error creating short URL:', error.message);
        throw error;
    }
}

export default createShortUrl;
