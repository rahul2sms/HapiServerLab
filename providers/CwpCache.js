const redis = require('redis');

class CwpCache
{
    static client = null;

    static connect = ()=>{
        CwpCache.client = redis.createClient({
            port: 6379,
            host: '127.0.0.1'
        });

        CwpCache.client.on('ready', function() {
            console.log("RedisClient is ready");
        });
    
        CwpCache.client.on('connect', function() {
            console.log('CwpCache successfully connected to Redis server');
        }); 
    }
    
    static read = (hashkey, field) => {
        return new Promise(function (resolve, reject) {
            console.log(`Reading from cache. key: ${field}`);

            CwpCache.client.hget(hashkey, field, function(err,result){
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    
    static store = (hashkey, fieldname, fieldvalue) => {
        return new Promise(function (resolve, reject) {
            if(typeof fieldvalue == 'undefined') {
                return reject(`Cache store filed. Value is blank. ${hashkey}: ${fieldname}`);
            }
            CwpCache.client.hmset(hashkey, fieldname, fieldvalue, function(err, result){
                if (err) {
                    return reject(err);
                }
                console.log(`Cache saved successfully. ${hashkey}:${fieldname} - ${result}`);
                return resolve(result);
            });
        });
    }
    
    static storeObject = (hashkey, storedData={}) => {
        return new Promise( ( resolve, reject ) => {
            return CwpCache.client.hmset(hashkey, storedData, function( err, result ){
                if (err) {
                    return reject(err);
                }
                console.log(`Cache object saved successfully. ${hashkey} - ${result}`);
                return resolve(result);
            });
        });
    }
    
}

module.exports = CwpCache;