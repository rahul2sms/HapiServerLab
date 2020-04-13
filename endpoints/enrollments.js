const axios = require('axios').default;
const PortalConfig = require('../providers/configProvider').PortalConfig;

module.exports.enrollments = {
    getStatus: function(sub, idToken, accessToken){
    //    console.log(`inside getEnrollmentStatus sub:${sub}, idToken: ${idToken}, accessToken: ${accessToken}`);

        return axios({
            url: `${PortalConfig.SERVICE_BASE_URL}/account/v1/enrollment/status?idToken=${idToken}`,
            method: 'GET',
            headers: {
                "x-user-id": `${sub}`,
                "x-user-agent": "cwp",
                "Authorization" : `Bearer ${accessToken}`
              }
        })
        .then(response=>{
            if(response.data)
                return response.data;

            return "No data found in GetEnrollmentStatus resoponse."
        }, )
        .catch(err=>{
            console.log(err);
            return Promise.reject("Error while fetching GetEnrollmentStatus" );
        });
    }
}