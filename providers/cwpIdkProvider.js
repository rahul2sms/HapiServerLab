'use strict';

exports = module.exports = function (options) {
    return {
        name: 'oidcProviderTheOG',
        protocol: 'oauth2',
        useParamsAuth: true,
        auth: 'https://b-h-s.spr.us00.int.con-veh.net/oidc/v1/authorize',
        token: 'https://b-h-s.spr.us00.int.con-veh.net/oidc/v1/token',
        scope: ['openid', 'profile', 'email'],
        profile: async function (credentials, params, get) {
          let url = 'https://b-h-s.spr.us00.int.con-veh.net/oidc/v1/userinfo';
          console.log('url is ', url);
          const userProfile = await get(url); 
          credentials.profile = userProfile;
        }
    };
};
