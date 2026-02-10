import { getStats } from "../services/analyticsService.js";

export async function getUrlStats(req, res){
    const code = req.params.code;
    const userId = req.userId;

    try{
        const stats = await getStats(code,userId);
        if(!stats){
            res.status(404).json({error: 'No Analytics corresponding to this shortCode'});
        }
        else{
            res.json(stats);
        }

    }catch(error){
        res.status(500).json({ error: 'Internal server error' });
    }
    
};