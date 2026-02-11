import getOriginalUrl from "../services/redirectService.js";
import { logClick } from "../services/analyticsService.js";

export async function redirectController(req,res){
    const code = req.params.code;

    try{
        const result = await getOriginalUrl(code);
        if(!result){
            return res.status(404).json({error: 'Short URL not found'});
        }

        const { originalUrl, urlId, expiresAt } = result;

        if(expiresAt && new Date(expiresAt) < new Date()){
            return res.status(410).json({ error: 'This short URL has expired' });
        }

        logClick(urlId,req.ip,req.headers['user-agent'],req.headers['referer']);//no await - fire and forget
        res.redirect(originalUrl);
    }
    catch{
        res.status(500).json({ error: 'Internal server error' });
    }
}