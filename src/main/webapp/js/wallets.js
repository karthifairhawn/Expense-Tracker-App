import * as trasnsactionService from '../apis/transactions.js';
import * as walletService from '../apis/wallets.js';
import * as util from './util.js';




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

let walletUtil = {
    deleteWalletById :  function deleteWalletById(walletId){
        $('#spinner').show();
        walletService.deleteWalletById(walletId).then(()=>{
            $('#spinner').hide();
            console.log('Wallet deleted');
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
            $('#new-wallet-balance').bind('keyup mouseup', function () {
                $('#new-wallet-limit').val($(this).val());            
            });
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
            alert("Invalid wallet information");
            return;
        }
        $('#spinner').show();
        walletService.updateWalletById(walletId,JSON.stringify(wallet)).then((data) => {
            $('.btn-close').click();
            $('#spinner').hide();
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
            console.log(data);
            refreshWalletsPage();
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
        console.log(util.isNotEmpty(walletType,$('#new-wallet-type')),walletType);

        isValid = util.isNotEmpty(acctBalance, $('#new-wallet-balance')) && isValid
        isValid = util.isLessThanN(acctBalance,10000000,$('#new-wallet-balance')) && isValid
        isValid = util.isNumber(acctBalance, $('#new-wallet-balance')) && isValid

        isValid = util.isNotEmpty(walletName,$('#new-wallet-name')) && isValid


        if(newWalletObject.type=='Bank Account'){
            newWalletObject['walletInfo'] = {
                "accountNumber": +($('#new-wallet-accno').val()),
                "ifscCode": $('#new-wallet-ifsc').val(),
            }
            if(util.isNotEmpty(Number($('#new-wallet-accno').val()))){
                isValid = util.isNumber(Number($('#new-wallet-accno').val()),$('#new-wallet-accno')) && isValid
            }
            if(util.isNotEmpty($('#new-wallet-ifsc').val())){
                isValid = util.isIfscCode($('#new-wallet-ifsc').val(),$('#new-wallet-ifsc')) && isValid;
            }

        }else if(newWalletObject.type=='Credit Card'){
            newWalletObject['walletInfo'] = {
                "repayDate" : $('#new-wallet-repay').val(),
                "limit": $('#new-wallet-limit').val()
             }
             isValid = util.isNumber(acctBalance, $('#new-wallet-repay')) && isValid
             isValid = util.isPositiveNumber(acctBalance, $('#new-wallet-repay')) && isValid

             isValid = util.isNumber($('#new-wallet-limit').val(), $('#new-wallet-limit')) && isValid
             isValid = util.isNotEmpty($('#new-wallet-limit').val(), $('#new-wallet-limit')) && isValid

             if($('#new-wallet-limit').val()<acctBalance){
                isValid = false;
                $('#new-wallet-limit').closest('.input-group').after('<span class="text-danger mb-3">Limit cannot be less than the balance.</span>');
             }

        }else if(newWalletObject.type=='Bonus Account'){
            newWalletObject['walletInfo'] = { "note" : $('#new-wallet-bnote').val() }
        }else if(newWalletObject.type=='Other'){
            newWalletObject['walletInfo'] = { "note" : $('#new-wallet-onote').val() }
        }

        

        console.log(newWalletObject);
        if(!isValid) return null;
        return newWalletObject;
    }
    
}


refreshWalletsPage();


async function refreshWalletsPage(){
    userWallets = [];
    userWalletFull = [];
    userCardWallets = [];
    userNonCardWallets = [];
    totalBalance = 0;
    await walletService.findWallets().then((data)=> {
        data = data.data;
        for(const category in data){
            if(category =='Credit Card') userCardWallets.push(...data[category]);
            else userNonCardWallets.push(...data[category]);
            userWallets.push(...data[category]);
        }
        for(let wallet in userWallets){
            let type = (userWallets[wallet].type);
            totalBalance += userWallets[wallet].balance;
        }


    });

    populateBalanceContainer();
    mountWallets();
    $('.add-income-btn').click(()=>{ mountAddIncomeModal() })
    $('.add-wallet-btn').click(()=>{ mountWalletCreationForm() })
    $('.view-income-btn').click(()=>{ mountAllIncomes() })
}

async function mountWallets(){

    // Copy template content to the DOM
    $('#wallets').html('');
    let walletContainer = document.getElementById("wallets");
    let walletContainerTemplate = document.getElementById("wallet-container-header");
    let clone = walletContainerTemplate.content.cloneNode(true);
    walletContainer.appendChild(clone);

    if(userWallets.length==0){
        $('.no-wallet-available').show();
        $('.create-wallet-url').click(()=>{ $('.add-wallet-btn').click(); })
        $('.add-income-btn').hide();
    }

    if(userNonCardWallets==0){
        $('.my-wallets-title').hide();
    }

    if(userCardWallets==0){
        $('.cards-section').hide();
    }


    populateCardWallets();
    populateNonCardWallets(userNonCardWallets);
   
    async function populateCardWallets(){

        let allWallets = userCardWallets;
        let totalCardExpense = 0; 



        for(let i = 0; i < allWallets.length; i++){

            let walletCardClone = $('#credit-card-template')[0].content.cloneNode(true);

            let subInfo =null;
            let wallet = allWallets[i];            
            await walletService.findWalletById(allWallets[i].id).then((data) =>{ userWalletFull.push(data.data); subInfo = data.data.walletInfo; })

            let creditCardUsagePercent = ((subInfo.limit- wallet.balance) / subInfo.limit) * 100;

            const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
            let isDateTOne = false;
            if(subInfo.repayDate=='31'){ isDateTOne = true; }
            const d = new Date();
            let name = month[(d.getMonth()+1)%12];
            let diffDays = '';
            if((d.getMonth()%2==0 && isDateTOne) || !isDateTOne){ diffDays= name+" "+subInfo.repayDate;
            }else if(isDateTOne){ diffDays= month[(d.getMonth()+2)%12]+" 1"; }


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
            $(walletCardClone).find('.card-limit').text(subInfo.limit)
            $(walletCardClone).find('.pay-bill-btn').attr('wallet-id',wallet.id);
            $(walletCardClone).find('.pay-bill-btn').attr('payment', (subInfo.limit- wallet.balance));
            $(walletCardClone).find('.days-left').text(diffDays);
            $(walletCardClone).find('.due-date').text(subInfo.repayDate);
            $(walletCardClone).find('.credit-card-used').text(creditCardUsagePercent.toFixed(2));
            $(walletCardClone).find('.edit-wallet-btn').attr('wallet-id',wallet.id);
            if(creditCardUsagePercent>100){ $(walletCardClone).find('.overdraft-warning').css('display', 'block'); }
            $(walletCardClone).find('.edit-wallet-btn').attr('type',wallet.type);
            $(walletCardClone).find('.edit-wallet-btn').click((event)=> { 
                mountEditWalletForm(event.target.getAttribute('wallet-id'),event.target.getAttribute('type')) 
            });


            $(walletCardClone).find('.delete-wallet-btn').click(function(event) { walletUtil.deleteWalletById(event.target.getAttribute('wallet-id')) })
            $(walletCardClone).find('.pay-bill-btn').click((event)=>{ mountCreditCardBillModal(event) })

            function mountCreditCardBillModal(event){
                if(event.target.getAttribute('payment')=='0'){ $('#creditBillModal').find('.modal-body').html('<h1>No Bills</h1>') }
                $('#creditBillModal').find('.amount').val(event.target.getAttribute('payment'));
                $('#creditBillModal').find('#new-income-wallet').val(wallet.id);
                $('#total-bill').text(event.target.getAttribute('payment'));
                $('#creditBillModal').find('amount').attr('min','1');
                $('#creditBillModal').find('amount').attr('max',event.target.getAttribute('payment'));
            }

            $('#credit-cards').append($(walletCardClone));
            totalCardExpense +=subInfo.limit - wallet.balance;

             
        }


        $('.card-used-amount').text(totalCardExpense);
        $('.pay-bill-btn').click(()=>{ mountAddIncomeModal() })


        // ----------------------   Card Animation Handlers    ---------------------

        let totalWidth = $('.credit-cards')[0].scrollWidth;
        let containerWidth = $('.credit-cards').width();
        if(totalWidth==containerWidth) $(".card-sc-right").hide();

        function moveCreditCardLeft(){
            $('.card-sc-right').css('display', 'flex');
                
            $('.credit-cards').animate({scrollLeft:  ($('.credit-cards').scrollLeft() - 400) }, 300);
        
            if($('.credit-cards').scrollLeft()==0){
                $('.card-sc-left').css('display', 'none');
            }
        }

        function moveCreditCardRight(){
            $('.credit-cards').animate({scrollLeft:  ($('.credit-cards').scrollLeft() + 400) }, 300);
            
            let totalWidth =  $('.credit-cards')[0].scrollWidth - $('.credit-cards').width() ;
            let occuredWidth =  $('.credit-cards').scrollLeft();

            if(totalWidth==occuredWidth){ $(".card-sc-right").hide(); }

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
            await walletService.findWalletById(+(wallet.id)).then((data)=>{
                
                userWalletFull.push(data.data);
                data = data.data.walletInfo;
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


                    if(obj=='accountNumber'){
                        key = 'Account';
                        if(data[obj]=='0') data[obj] = "not specified";
                    }
                    if(obj=='ifscCode'){
                        key = 'IFSC';
                        if(data[obj]=='') data[obj] = "not specified";

                    }

                    if(obj!='note'){
                        subWalletInfoHtml +='<div class="uncommon-wallet-field mb-2"><div class="ucf-key">'+key+' :</div><div class="ucf-value">'+data[obj]+'</div></div>';
                    }else{
                        subWalletInfoHtml +='<div class="uncommon-wallet-field mb-2"><div class="ucf-value">'+data[obj]+'</div></div>';
                    }


                    $(newWalletInfo).find('.label').text(key);   
                    $(newWalletInfo).find('.value').text(data[obj]);   
                    $(formWalletInfo).append(newWalletInfo);

                }

                $(walletCardClone).find('#walletInfoModal'+wallet.id+' .modal-body').append(formWalletInfo);
                $(walletCardClone).find('.uncommon-wallet-fields').append(subWalletInfoHtml);
                
            })

            $(walletCardClone).find('.delete-wallet-btn').click(function(event) { walletUtil.deleteWalletById(event.target.getAttribute('wallet-id')) })


            $('#all-wallets-container').append(walletCardClone);

        }
        
        walletContainer.appendChild(newWalletSection[0]); 

    }


}

function populateBalanceContainer(){
    let balanceContainer = document.getElementById('balance-container').content.cloneNode(true);
    $(balanceContainer).find('#total-acct-count').text(userWallets.length);
    $(balanceContainer).find('#mi-bal-amount').text(util.moneyFormat(totalBalance));
    $('#balance-header').html('');
    $('#balance-header').append(balanceContainer);
}

function mountAddIncomeModal(){
    console.log('mountAddIncomeModal');
    let walletSelection = $('#incomeModal').find('.wallet-selection');

    $('#incomeModal').find('.wallet-selection').html('');
    $('.add-income-submit').click((event)=>{ submitIncome(event)})

    if(userNonCardWallets==0){
        $('#incomeModal').find('.modal-body').html('<h3>No wallets found to add income</h3>')
    }
    for(let i=0;i<userNonCardWallets.length;i++){
        walletSelection.append('<option value='+userWallets[i].id+'>'+userWallets[i].name+'</option>');
    }

    function submitIncome(event){
        
        let form = $(event.target).closest('.create-expense-form');
        let paymentAmount = +($(form).find('.amount').val());
        let note = $(form).find('.note').val();
        let walletId =  +($(form).find('.wallet-selection').val());

        let isValid = true;
        isValid = util.isNumber(paymentAmount,$(form).find('.amount')) && isValid;
        isValid = util.isNotEmpty(paymentAmount,$(form).find('.amount')) && isValid;
        isValid = util.isLessThanN(paymentAmount,10000000,$(form).find('.amount')) && isValid;
        isValid = util.isNumber(walletId,$(form).find('.wallet-selection')) && isValid;

        console.log(isValid);
        if(!isValid) return;

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
            refreshWalletsPage(); 
        })

        $('.credit-bill-close-btn').click();
        $('.income-model-close-btn').click();
    }

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


    let start = allDateRanges['This Month'][0];
    let end = allDateRanges['This Month'][1];

    start = start.format('YYYYMMDD').split('-').join('');
    end = end.add(1,'days').format('YYYYMMDD').split('-').join('');

    let incomeData = null;
    await trasnsactionService.findTransactions(start,end,'incomes').then((data)=>incomeData = data.data.incomes);

    $('#allIncomes .income-table-view .tbody').html('');

    console.log(incomeData.length);
    
    for(let i = 0; i < incomeData.length; i++){
        let newRow = $('<tr> <th scope="row" class="wallet">1</th> <td class="time">Mark</td> <td class="amount">Otto</td> <td class="note">@mdo</td> </tr>');

        let walletInfo = null;
        let walletId = incomeData[i]['transactionInfo']['walletId'];

        for(let wallet of userWallets){
            if(wallet.id == walletId){
                walletInfo = wallet;
            }
        }


        if(incomeData[i]['transactionInfo']['note']==''){
            incomeData[i]['transactionInfo']['note'] = "-"
        }
        newRow.find('.note').text(incomeData[i]['transactionInfo']['note']);
        newRow.find('.time').text(incomeData[i]['timestamp']);
        newRow.find('.wallet').text((walletInfo.name));
        newRow.find('.amount').text(incomeData[i]['amount']+" ₹");

        $('.income-table-view .tbody').append(newRow);
    }

    if(incomeData.length==0){
        $('.income-table-view .tbody').append('<h3>No Income Transactions</h3>');
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
        $('.ce-wallet-model').find('#new-wallet-balance').closest('.input-group').css('height', '0px');
        $('.ce-wallet-model').find('#new-wallet-balance').closest('.input-group').css('overflow', 'hidden');
        $('.ce-wallet-model').find('#new-wallet-limit').val(editingWallet.walletInfo.limit);
        $('.ce-wallet-model').find('#new-wallet-repay').val(editingWallet.walletInfo.repayDate);
    }else if(type=='Bank Account'){
        $('.ce-wallet-model').find('#new-wallet-accno').val(editingWallet.walletInfo.limit);
        $('.ce-wallet-model').find('#new-wallet-ifsc').val(editingWallet.walletInfo.repayDate);
    }else if(type=='Bonus Account'){
        $('.ce-wallet-model').find('#new-wallet-bnote').val(editingWallet.walletInfo.note);
    }else if(type=='Others'){
        $('.ce-wallet-model').find('#new-wallet-onote').val(editingWallet.walletInfo.note);
    }

    editingWallet.repayDate = parseInt(editingWallet.repayDate);
    $('.edit-wallet-submit-btn').click(()=> { walletFormUtil.editWalletSubmissionHandler(walletId,type) });

}

