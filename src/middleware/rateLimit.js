import redis from "../redis/index.js";

export default function rateLimit({ maxRequests, windowSeconds }){
    return async function (req, res, next){
        const key = `ratelimit:${req.userId || req.ip}`;
        const now = Date.now();
        const windowStart = now - (windowSeconds * 1000);

        try{
            // Step 1: Clean old entries and count
            const pipeline = redis.pipeline();
            pipeline.zremrangebyscore(key, '-inf', windowStart);
            pipeline.zcard(key);
            const results = await pipeline.exec();
            const count = results[1][1];

            if(count >= maxRequests){
                return res.status(429).json({ error: 'Too many requests, please try again later' });
            }

            // Step 2: Only add if under limit
            await redis.zadd(key, now, `${now}-${Math.random()}`);// this random value helps avoid the duplicate timestamp issue
            await redis.expire(key, windowSeconds);

            res.set('X-RateLimit-Limit', maxRequests);
            res.set('X-RateLimit-Remaining', maxRequests - count - 1);
            res.set('X-RateLimit-Reset', Math.ceil((now + windowSeconds * 1000) / 1000));

            next();
        }catch(error){
            req.log.error({ err: error }, 'Rate limit error');
            next();//if Redis fails, we let the request through rather than blocking users. Rate limiting is a safeguard, not critical path
        }
    };
}
