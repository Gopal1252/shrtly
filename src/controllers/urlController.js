import createShortUrl from '../services/urlService.js';

export async  function shortenUrl(req,res){
    const { originalUrl } = req.body;
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
        const shortCode = await createShortUrl(originalUrl, userId);
        res.status(201).json({ shortCode });
    }
    catch(error){
        res.status(500).json({ error: error.message });
    }
}