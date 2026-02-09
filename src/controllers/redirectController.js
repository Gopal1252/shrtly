import getOriginalUrl from "../services/redirectService.js";

export async function redirectController(req,res){
    const code = req.params.code;

    try{
        const originalUrl = await getOriginalUrl(code);
        if(originalUrl){
            res.redirect(originalUrl);
        }
        else{
            res.status(404).json({ error: 'Short URL not found' })
        }
    }
    catch{
        res.status(500).json({ error: 'Internal server error' });
    }
}