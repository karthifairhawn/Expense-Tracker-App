import {findWalletById, findWallets,createWallet,deleteWalletById,updateWalletById} from '../apis/wallets.js';


$('.logout').click(()=>{
    localStorage.clear();
    window.location.href= 'login.html';
})


let authToken = localStorage.getItem('authToken');
if(authToken == null || authToken.length == 0 || typeof authToken === undefined){
    window.location.href = 'login.html';
} 


let walletInfo = await findWallets();
if(walletInfo.statusCode == 404){
    localStorage.clear();
    window.location.href = 'login.html';
}

