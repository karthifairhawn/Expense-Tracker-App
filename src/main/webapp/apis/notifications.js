import { server,orgin } from '../config/apiConfig.js';
import * as util from '../js/util.js';

var myHeaders = new Headers();
                
myHeaders.append("Authorization", "Bearer "+localStorage.getItem('authToken'));
myHeaders.append("Access-Control-Allow-Origin", orgin);

var userId= localStorage.getItem('userId');

// Retrieve notifications
export async function findAll() {
    var postRequestOptions = {method: 'GET',headers: myHeaders,redirect: 'follow'};
    
    try{
        const response = await fetch(server+"/api/v1/users/"+userId+"/notifications", postRequestOptions);
        return await response.json();
    }catch(e){
        util.handleApiResponse({statusCode:500},"","Server Unreachable")
    }
}

// Delete Notification
export async function deleteById(id) {
    var postRequestOptions = {method: 'DELETE',headers: myHeaders,redirect: 'follow'};
    try{
        const response = await fetch(server+"/api/v1/users/"+userId+"/notifications/"+id, postRequestOptions);
        return await response.json();
    }catch(e){
        util.handleApiResponse({statusCode:500},"","Server Unreachable")
    }
}

// Delete All Notification
export async function deleteAll() {
    var postRequestOptions = {method: 'DELETE',headers: myHeaders,redirect: 'follow'};
    try{
        const response = await fetch(server+"/api/v1/users/"+userId+"/notifications", postRequestOptions);
        return await response.json();
    }catch(e){
        util.handleApiResponse({statusCode:500},"","Server Unreachable")
    }
}

// Update Notification
export async function updateById(id,raw) {
    var postRequestOptions = {method: 'PUT',headers: myHeaders,body: raw,redirect: 'follow'};
    try{
        const response = await fetch(server+"/api/v1/users/"+userId+"/notifications/"+id, postRequestOptions);
        return await response.json();
    }catch(e){
        util.handleApiResponse({statusCode:500},"","Server Unreachable")
    }
}