import pool from "../db/index.js";
import redis from "../redis/index.js";

async function getOriginalUrl(shortCode){
    try{
        const cached = await redis.get(`short:${shortCode}`);
        if(cached){
            return JSON.parse(cached);
        }

        const result = await pool.query('SELECT id, original_url FROM urls WHERE short_code = $1', [shortCode]);

        if(result.rows.length === 0){
            return null;
        }

        const originalUrl = result.rows[0].original_url;
        const urlId = result.rows[0].id;
        await redis.set(`short:${shortCode}`, JSON.stringify({ originalUrl, urlId }), 'EX', 3600);
        return {originalUrl,urlId};

    }catch(error){
        console.error("Error getting url: ", error.message);
        throw error;
    }
}

export default getOriginalUrl;
