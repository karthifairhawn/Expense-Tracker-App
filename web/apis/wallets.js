import { server,orgin } from '../config/apiConfig.js';

var myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer 2d1adb5f75376ff7b3a5feb3682590b9");
myHeaders.append("Access-Control-Allow-Origin", orgin);


var userId= 1;



// findWallets().then((data) => console.log(data))

// Create wallets
async function createWallet(raw) {
    var postRequestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};
    const response = await fetch(server+"/api/v1/users/"+userId+"/wallets", postRequestOptions);
    return await response.json();
}
  

// Retrieve Wallets 
async function findWallets() {
    var getRequestOptions = { method: 'GET',headers: myHeaders,redirect: 'follow'};
    const response = await fetch(server+"/api/v1/users/"+userId+"/wallets", getRequestOptions);
    return await response.json();
}

async function findWalletById(id) {
    var getRequestOptions = { method: 'GET',headers: myHeaders,redirect: 'follow'};
    const response =  await fetch(server+"/api/v1/users/"+userId+"/wallets/"+id, getRequestOptions);
    $.ajax({

    })
    return await response.json();
}



// Update Wallets
async function updateWalletById(id,raw) {
    var putRequestOptions = {method: 'PUT',headers: myHeaders,body: raw,redirect: 'follow'};
    const response = await fetch(server+"/api/v1/users/"+userId+"/wallets/"+id, putRequestOptions);
    return await response.json();
}


// Delete Wallets
async function deleteWalletById(id) {
    var deleteRequestOptions = {method: 'DELETE',headers: myHeaders,redirect: 'follow'};
    const response = await fetch(server+"/api/v1/users/"+userId+"/wallets/"+id, deleteRequestOptions);
    return await response.json();
}



export { createWallet,findWallets,updateWalletById,deleteWalletById,findWalletById } 






