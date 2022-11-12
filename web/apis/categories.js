import { server,orgin } from '../config/apiConfig.js';


var myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer 2d1adb5f75376ff7b3a5feb3682590b9");
myHeaders.append("Access-Control-Allow-Origin", orgin);

var userId= 1;




// Create tag
async function createCategory(raw) {
    var postRequestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};
    const response = await fetch(server+"/api/v1/users/"+userId+"/categories", postRequestOptions);
    return await response.json();
}

// Retrieve Tags
async function findCategories() {
    var postRequestOptions = {method: 'GET',headers: myHeaders,redirect: 'follow'};
    const response = await fetch(server+"/api/v1/users/"+userId+"/categories", postRequestOptions);
    return await response.json();
}

async function findCategoryById(id) {
    var postRequestOptions = {method: 'GET',headers: myHeaders,redirect: 'follow'};
    const response = await fetch(server+"/api/v1/users/"+userId+"/categories/"+id, postRequestOptions);
    return await response.json();
}

// Update tags
async function updateCategoryById(id,raw) {
    var postRequestOptions = {method: 'PUT',headers: myHeaders,body: raw,redirect: 'follow'};
    const response = await fetch(server+"/api/v1/users/"+userId+"/categories/"+id, postRequestOptions);
    return await response.json();
}

// Delete tags
async function deleteCategoryById(id) {
    var postRequestOptions = {method: 'DELETE',headers: myHeaders,redirect: 'follow'};
    const response = await fetch(server+"/api/v1/users/"+userId+"/categories/"+id, postRequestOptions);
    return await response.json();
}


export {createCategory,findCategories,findCategoryById,updateCategoryById,deleteCategoryById}