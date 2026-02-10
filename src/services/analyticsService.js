import pool from "../db/index.js";

async function logClick(urlId, ip, userAgent, referrer){
    try{
        await pool.query(
            'INSERT INTO clicks (url_id, ip_address, user_agent, referrer) VALUES ($1, $2, $3, $4)',
            [urlId, ip, userAgent, referrer]
        );
    }catch(error){
        console.error("Error logging click:", error.message);
    }
}

//queries click data for a given short URL (total count, recent clicks, etc.). also, verifies that the URL belongs to the requesting user
async function getStats(shortCode, userId){
    // First verify the URL belongs to this user
    const urlResult = await pool.query(
        'SELECT id FROM urls WHERE short_code = $1 AND user_id = $2',
        [shortCode, userId]
    );

    if(urlResult.rows.length === 0){
        return null;
    }

    const urlId = urlResult.rows[0].id;

    // Run all stat queries in parallel
    const [totalClicks, recentClicks, topReferrers] = await Promise.all([
        pool.query('SELECT COUNT(*) AS count FROM clicks WHERE url_id = $1', [urlId]),
        pool.query('SELECT clicked_at, ip_address, user_agent, referrer FROM clicks WHERE url_id = $1 ORDER BY clicked_at DESC LIMIT 10', [urlId]),
        pool.query('SELECT referrer, COUNT(*) AS count FROM clicks WHERE url_id = $1 AND referrer IS NOT NULL GROUP BY referrer ORDER BY count DESC LIMIT 5', [urlId]),
    ]);

    return {
        totalClicks: parseInt(totalClicks.rows[0].count),
        recentClicks: recentClicks.rows,
        topReferrers: topReferrers.rows,
    };
}

export { logClick, getStats };
