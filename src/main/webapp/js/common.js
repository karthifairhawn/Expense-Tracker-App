import {findWallets} from '../apis/wallets.js';
import * as util from './util.js';


// Logout user on clicking logout button on navbar
$('.logout').click(()=>{
    localStorage.clear();
    window.location.href= 'login.html';
})

// Redirect to login if no authToken
let authToken = localStorage.getItem('authToken');
if(authToken == null || authToken.length == 0 || typeof authToken === undefined){
    window.location.href = 'login.html';
} 





