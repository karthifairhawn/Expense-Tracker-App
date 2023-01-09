import { server,orgin } from '../config/apiConfig.js';
import * as util from '../js/util.js';


var myHeaders = new Headers();
                
myHeaders.append("Authorization", "Bearer "+localStorage.getItem('authToken'));
myHeaders.append("Access-Control-Allow-Origin", orgin);

var userId = localStorage.getItem('userId');

// Delete Alert
export  async function deleteById(walletId,alertId) {
    var postRequestOptions = {method: 'DELETE',headers: myHeaders,redirect: 'follow'};
    try{
        const response = await fetch(server+"/api/v1/users/"+userId+"/wallets/"+walletId+"/alerts/"+alertId, postRequestOptions);
        return await response.json();
    }catch(e){

        util.handleApiResponse({statusCode:500},"","Server Unreachable")
    }
}

// Create Alert 
export async function createAlert(walletId,raw) {
    
    var postRequestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};
    try{
        const response = await fetch(server+"/api/v1/users/"+userId+"/wallets/"+walletId+"/alerts", postRequestOptions);
        return await response.json();
    }catch(e){
        util.handleApiResponse({statusCode:500},"","Server Unreachable")
    }
}