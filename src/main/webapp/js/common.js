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

// Verify isvalid authToken is using
let walletInfo = await findWallets();
if(walletInfo.statusCode == 404){
    localStorage.clear();
    window.location.href = 'login.html';
}



// Get all Wallet Information and update top balance container.
var allWallets =[];
var nonCardWalletsCount = 0;
var cardWalletsCount = 0;
var nonCardWalletsBalance = 0
var cardWalletsBalance = 0



