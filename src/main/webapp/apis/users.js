import { server,orgin } from '../config/apiConfig.js';


var myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer "+localStorage.getItem('authToken'));
myHeaders.append("Access-Control-Allow-Origin", orgin);

var userId= localStorage.getItem('userId');

// Create user
async function createUser(raw) {
    var postRequestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};
    const response = await fetch(server+"/api/v1/users/"+userId+"/wallets", postRequestOptions);
    return await response.json();
}

// Retrieve user information
async function findUserById(id) {
    var postRequestOptions = {method: 'GET',headers: myHeaders,redirect: 'follow'};
    const response = await fetch(server+"/api/v1/users/"+id, postRequestOptions);
    return await response.json();
}

// Login user
async function loginUser(raw) {
    var postRequestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};
    const response = await fetch(server+"/api/v1/login", postRequestOptions);
    return await response.json();
}

export {createUser,findUserById,loginUser};