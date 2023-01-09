import * as trasnsactionService from '../apis/transactions.js';
import * as walletService from '../apis/wallets.js';
import * as util from './util.js';
import * as cardAlertsService from '../apis/cardAlerts.js'
import * as commonService from './common.js';



// Mount Dashboard by default
$('.nav-item[tabs=wallets]').addClass('active')
let colorOne = ['d6eb70','cc7aa3','85cc70','99ff66','a3f5f5','9999f5','ada399','ffd6ff','f5b87a','fadbbd','99b8cc'];
let colorTwo = ['ebf5b8','e6bdd1','c2e6b8','ccffb3','d1fafa','ccccfa','d6d1cc','ffebff','fadbbd','c2c2d1','ccdbe6'];
let walletSymbol = { 'Bank Account': 'fa-building-columns', 'Credit Card': 'fa-credit-card', 'Bonus Account':'fa-gift', 'Other':'fa-piggy-bank'}
let userWallets = [];
let userWalletFull = [];
let userCardWallets = [];
let userNonCardWallets = [];
let totalBalance = 0;
let cardBalance = 0;
let nonCardBalance = 0;

let walletUtil = {
    deleteWalletById :  function deleteWalletById(walletId){
        $('#spinner').show();
        walletService.deleteWalletById(walletId).then((data)=>{
            $('#spinner').hide();
            util.handleApiResponse(data,"Wallet Deleted 🗑️");
            refreshWalletsPage();
        })
    }       
}

let walletFormUtil = {

    mountWalletSubInforForm : function mountWalletSubInforForm(walletType){
        $('#wallet-info-form').html('');
        if(walletType=='Bank Account'){
            let bankWalletForm = $('#create-wallet-bank-account')[0];
            let w1c = bankWalletForm.content.cloneNode(true);
            $('#wallet-info-form').append(w1c);
        }else if(walletType =='Credit Card'){
            let creditCardForm = $('#create-wallet-credit-card')[0];
            let w2c = creditCardForm.content.cloneNode(true);
            $('#wallet-info-form').append(w2c);                  
        }else if(walletType == 'Bonus Account'){
            let bonusAccountForm = $('#create-wallet-bonus-account')[0];
            let w3c = bonusAccountForm.content.cloneNode(true);
            $('#wallet-info-form').append(w3c);
        }else if(walletType == 'Other'){
            let otherWalletForm = $('#create-wallet-other')[0];
            let w4c = otherWalletForm.content.cloneNode(true);
            $('#wallet-info-form').append(w4c);
        }
    },

    editWalletSubmissionHandler : function editWalletSubmissionHandler(walletId,walletType){
        let wallet = walletFormUtil.getWalletInfoFromForm(walletType);
        if(wallet==null){
            return;
        }
        $('#spinner').show();
        walletService.updateWalletById(walletId,JSON.stringify(wallet)).then((data) => {
            $('.btn-close').click();
            $('#spinner').hide();
            util.handleApiResponse(data,"Wallet Edited ✏️ ");
            refreshWalletsPage();
        })
    },

    walletSubmissionHandler : function walletSubmissionHandler(){

        let wallet = walletFormUtil.getWalletInfoFromForm();
        if(wallet == null) return;

        $('#spinner').css('display', 'block');
        walletService.createWallet(JSON.stringify(wallet)).then((data) =>{
            $('#spinner').css('display', 'none');
            $('#wallets .btn-close').click();
            refreshWalletsPage();
            util.handleApiResponse(data,"Wallet Created ✅ ","Failed, Please try again..");
        })
        
    },

    getWalletInfoFromForm : function getWalletInfoFromForm(walletTypee){

        let walletName = $('#new-wallet-name').val();
        let acctBalance = ($('#new-wallet-balance').val());
        let walletType = $('#new-wallet-type').val();
        if(walletType == undefined) walletType = walletTypee;
        let walletExludeFromStats = $('#new-wallet-exclude').val();

        let newWalletObject = {
            "name": walletName,
            "type": walletType,
            "archiveWallet": false,
            "balance": +acctBalance,
            "excludeFromStats": walletExludeFromStats,
        }

        let isValid = true;
        isValid = util.isNotEmpty(walletType,$('#new-wallet-type')) && isValid;

        isValid = util.isNotEmpty(acctBalance, $('#new-wallet-balance')) && isValid
        isValid = util.isNumber(acctBalance, $('#new-wallet-balance')) && isValid
        isValid = util.isLessThanN(acctBalance,10000000,$('#new-wallet-balance')) && isValid
        isValid = util.isGreaterThanZero(acctBalance,10000000,$('#new-wallet-balance')) && isValid

        isValid = util.isNotEmpty(walletName,$('#new-wallet-name')) && isValid


        if(newWalletObject.type=='Bank Account'){
            // console.log($('#new-wallet-banknote').val());
            newWalletObject['walletInfo'] = {
                "note": util.isNotEmpty($('#new-wallet-banknote').val()) ? $('#new-wallet-banknote').val() : ""
            }
            console.log(newWalletObject);
        }else if(newWalletObject.type=='Credit Card'){
            newWalletObject['walletInfo'] = {
                "repayDate" : $('#new-wallet-repay').val(),
                "limit": $('#new-wallet-limit').val()
             }


             isValid = util.isNumber($('#new-wallet-limit').val(), $('#new-wallet-limit')) && isValid
             isValid = util.isLessThanN($('#new-wallet-limit').val(),10000000, $('#new-wallet-limit')) && isValid
             isValid = util.isNotEmpty($('#new-wallet-limit').val(), $('#new-wallet-limit')) && isValid

             if(Number($('#new-wallet-limit').val())<Number(acctBalance)){
                isValid = false;
                $('.limit-low-err').removeClass('invisible');
            }else{
                $('.limit-low-err').addClass('invisible')
             }



        }else if(newWalletObject.type=='Bonus Account'){
            newWalletObject['walletInfo'] = { "note" : $('#new-wallet-bnote').val() }
        }else if(newWalletObject.type=='Other'){
            newWalletObject['walletInfo'] = { "note" : $('#new-wallet-onote').val() }
        }

    
        if(!isValid) return null;
        return newWalletObject;
    }
    
}

$(document).ready(()=>{
    refreshWalletsPage();
})


async function refreshWalletsPage(){
    userWallets = [];
    userWalletFull = [];
    userCardWallets = [];
    userNonCardWallets = [];
    totalBalance = 0;
    await walletService.findWallets().then((data)=> {
        if(data==null) return;
        data = data.data;
        for(const category in data){
            if(category =='Credit Card') userCardWallets.push(...data[category]);
            else userNonCardWallets.push(...data[category]);
            userWallets.push(...data[category]);
        }
        for(let wallet in userWallets){
            let type = (userWallets[wallet].type);
            totalBalance += userWallets[wallet].balance;
            if(type == 'Credit Card') cardBalance+= userWallets[wallet].balance;
            else nonCardBalance+= userWallets[wallet].balance;
        }
    });

    populateBalanceContainer();
    $('#spinner').show();

    // To be removed
    setTimeout(() => {
        $('#spinner').hide();        
        mountWallets();
        initiateListeners();
    }, 300);



    if(userWallets.length==0){
        $('.no-wallet-available').show();
        $('.create-wallet-url').click(()=>{ $('.add-wallet-btn').click(); })
        $('.add-income-btn').hide();
        $('.view-income-btn').hide();
    }else{
        $('.no-wallet-available').hide();
    }

    if(userNonCardWallets==0){
        $('.my-wallets-title').hide();
    }

    if(userCardWallets==0){
        $('.cards-section').hide();
    }

}

function initiateListeners(){
    $('.add-income-btn').off();
    $('.add-wallet-btn').off();
    $('.view-income-btn').off();
    $('.create-alert').off();
    $('.wallets-csettings').off();
    $('.add-income-btn').click(()=>{ mountAddIncomeModal() })
    $('.add-wallet-btn').click(()=>{ mountWalletCreationForm() })
    $('.view-income-btn').click(()=>{ mountAllIncomes() })
    $('.create-alert').click((e)=>{ mountCreateAlertForm($(e.target).attr('wallet-id'))  })
    $('.wallets-csettings').click(function() {
        // util.expenseFormUtil.listWalletsInForm();
    });

    $('.ecc-set-y').click(()=>{
        localStorage.setItem('eccStatus',1)
        util.handleApiResponse({statusCode:200},"Changes made successfully","");
    })

    $('.ecc-set-n').click(()=>{
        localStorage.setItem('eccStatus',0)
        util.handleApiResponse({statusCode:200},"Changes made successfully","");
    })
}

// Set top container values
function populateBalanceContainer(){
    let eccStatus = localStorage.getItem('eccStatus');
    if(eccStatus==1){
        $('#mi-bal-amount').text(util.moneyFormat(totalBalance-cardBalance)); 
        $('#total-acct-count').text(userNonCardWallets.length);
    }else{
        $('#total-acct-count').text(userWallets.length);
        $('#mi-bal-amount').text(util.moneyFormat(totalBalance)); 
        localStorage.setItem('eccStatus',0);   
    }
}

async function mountWallets(){

    // Copy template content to the DOM
    $('#wallets').html('');
    let walletContainer = document.getElementById("wallets");
    let walletContainerTemplate = document.getElementById("wallet-container-header");
    let clone = walletContainerTemplate.content.cloneNode(true);
    walletContainer.appendChild(clone);

    populateCardWallets();
    populateNonCardWallets(userNonCardWallets);

   
    async function populateCardWallets(){

        let allWallets = userCardWallets;
        let totalCardExpense = 0; 
        let cardSymbols = ['fa-circle-notch','fa-shapes','fa-yin-yang','fa-tablets','fa-spa','fa-ribbon','fa-paw','fa-life-ring','fa-infinity','fa-futbol','fa-feather'];

        for(let i = 0; i < allWallets.length; i++){

            let walletCardClone = $('#credit-card-template')[0].content.cloneNode(true);

            let subInfo =null;
            let wallet = allWallets[i];  
            userWalletFull.push(wallet)
            subInfo = wallet.walletInfo;

            let creditCardUsagePercent = ((subInfo.limit - wallet.balance) / subInfo.limit) * 100;

            const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
            const d = new Date();
            let name = null;
            if(d.getDate()<parseInt(subInfo.repayDate)){
                name = month[(d.getMonth())];
            }else{
                name = month[(d.getMonth()+1)%12];
            }
            let diffDays = '';
            diffDays= subInfo.repayDate +", "+name;
            if(d.getDate() == parseInt(subInfo.repayDate)) diffDays = 'Today'

            $(walletCardClone).find(".card-name").html('<i class="fa-solid '+walletSymbol[wallet.type]+'"></i>'+"  "+ wallet.name)
            $(walletCardClone).find('.amount').text(util.moneyFormat(wallet.balance))
            $(walletCardClone).find('.amount').attr('amount',(wallet.balance))
            $(walletCardClone).find('#open-wallet-btn').attr('wallet-id',wallet.id)
            $(walletCardClone).find('.edit-wallet-btn').attr('wallet-id',wallet.id);
            $(walletCardClone).find('.delete-wallet-btn').attr('wallet-id',wallet.id);
            $(walletCardClone).find('.credit-card').attr('data-bs-toggle','modal');
            $(walletCardClone).find('.credit-card').attr('data-bs-target','#walletInfoModal'+wallet.id);
            $(walletCardClone).find('#walletInfoModal').attr('id','walletInfoModal'+wallet.id);
            $(walletCardClone).find('.wallet-exclude-stats').text(wallet.excludeFromStats);
            $(walletCardClone).find('.card-limit').text( util.abbreviateNumber(subInfo.limit))
            $(walletCardClone).find('.pay-bill-btn').attr('wallet-id',wallet.id);
            $(walletCardClone).find('.pay-bill-btn').attr('payment', (subInfo.limit- wallet.balance));
            $(walletCardClone).find('.days-left').text(diffDays);
            $(walletCardClone).find('.due-date').text(subInfo.repayDate);
            $(walletCardClone).find('.credit-card-used').text(creditCardUsagePercent.toFixed(2));
            $(walletCardClone).find('.card-symbol .fas').addClass(cardSymbols[wallet.id%9])
            $(walletCardClone).find('.edit-wallet-btn').attr('wallet-id',wallet.id);
            $(walletCardClone).find('.create-alert').attr('wallet-id',wallet.id);
            if(creditCardUsagePercent>100){ $(walletCardClone).find('.overdraft-warning').css('display', 'block'); }
            

            $(walletCardClone).find('.edit-wallet-btn').attr('type',wallet.type);
            $(walletCardClone).find('.edit-wallet-btn').click((event)=> { 
                mountEditWalletForm(event.target.getAttribute('wallet-id'),event.target.getAttribute('type')) 
            });

            

            $(walletCardClone).find('.delete-wallet-btn').click(function(event) { walletUtil.deleteWalletById(event.target.getAttribute('wallet-id')) })
            $(walletCardClone).find('.pay-bill-btn').click((event)=>{
                mountCreditCardBillModal(event) 
            })

            let cardAlerts = allWallets[i].walletInfo.alerts;
            // console.log(allWallets[i])
            for(let j=0; j<cardAlerts.length; j++){
                let alertElement = $('<div class="mb-2 card-field alert-ele d-flex"> <div class="alert-key label">Limit: </div> <div class="alert-value value wallet-info-label"></div><i class="alert-del-btn fa-solid fa-delete-left" style="display:none"></i> </div>');
                let alertType = cardAlerts[j].type=='due' ? "Due Alert" : "Limit Alert";
                let alertValue = alertType == "Due Alert" ? "Before " + cardAlerts[j].dueAlertBefore +" Days" : " on "+cardAlerts[j].limitAlertOn +" %";
                $(alertElement).find('.alert-key').text(alertType);
                $(alertElement).find('.alert-value').text(alertValue);
                // $(alertElement).hover()
                $(alertElement).find(".alert-del-btn").attr('alert-id',cardAlerts[j].id);
                $(alertElement).find(".alert-del-btn").attr('wallet-id',wallet.id);
                $(alertElement).hover(()=>{
                    $(alertElement).find('.alert-del-btn ').show();
                },()=>{
                    $(alertElement).find('.alert-del-btn ').hide();
                });
                $(walletCardClone).find(".card-alerts").append(alertElement);

            }

            if(cardAlerts.length==0){
                $(walletCardClone).find(".card-alerts").append($("<h3><center>No Card Alerts</center></h3>"));
            }

            $(walletCardClone).find(".alert-del-btn").click((e)=>{
                let alertId = $(e.target).attr('alert-id');
                let walletId = $(e.target).attr('wallet-id');
                cardAlertsService.deleteById(walletId,alertId).then(()=>{
                    $(e.target).closest('.card-field').remove();
                })
            })


            function mountCreditCardBillModal(event){
                if(event.target.getAttribute('payment')=='0'){ $('#creditBillModal').find('.modal-body').html('<h1>No Bills</h1>') }
                $('#creditBillModal').find('.amount').val(event.target.getAttribute('payment'));
                $('#creditBillModal').find('#new-income-wallet').val(wallet.id);
                $('#total-bill').text(event.target.getAttribute('payment'));
                $('#creditBillModal').find('amount').attr('min','1');
                $('#creditBillModal').find('amount').attr('max',event.target.getAttribute('payment'));
                $('.add-income-submit').off();
                let maxIncome = parseInt(event.target.getAttribute('payment'))
                $('.add-income-submit').click((event)=> { submitBillPayment(event,maxIncome) })
            }

            function submitBillPayment(event,maxIncome){
                console.log("submit recieved")
                let form = $(event.target).closest('.create-expense-form');
                let paymentAmount = +($(form).find('.amount').val());
                let note = $(form).find('.note').val();
                let walletId =  +($(form).find('.wallet-selection').val());

                maxIncome = parseInt(maxIncome)
                maxIncome+=1;
        
                let isValid = true;
                isValid = util.isNotEmpty(paymentAmount,$(form).find('.amount')) && isValid;
                isValid = util.isLessThanN(paymentAmount,maxIncome,$(form).find('.amount')) && isValid;
                isValid = util.isNumber(walletId,$(form).find('.wallet-selection')) && isValid;
                isValid = util.isGreaterThanZero(paymentAmount,$(form).find('.amount')) && isValid;
        
                console.log(util.isLessThanN(paymentAmount,maxIncome,$(form).find('.amount')));
                console.log(paymentAmount+"<"+maxIncome)
                if(!isValid) return;

                $('.add-income-submit').off();
                let income = {
                    "type" : "income",
                    "amount" : paymentAmount,
                    "transactionInfo" : {
                        "note" : note,
                        "walletId" : walletId
                    }
                }
        
                $('#spinner').show();
                trasnsactionService.createTransactions(JSON.stringify(income)).then((data)=>{
                    $('#spinner').hide();   
                    util.handleApiResponse(data,"Income Added ✅ ");
                    refreshWalletsPage(); 
                })
        
                $('.credit-bill-close-btn').click();
                $('.income-model-close-btn').click();
            }

            $('#credit-cards').append($(walletCardClone));
            totalCardExpense +=subInfo.limit - wallet.balance;


        }

        $('.card-used-amount').text(util.abbreviateNumber(totalCardExpense));


        // ----------------------   Card Animation Handlers    ---------------------

        let totalWidth = $('.credit-cards')[0].scrollWidth;
        let containerWidth = $('.credit-cards').width();
        if(totalWidth==containerWidth) $(".card-sc-right").hide();

        function moveCreditCardLeft(){
            $('.card-sc-right').css('display', 'flex');
                
            $('.credit-cards').animate({scrollLeft:  ($('.credit-cards').scrollLeft() - 400) }, 150);
            
            setTimeout(() => {                
                if($('.credit-cards').scrollLeft()==0){
                    $('.card-sc-left').css('display', 'none');
                }
            }, 150);
        }

        function moveCreditCardRight(){
            $('.credit-cards').animate({scrollLeft:  ($('.credit-cards').scrollLeft() + 400) }, 150);
            
            
            setTimeout(() => {
                let totalWidth =  $('.credit-cards')[0].scrollWidth - $('.credit-cards').width() ;
                let occuredWidth =  $('.credit-cards').scrollLeft();
                if(totalWidth==occuredWidth){ $(".card-sc-right").hide(); }
            }, 150);

        }

        $('.card-sc-right').click(()=>{ $('.card-sc-left').css('display', 'flex'); })
        $(".card-sc-right").click( function() { moveCreditCardRight() })
        $(".card-sc-left").click(function() { moveCreditCardLeft() })

    }

    async function populateNonCardWallets(allWallets){

        let newWalletSection = $('<span class="card-body">'+''+'</span>');

        for(let i = 0; i < allWallets.length; i++){

            // Appennd in new card clone to the current creating section
            let walletCardClone =  $('#wallet-card-template')[0].content.cloneNode(true);
            let wallet = allWallets[i];       
            let icon = ('<i class="fa-solid '+walletSymbol[wallet.type]+'"></i>')     
            $(walletCardClone).find(".acct-type-ico").html(icon);
            $(walletCardClone).find(".bank-name").text(wallet.name)
            $(walletCardClone).find('.acct-type').text(wallet.type)   
            $(walletCardClone).find('#open-wallet-btn').attr('wallet-id',wallet.id)
            $(walletCardClone).find('#open-wallet-btn').attr('data-bs-target','#walletInfoModal'+wallet.id);
            $(walletCardClone).find('#walletInfoModal').attr('id','walletInfoModal'+wallet.id);
            $(walletCardClone).find('.wallet-exclude-stats').text(wallet.excludeFromStats);
            $(walletCardClone).find('.edit-wallet-btn').attr('wallet-id',wallet.id);
            $(walletCardClone).find('.delete-wallet-btn').attr('wallet-id',wallet.id);
            $(walletCardClone).find('.balance').text(util.moneyFormat(wallet.balance))
            $(walletCardClone).find('.balance').attr('balance',(wallet.balance))
            $(walletCardClone).find('.edit-wallet-btn').attr('wallet-id',wallet.id);
            $(walletCardClone).find('.edit-wallet-btn').attr('type',wallet.type);

            $(walletCardClone).find('.edit-wallet-btn').click((event)=> { 
                mountEditWalletForm(event.target.getAttribute('wallet-id'),event.target.getAttribute('type')) 
            });

            if(wallet.balance <0 ) $(walletCardClone).find('.uncommon-wallet-fields').before($('<div class="text-danger">account is overdrafted</div>'))
            

            // Populate sub wallet info
            userWalletFull.push(wallet);
            let data = wallet.walletInfo;
            let subWalletInfoHtml = '';
            let formWalletInfo = $('<div></div>');

            for(const obj in data) {

                if(obj=='id') continue;

                let newWalletInfo = $('<div class="mb-2 d-flex align-items-center card-field"> <div class="label"></div><div class="spend-on value wallet-info-label '+obj+'"></div> </div>');
                
                if(obj=='note'){
                    newWalletInfo = $('<div class="mb-2 d-flex align-items-center flex-column w-100 card-field"> <div class="label w-100"></div><span class="w-100 d-flex align-items-center"><div class="w-100 spend-on value wallet-info-label '+obj+'" type="textarea"></div></span> </div>');
                }
                let key = obj;
                var text = obj;
                var result = text.replace( /([A-Z])/g, " $1" );
                key =  result;

                if(data[obj]=='null' || data[obj].length==0 || data[obj].length==null) data[obj] = "-";
                if(obj=='note'){
                    key = 'Note';
                   
                }


                if(obj!='note'){
                    subWalletInfoHtml +='<div class="uncommon-wallet-field mb-2"><div class="ucf-key">'+key+' :</div><span class="ucf-value">'+data[obj]+'</span></div>';
                }else{
                    subWalletInfoHtml +='<div class="uncommon-wallet-field mb-2"><div class="ucf-value">'+data[obj]+'</div></div>';
                }


                $(newWalletInfo).find('.label').text(key);   
                $(newWalletInfo).find('.value').text(data[obj]);   
                $(formWalletInfo).append(newWalletInfo);

            }

            $(walletCardClone).find('#walletInfoModal'+wallet.id+' .modal-body').append(formWalletInfo);
            $(walletCardClone).find('.uncommon-wallet-fields').append(subWalletInfoHtml);
            $(walletCardClone).find('.delete-wallet-btn').click(function(event) { walletUtil.deleteWalletById(event.target.getAttribute('wallet-id')) })
            $('#all-wallets-container').append(walletCardClone);

        }
        walletContainer.appendChild(newWalletSection[0]); 
    }


}

function mountWalletCreationForm(){

    let container = $('.ce-wallet-model').find('.modal-content');
    let formTemplate = $('#tt-ce-wallet-modal')[0].content.cloneNode(true);
    container.html('');
    container.append(formTemplate)

    $('#new-wallet-type').click((event)=>{ walletFormUtil.mountWalletSubInforForm(event.target.value) })
    $('#create-wallet').click(()=> walletFormUtil.walletSubmissionHandler());
}

function mountEditWalletForm(walletId,type){

    let container = $('.ce-wallet-model').find('.modal-content');
    let formTemplate = $('#tt-ce-wallet-modal')[0].content.cloneNode(true);
    container.html('');
    container.append(formTemplate)

    $('.add-wallet-btn').click();
    $('.ce-wallet-model').find('.modal-title').text("Edit Wallet");
    $('#new-wallet-type').closest('.input-group').remove();
    $('.ce-wallet-model').find('.edit-wallet-submit-btn').removeClass('invisible');
    $('#create-wallet').remove();   

    walletFormUtil.mountWalletSubInforForm(type);

    let editingWallet = null;
    for(let wallet of userWalletFull) if(wallet.id==walletId) editingWallet = wallet;

    $('.ce-wallet-model').find('#new-wallet-name').val(editingWallet.name);
    $('.ce-wallet-model').find('#new-wallet-balance').val(editingWallet.balance);


    if(type=='Credit Card'){
        $('.ce-wallet-model').find('#new-wallet-limit').val(editingWallet.walletInfo.limit);
        $('.ce-wallet-model').find('#new-wallet-repay').val(editingWallet.walletInfo.repayDate);
    }else if(type=='Bank Account'){
        $('.ce-wallet-model').find('#new-wallet-accno').val(editingWallet.walletInfo.accountNumber=='not specified' ? '' : editingWallet.walletInfo.accountNumber);
        $('.ce-wallet-model').find('#new-wallet-ifsc').val(editingWallet.walletInfo.ifscCode=='not specified' ? '' : editingWallet.walletInfo.ifscCode);
    }else if(type=='Bonus Account'){
        $('.ce-wallet-model').find('#new-wallet-bnote').val(editingWallet.walletInfo.note);
    }else if(type=='Others'){
        $('.ce-wallet-model').find('#new-wallet-onote').val(editingWallet.walletInfo.note);
    }

    editingWallet.repayDate = parseInt(editingWallet.repayDate);
    $('.edit-wallet-submit-btn').click(()=> { walletFormUtil.editWalletSubmissionHandler(walletId,type) });

}

async function mountAllIncomes(){

    let allDateRanges =  {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    };


    let start = moment().startOf('year');
    let end = allDateRanges['This Month'][1];

    start = start.format('YYYYMMDD').split('-').join('');
    end = end.add(1,'days').format('YYYYMMDD').split('-').join('');

    let incomeData = null;
    await trasnsactionService.findTransactions(start,end,'incomes').then((data)=>incomeData = data.data.incomes);

    $('#allIncomes .income-table-view .tbody').html('');

    for(let i = 0; i < incomeData.length; i++){
        let newRow = $('<tr> <th scope="row" class="wallet">1</th> <td class="time">Mark</td> <td class="amount">Otto</td> <td class="note">@mdo</td> </tr>');

        let walletInfo = null;
        let walletId = incomeData[i]['transactionInfo']['walletId'];
        let isDeletedWallet = false;
        for(let wallet of userWallets){
            if(wallet.id == walletId){
                walletInfo = wallet;
            }
        }

        if(walletInfo==null) continue;

        if(incomeData[i]['transactionInfo']['note']==''){
            incomeData[i]['transactionInfo']['note'] = "-"
        }
        let walletName = (walletInfo.name);
        newRow.find('.note').text(incomeData[i]['transactionInfo']['note']);
        newRow.find('.time').text(incomeData[i]['timestamp']);
        newRow.find('.wallet').text(walletName);
        if(isDeletedWallet) newRow.find('.wallet').append(' <i class="fas expired-expense-ico fa-ban"></i>')
        newRow.find('.amount').text(incomeData[i]['amount']+" ₹");

        $('.income-table-view .tbody').append(newRow);
    }

    if(incomeData.length==0){
        $('.income-table-view .tbody').append('<h3>No Income Transactions</h3>');
    }
}

function mountAddIncomeModal(isBill,billMax){

    $('#addIncomeForm')[0].reset();
    let walletSelection = $('#incomeModal').find('.wallet-selection');

    $('#incomeModal').find('.wallet-selection').html('');
    $('.add-income-submit').off();
    $('.add-income-submit').click((event)=>{ submitIncome(event)})

    if(userNonCardWallets==0){
        $('#incomeModal').find('.modal-body').html('<h3>No wallets found to add income</h3>')
    }
    for(let i=0;i<userNonCardWallets.length;i++){
        walletSelection.append('<option value='+userNonCardWallets[i].id+'>'+userNonCardWallets[i].name+'</option>');
    }

    function submitIncome(event){
        
        let form = $(event.target).closest('.create-expense-form');
        let paymentAmount = +($(form).find('.amount').val());
        let note = $(form).find('.note').val();
        let walletId =  +($(form).find('.wallet-selection').val());

        let isValid = true;

        isValid = util.isNotEmpty(paymentAmount,$(form).find('.amount')) && isValid;
        isValid = util.isLessThanN(paymentAmount,10000000,$(form).find('.amount')) && isValid;
        isValid = util.isNumber(walletId,$(form).find('.wallet-selection')) && isValid;
        isValid = util.isGreaterThanZero(paymentAmount,$(form).find('.amount')) && isValid;

        if(!isValid) return;
        $('.add-income-submit').off();

        let income = {
            "type" : "income",
            "amount" : paymentAmount,
            "transactionInfo" : {
                "note" : note,
                "walletId" : walletId
            }
        }

        $('#spinner').show();
        trasnsactionService.createTransactions(JSON.stringify(income)).then((data)=>{
            $('#spinner').hide();   
            util.handleApiResponse(data,"Income Added ✅ ");
            refreshWalletsPage(); 
        })

        $('.credit-bill-close-btn').click();
        $('.income-model-close-btn').click();
    }

}

function mountCreateAlertForm(walletId){

    console.log(walletId);

    $('.btn-close').click();
    $('#cardAlertModal').modal({ show: false})
    $('#cardAlertModal').modal('show');

    $('.alert-wallet').html("");
    for(let i=0;i<userCardWallets.length;i++){
        $('.alert-wallet').append('<option value='+userCardWallets[i].id+'>'+userCardWallets[i].name+'</option>');
    }
    $('.alert-wallet').val(walletId);

    $('#alert-type').off()
    $('#alert-type').change(()=>{
        let alertType = ($('#alert-type').val());

        if(alertType == "due"){
            $('.limit-alert-form').hide();
            $('.due-alert-form').show();
        }else if(alertType == "limit"){
            $('.limit-alert-form').show();
            $('.due-alert-form').hide();
        }
    })

    $('.submit-alert-creation').off()
    $('.submit-alert-creation').click(()=>{
        let type = ($('#alert-type').val());
        let value = null;
        if(type=="due") value = $('.due-alert-before').val();
        else if(type=="limit") value = $('.limitpercent').val();

        let walletId = $('.alert-wallet').val();
        
        if(isValidAlert()){
            let raw = {
                "type" : type,
                "limitAlertOn" : value,
                "dueAlertBefore" : value
            }
            cardAlertsService.createAlert(walletId,JSON.stringify(raw)).then((data)=>{
                $('.btn-close').click();
                util.handleApiResponse(data,"Alert created successfully","Failed try again...")
                refreshWalletsPage();
            })
        }
    })

    function isValidAlert(){

        return true;
        // return util.isGreaterThanZero( $('.due-alert-before').val(), $('.due-alert-before')) &&
        // util.isGreaterThanZero( $('.due-alert-before').val(), $('.due-alert-before'));
    }


}

