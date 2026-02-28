import pool from '../db/index.js';
import createShortUrl from '../services/urlService.js';
import ValidationError from '../utils/ValidationError.js';

export async function getUserUrls(req, res) {
    const userId = req.userId;

    try {
        const result = await pool.query(
            'SELECT short_code, original_url, created_at, expires_at FROM urls WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json({ urls: result.rows });
    } catch (error) {
        req.log.error({ err: error }, 'Error fetching user URLs');
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async  function shortenUrl(req,res){
    const { originalUrl, customSlug, expiresIn } = req.body;
    const userId = req.userId;

    if(!originalUrl){
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        new URL(originalUrl);
    } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
    }

    try{
        const shortCode = await createShortUrl(originalUrl, userId, customSlug, expiresIn);
        res.status(201).json({ shortCode });
    }
    catch(error){
        if(error instanceof ValidationError){
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}