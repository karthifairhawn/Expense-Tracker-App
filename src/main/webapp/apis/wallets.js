import { server,orgin } from '../config/apiConfig.js';
import * as util from '../js/util.js';

var myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer "+localStorage.getItem('authToken'));
myHeaders.append("Access-Control-Allow-Origin", orgin);


var userId= localStorage.getItem('userId');




// Create wallets
async function createWallet(raw) {
    var postRequestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};
    try{
        const response = await fetch(server+"/api/v1/users/"+userId+"/wallets", postRequestOptions);
        return await response.json();
    }catch(e){
        util.handleApiResponse({statusCode:500},"","Server Unreachable")
    }
}
  

// Retrieve Wallets 
async function findWallets() {
    var getRequestOptions = { method: 'GET',headers: myHeaders,redirect: 'follow'};
    try{
        const response = await fetch(server+"/api/v1/users/"+userId+"/wallets", getRequestOptions);
        return await response.json();
    }catch(e){
        util.handleApiResponse({statusCode:500},"","Server Unreachable")
    }
}

async function findWalletById(id) {
    var getRequestOptions = { method: 'GET',headers: myHeaders,redirect: 'follow'};
    try{
        const response =  await fetch(server+"/api/v1/users/"+userId+"/wallets/"+id, getRequestOptions);
        return await response.json();
    }catch(e){
        util.handleApiResponse({statusCode:500},"","Server Unreachable")
    }
}



// Update Wallets
async function updateWalletById(id,raw) {
    var putRequestOptions = {method: 'PUT',headers: myHeaders,body: raw,redirect: 'follow'};
    try{
        const response = await fetch(server+"/api/v1/users/"+userId+"/wallets/"+id, putRequestOptions);
        return await response.json();
    }catch(e){
        util.handleApiResponse({statusCode:500},"","Server Unreachable")
    }
}


// Delete Wallets
async function deleteWalletById(id) {
    var deleteRequestOptions = {method: 'DELETE',headers: myHeaders,redirect: 'follow'};
    try{
        const response = await fetch(server+"/api/v1/users/"+userId+"/wallets/"+id, deleteRequestOptions);
        return await response.json();
    }catch(e){
        util.handleApiResponse({statusCode:500},"","Server Unreachable")
    }
}



export { createWallet,findWallets,updateWalletById,deleteWalletById,findWalletById } 






