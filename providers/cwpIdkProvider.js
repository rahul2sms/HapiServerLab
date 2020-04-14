'use strict';

const PortalConfig = require('./configProvider').PortalConfig;

exports = module.exports = function (options) {
    return {
        name: 'cwpIdkProviderOidc',
        protocol: 'oauth2',
        useParamsAuth: true,
        auth: `${PortalConfig.SERVICE_BASE_URL}/oidc/v1/authorize`,
        token: `${PortalConfig.SERVICE_BASE_URL}/oidc/v1/token`,
        scope: ['openid', 'profile', 'email'],
        profile: async function (credentials, params, get) {
          credentials.profile = await get(`${PortalConfig.SERVICE_BASE_URL}/oidc/v1/userinfo`); 
        }
    };
};
