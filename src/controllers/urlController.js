import createShortUrl from '../services/urlService.js';
import ValidationError from '../utils/ValidationError.js';

export async  function shortenUrl(req,res){
    const { originalUrl, customSlug } = req.body;
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
        const shortCode = await createShortUrl(originalUrl, userId, customSlug);
        res.status(201).json({ shortCode });
    }
    catch(error){
        if(error instanceof ValidationError){
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}