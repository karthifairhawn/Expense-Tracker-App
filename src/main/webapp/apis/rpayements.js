import { server,orgin } from '../config/apiConfig.js';
import * as util from '../js/util.js';

var myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer "+localStorage.getItem('authToken'));
myHeaders.append("Access-Control-Allow-Origin", orgin);

var userId= localStorage.getItem('userId');




// Create tag
export async function createRecPayment(raw) {
    var postRequestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};
    try{
        const response = await fetch(server+"/api/v1/users/"+userId+"/payments", postRequestOptions);
        return await response.json();
    }catch(e){
        util.handleApiResponse({statusCode:500},"","Server Unreachable")
    }
        
}

// Retrieve Tags
export  async function findRecPayments() {
    var postRequestOptions = {method: 'GET',headers: myHeaders,redirect: 'follow'};
    try{
        const response = await fetch(server+"/api/v1/users/"+userId+"/payments", postRequestOptions);
        return await response.json();
    }catch(e){
        util.handleApiResponse({statusCode:500},"","Server Unreachable")
    }
}

export  async function findRecPaymentById(id) {
    var postRequestOptions = {method: 'GET',headers: myHeaders,redirect: 'follow'};
    try{
        const response = await fetch(server+"/api/v1/users/"+userId+"/payments/"+id, postRequestOptions);
        return await response.json();
    }catch(e){
        util.handleApiResponse({statusCode:500},"","Server Unreachable")
    }
}

// Update tags
export  async function UpdateRecPaymentById(id,raw) {
    var postRequestOptions = {method: 'PUT',headers: myHeaders,body: raw,redirect: 'follow'};
    try{
        const response = await fetch(server+"/api/v1/users/"+userId+"/payments/"+id, postRequestOptions);
        return await response.json();
    }catch(e){
        util.handleApiResponse({statusCode:500},"","Server Unreachable")
    }
}

// Delete tags
export  async function deleteRecPaymentById(id) {
    var postRequestOptions = {method: 'DELETE',headers: myHeaders,redirect: 'follow'};
    try{
        const response = await fetch(server+"/api/v1/users/"+userId+"/payments/"+id, postRequestOptions);
        return await response.json();
    }catch(e){
        util.handleApiResponse({statusCode:500},"","Server Unreachable")
    }
}

