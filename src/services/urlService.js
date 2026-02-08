import getNanoid from '../utils/shortCode.js';
import pool from '../db/index.js';


async function createShortUrl(originalUrl, userId){
    try{
        let attempts = 0;
        let shortCode;
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
        const result = await pool.query('INSERT INTO urls (short_code,original_url,user_id) VALUES ($1,$2,$3) RETURNING short_code', [shortCode,originalUrl,userId]);
        return result.rows[0].short_code;
    }
    catch(error){
        console.error('Error creating short URL:', error.message);
        throw error;
    }
}

export default createShortUrl;