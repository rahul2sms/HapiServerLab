const redis = require('redis');

class RedisStore
{
    static client = null;

    static connect = ()=>{
        RedisStore.client = redis.createClient({
            port: 6379,
            host: '127.0.0.1'
        });
        
    }
}