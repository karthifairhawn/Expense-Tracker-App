import { server,orgin } from '../config/apiConfig.js';

var myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer "+localStorage.getItem('authToken'));
myHeaders.append("Access-Control-Allow-Origin", orgin);


var userId= localStorage.getItem('userId');



// findWallets().then((data) => console.log(data))

// Create Transactions
async function createTransactions(raw) {
    var postRequestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};
    const response = await fetch(server+"/api/v1/users/"+userId+"/transactions", postRequestOptions);
    return await response.json();
}
  

// Retrieve Transactions 
async function findTransactions(from,to,type) {
    var getRequestOptions = { method: 'GET',headers: myHeaders,redirect: 'follow'};
    const response = await fetch(server+"/api/v1/users/"+userId+"/transactions?from="+from+"&to="+to+"&type="+type, getRequestOptions);
    return await response.json();
}

async function findTransactionsById(id) {
    var getRequestOptions = { method: 'GET',headers: myHeaders,redirect: 'follow'};
    const response = await fetch(server+"/api/v1/users/"+userId+"/transactions/"+id, getRequestOptions);
    return await response.json();
}



// Update Transactions
async function updateTransactionsById(id,raw) {
    var putRequestOptions = {method: 'PUT',headers: myHeaders,body: raw,redirect: 'follow'};
    const response = await fetch(server+"/api/v1/users/"+userId+"/transactions/"+id, putRequestOptions);
    return await response.json();
}


// Delete Transactions
async function deleteTransactionsById(id) {
    var deleteRequestOptions = {method: 'DELETE',headers: myHeaders,redirect: 'follow'};
    const response = await fetch(server+"/api/v1/users/"+userId+"/transactions/"+id, deleteRequestOptions);
    return await response.json();
}



export { createTransactions,findTransactions,updateTransactionsById,deleteTransactionsById,findTransactionsById}



