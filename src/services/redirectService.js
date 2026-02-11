import pool from "../db/index.js";
import redis from "../redis/index.js";

async function getOriginalUrl(shortCode){
    try{
        const cached = await redis.get(`short:${shortCode}`);
        if(cached){
            return JSON.parse(cached);
        }

        const result = await pool.query('SELECT id, original_url , expires_at FROM urls WHERE short_code = $1', [shortCode]);

        if(result.rows.length === 0){
            return null;
        }

        const originalUrl = result.rows[0].original_url;
        const urlId = result.rows[0].id;
        const expiresAt = result.rows[0].expires_at;

        let ttl = 3600;
        if(expiresAt){
            const remainingMs = new Date(expiresAt) - Date.now();
            ttl = Math.min(3600, Math.floor(remainingMs / 1000)); // lesser of 1hr or remaining time  
        }

        if(ttl > 0){
            await redis.set(`short:${shortCode}`, JSON.stringify({ originalUrl, urlId, expiresAt }), 'EX', ttl);
        }
        
        return {originalUrl,urlId, expiresAt};

    }catch(error){
        console.error("Error getting url: ", error.message);
        throw error;
    }
}

export default getOriginalUrl;
