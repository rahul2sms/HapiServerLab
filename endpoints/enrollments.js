const axios = require('axios').default;

module.exports.enrollments = {
    getStatus: function(sub, idToken, accessToken){
        console.log(`inside getEnrollmentStatus sub:${sub}, idToken: ${idToken}, accessToken: ${accessToken}`);

        return axios({
            url: `https://b-h-s.spr.us00.int.con-veh.net/account/v1/enrollment/status?idToken=${idToken}`,
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