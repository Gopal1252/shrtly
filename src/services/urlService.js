import pool from '../db/index.js';
import ValidationError from '../utils/ValidationError.js';
import parseExpiry from '../utils/parseExpiry.js';
import encode from '../utils/base62.js';

const RESERVED_WORDS = ['api', 'health', 'admin'];
const SLUG_REGEX = /^[a-zA-Z0-9_-]+$/;

async function createShortUrl(originalUrl, userId, customSlug, expiresIn){
    try{
        let shortCode;
        const expiresAt = parseExpiry(expiresIn);

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

            const result = await pool.query('INSERT INTO urls (short_code,original_url,user_id,expires_at) VALUES ($1,$2,$3,$4) RETURNING short_code', [shortCode,originalUrl,userId,expiresAt]);
            return result.rows[0].short_code;
        } 
        else {
            const client = await pool.connect();//get a dedicated client

            try{
                await client.query('BEGIN');

                const result = await client.query('INSERT into urls (original_url,user_id,expires_at) VALUES ($1,$2,$3) RETURNING id', [originalUrl,userId,expiresAt]);

                const urlId = result.rows[0].id;

                shortCode = encode(urlId);

                await client.query('UPDATE urls SET short_code = $1 where id = $2', [shortCode,urlId]);

                await client.query('COMMIT');

                return shortCode;
            }
            catch(error){
                await client.query('ROLLBACK');
                throw new Error('Failed to generate shortCode');
            }
            finally{
                client.release();
            }

        }
    }
    catch(error){
        console.error('Error creating short URL:', error.message);
        throw error;
    }
}

export default createShortUrl;
