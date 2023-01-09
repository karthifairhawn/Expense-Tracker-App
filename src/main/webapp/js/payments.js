import * as utils from './util.js';
import {findTransactions,findTransactionsById,createTransactions,deleteTransactionsById,updateTransactionsById, findTransactionsPaginated} from '../apis/transactions.js';
import * as paymentsService from '../apis/rpayements.js';

let userCardWallets = [];
let userNonCardWallets = [];

let userTags = null;
let userTagsMap = {};

let userCategories = null;
let userCategoriesMap = {};

let userWallets = [];
let userWalletsMap = {};

var formSelectedTags = [];  
let totalWalletSplits = 1;
let usingNewCategory = false;
let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
let expenseFormUtil = utils.expenseFormUtil;

let allRecurringPayments = null;
let upcomingPayments = [];

$(document).ready(()=>{
    $('#spinner').show();
    runner();

    setTimeout(() => {        
        $('#spinner').hide();
    }, 300);
})

async function runner(){

    $('#tab-B')[0]
    $('#create-rp').off();
    $('#create-rp').click(()=>{

        let container = $('#newRPayment .modal-content');
        $('#newRPayment .modal-content').html("");
       let cloner = $('#tt-newrpform')[0].content.cloneNode(true);
       $(container)[0].appendChild(cloner);

        expenseFormUtil.listWalletsInForm();

        $('#newRPayment').modal({ show: 'false' }); 
        $('#newRPayment').modal('show');
        $('#rpweek-date').hide();

        $('#rpyament-occur').off();
        $('#rpayment-occur').change((e)=>{
            let value  = $(e.target).val();
            if(value == 'monthly'){
                $('#rpmonth-date').show();
                $('#rpweek-date').hide();
            }else if(value == 'weekly'){
                $('#rpmonth-date').hide();
                $('#rpweek-date').show();
            }else{
                $('#rpmonth-date').hide();
                $('#rpweek-date').hide();
            }
        })

        $('#save-rpayemnt').off();
        $('#save-rpayemnt').click(()=>{ 
            saveRpayment(); 
        });
    })
        
    await utils.findBasicEntities();
    paymentsService.findRecPayments().then((data)=>{
        allRecurringPayments = [];
        upcomingPayments = [];
        allRecurringPayments = data.data;
        if(allRecurringPayments.length == 0){
            $('#tab-A')[0].click();
            $('#tab-B').hide();
            $('#tab-C').hide();
        }else{
            $('#tab-B').show();
            $('#tab-C').show();
        }
        populateRecurringPayments("rp-container");
        populateRecurringPendingPayments("rpp-container");
        populateRecurringUpcomingPayments("rup-container");
        activateListeners();
    })

}


function populateRecurringPayments(containerId){
    let container = $('#'+containerId);
    $(container).html("");

    if(allRecurringPayments.length == 0){
        $(container).html('<div class="card-body rpayments mt-4 d-flex flex-column align-items-center justify-content-center"> <img class="rp-alert-img" src="https://makecommerce.net/wp-content/uploads/2022/04/One-klick-payments_500w_Global@2x.png"> <h4>Add recurring payments, Get notified and Pay bills in time.</h4><span class="url btn btn-primary btn-lg" onclick="$(`#create-rp`).click();"> Create Now</span> </div>');
        $('#create-rp').hide();
    }
    for(let i = 0; i < allRecurringPayments.length; i++){
        
        let elementCard = $('#tt-rec-payments')[0].content.cloneNode(true);
        let wallet = (allRecurringPayments[i].walletId==-1 || allRecurringPayments[i].walletId==null) ? 'N/A' : allRecurringPayments[i].walletId;
        let timespan = allRecurringPayments[i].amount>0 ? utils.moneyFormat(allRecurringPayments[i].amount)+" / " : "";
        if(allRecurringPayments[i].occur.split('-').length>1){ // length will be one for daily
            timespan = timespan +" "+ utils.capitalizeFirstLetter(allRecurringPayments[i].occur.split('-')[0])  +"  "+ allRecurringPayments[i].occur.split('-')[1]+ (allRecurringPayments[i].occur.split('-')[1]=='1' ? "st" :"th");
        }else{
            timespan = "Daily"
        }

        let endsOn = ( allRecurringPayments[i].endBy==-1 ||  allRecurringPayments[i].endBy=="null" ) ? "N/A" : allRecurringPayments[i].endBy;
        // endsOn = moment(endsOn.substring()).format("MMM d, YYYY");

        let endsOnDateFor = new Date(Number(endsOn));
        endsOn = moment(endsOnDateFor);
        endsOn = endsOn.format("MMM D, YYYY")

        $(elementCard).find('.title').text(allRecurringPayments[i].name);
        $(elementCard).find('.type').text(allRecurringPayments[i].type);
        $(elementCard).find('.wallet').text(getWalletNameById(wallet));
        $(elementCard).find('.timespan').text(timespan);
        if(endsOn=="Invalid date") endsOn = "N/A"
        $(elementCard).find('.dueend').text(endsOn);
        $(elementCard).find('.edit-rp').attr('rp-id',allRecurringPayments[i].id);
        $(elementCard).find('.delete-rp').attr('rp-id',allRecurringPayments[i].id);
        $(container)[0].appendChild(elementCard);
    }
}

function populateRecurringPendingPayments(containerId){

    let container = $('#'+containerId);
    $(container).html("");

    let pendingPayments = getPendingPayments();
    if(pendingPayments.length > 0){
        $('#tab-B')[0].click();
    }else if(allRecurringPayments!=0){
        $('#tab-C')[0].click();
    }

    if(pendingPayments.length == 0){
        $(container).html('<div class="card-body rpayments mt-4 d-flex align-items-center justify-content-center"> <h6>No Pending Payments.</h6> </div>');
        
        return;
    }

    for(let i = 0; i < pendingPayments.length; i++){
       
        let elementCard = $('#tt-recp-payments')[0].content.cloneNode(true);
        let wallet = pendingPayments[i].walletId==-1 ? 'N/A' : userWallets[pendingPayments[i].walletId].name;
        let timespan = pendingPayments[i].amount>0 ? utils.moneyFormat(pendingPayments[i].amount) : "occurs  ";
        timespan = timespan +" "+pendingPayments[i].occur.split('-')[0] + pendingPayments[i].occur.split('-')[1]+"th";

        let endsOn = pendingPayments[i].endBy==-1 ? "N/A" : pendingPayments[i].endBy;
        
        let timeleft = null; 

        let payingDate = null;
        if(pendingPayments[i].occur.split('-')[0]=='weekly'){
            payingDate = moment().day(pendingPayments[i].occur.split("-")[1]-1);
        }else if(pendingPayments[i].occur.split('-')[0]=='monthly'){

            let currentDay = new Date().getDate();
            let mentionedPayDate = allRecurringPayments[i].occur.split("-")[1];

            if(currentDay>mentionedPayDate){
                payingDate = moment(new Date().setDate(payingDate))
            }else{
                payingDate =  allRecurringPayments[i].occur.split("-")[1]<=moment().subtract(1, 'months').endOf('month').format('D') ? allRecurringPayments[i].occur.split("-")[1] :  moment().endOf('month').format('D'); 
                let prevMonth = new Date(new Date().setMonth(new Date().getMonth()-1));
                payingDate = moment(prevMonth.setDate(payingDate))
            }

            // to get pay day number eg: 27,31,1,2
            
            



        }else{
            payingDate = moment();
        }

        if(payingDate<moment()){
            timeleft= - (payingDate.diff(moment(),'days'));
            if(timeleft==1) timeleft+= ' day overdue.';
            else timeleft+= ' days overdue.';
        }

        let warningType= "";
        if((payingDate.diff(moment(),'days'))<-5){
            warningType="text-danger";
        }else if((payingDate.diff(moment(),'days'))<0){
            warningType="text-warning";
        }

        if(pendingPayments[i].occur.split('-')[0]=='daily') timeleft= 'Today';

        $(elementCard).find('.title').text(pendingPayments[i].name);
        $(elementCard).find('.type').text(pendingPayments[i].type);
        $(elementCard).find('.amount').text(pendingPayments[i].amount==-1 ? 'N/A' : utils.moneyFormat(pendingPayments[i].amount));
        $(elementCard).find('.wallet').text(wallet);
        $(elementCard).find('.timespan').text(timespan);
        $(elementCard).find('.timeleft').text(timeleft);
        $(elementCard).find('.timeleft').addClass(warningType);
        $(elementCard).find('.rpp-complete').attr('rp-id',pendingPayments[i].id);
        $(container)[0].appendChild(elementCard);
    }
}

function populateRecurringUpcomingPayments(containerId){
    let container = $('#'+containerId);
    $(container).empty();

    

    let payDateOfElement = [];
    let payElement = [];

    upcomingPayments = getUpcomingPayments();

    if(upcomingPayments.length == 0){
        $(container).html('<div class="card-body rpayments mt-4 d-flex align-items-center justify-content-center"> <h6>No Upcoming Payments.</h6> </div>');
        return;
    }
    // create dom element of payments
    for(let i = 0; i < upcomingPayments.length; i++){
        let elementCard = $('#tt-recu-payments')[0].content.cloneNode(true);
        let wallet = getWalletNameById(upcomingPayments[i].walletId);
        let timespan = upcomingPayments[i].amount>0 ? utils.moneyFormat(upcomingPayments[i].amount) : "occurs  ";
        timespan = timespan +" "+upcomingPayments[i].occur.split('-')[0] +"  "+ upcomingPayments[i].occur.split('-')[1]+"th";

        
        let timeleft = null; 

        let payingDate = null;
        if(upcomingPayments[i].occur.split('-')[0]=='weekly'){
            const dayOfWeek = ["sun","mon","tue","wed","thu","fri","sat"]
            payingDate = getNextDayOfTheWeek(dayOfWeek[upcomingPayments[i].occur.split("-")[1]-1])
            payingDate = moment(payingDate.getTime())
        }else{
            payingDate = upcomingPayments[i].occur.split("-")[1];

            let currentDay = new Date().getDate();
            
            if(payingDate>currentDay){
                payingDate = new Date().setDate(payingDate);
                payingDate = moment(payingDate);
            }else{
                let nextMonth = new Date().getMonth()+1;
                let payDatee = new Date(new Date().setMonth(nextMonth)); 
                payingDate = moment(payDatee.setDate(payingDate))
            }


        }

        timeleft=(payingDate.diff(moment(),'days'));

        let timeleftNumber = timeleft;
        if(upcomingPayments[i].occur.split('-')[0]=='daily') timeleftNumber= 1;
        
        if(timeleft==1 || timeleft==0) timeleft= 'Tomorrow.';
        else timeleft+= ' days.';
    

        let warningType= "text-primary";

        if(upcomingPayments[i].occur.split('-')[0]=='daily') timeleft= 'Tomorrow';

        $(elementCard).find('.title').text(upcomingPayments[i].name);
        $(elementCard).find('.type').text(upcomingPayments[i].type);
        $(elementCard).find('.amount').text((upcomingPayments[i].amount==-1 || upcomingPayments[i].amount==0) ? '₹ N/A' : utils.moneyFormat(upcomingPayments[i].amount));
        $(elementCard).find('.wallet').text(wallet);
        $(elementCard).find('.timespan').text(timespan);
        $(elementCard).find('.timeleft').text(timeleft);
        $(elementCard).find('.timeleft').addClass(warningType);

        payDateOfElement.push(timeleftNumber);
        payElement.push(elementCard);
        // $(container)[0].appendChild(elementCard);
    }
    
    // bubble sort
    for(let i=0; i<payDateOfElement.length; i++){
        for(let j=i+1; j<payDateOfElement.length; j++){
            if(payDateOfElement[i] > payDateOfElement[j]){
                let temp = payDateOfElement[i];             let temp2 = payElement[i];
                payDateOfElement[i] = payDateOfElement[j];  payElement[i] = payElement[j];
                payDateOfElement[j] = temp;                 payElement[j] = temp2;
            }
        }
    }

    // Append sorted element to dom
    for(let i=0;i<payElement.length;i++){
        $(container)[0].appendChild(payElement[i]);
    }
    
}


function getPendingPayments(){
    let pendingPayments = [];
    for(let i = 0; i < allRecurringPayments.length; i++){

        let added = false;
        if((allRecurringPayments[i].occur.includes('weekly')) && !(moment(allRecurringPayments[i].lastPaid).isSame(new Date(),'week'))){

            let payingDay = moment().day(allRecurringPayments[i].occur.split("-")[1]-1);
            if(payingDay.isBefore(new Date)){
                pendingPayments.push(allRecurringPayments[i]);
                added = true;
            }
        }else if((allRecurringPayments[i].occur.includes('monthly')) && !moment(allRecurringPayments[i].lastPaid).isSame(new Date(),'month')){
            let payingDay =  allRecurringPayments[i].occur.split("-")[1]<=moment().endOf('month').format('D') ? allRecurringPayments[i].occur.split("-")[1] :  moment().endOf('month').format('D');
            
            let prevMonth = new Date().getMonth()-1;
            prevMonth = new Date(new Date().setMonth(prevMonth));
            payingDay = moment(prevMonth.setDate(payingDay))

            if(moment()>=moment(payingDay)){
                pendingPayments.push(allRecurringPayments[i]);
                added = true;
            }
        }else if((allRecurringPayments[i].occur.includes('daily')) && !(moment(allRecurringPayments[i].lastPaid).isSame(new Date(),'day'))){
            pendingPayments.push(allRecurringPayments[i]);
            added = true;
        }
        
        if(!added){
            upcomingPayments.push(allRecurringPayments[i]); 
        }

    }
    return pendingPayments;
}

function getUpcomingPayments(){

    return upcomingPayments;
}

function activateListeners(){
    $('.rpp-complete').click((e)=>{
        let rpId = $(e.target).attr('rp-id')
        let rpRaw = (getPaymentById(rpId));
        mountPaymentCreateForm(rpRaw);
    })

    $('.edit-rp').click((e)=>{

        let container = $('#newRPayment .modal-content');
        $('#newRPayment .modal-content').html("");
       let cloner = $('#tt-newrpform')[0].content.cloneNode(true);
       $(container)[0].appendChild(cloner);

        let rpId = $(e.target).attr('rp-id');
        $('#newRPayment').modal({ show: 'false' }); 
        $('#newRPayment').modal('show');
        $('#newRPayment').find('.modal-title').text('Edit Payment');

        // find reucrring payments
        let rpRaw = (getPaymentById(rpId));
        utils.expenseFormUtil.listWalletsInForm();

        $('#rpayment-name').val(rpRaw.name);
        $('#rpayment-type').val(rpRaw.type);
        $('#rpayment-amount').val(rpRaw.amount==-1 ? null : rpRaw.amount);
        $('#rpayment-wallet').val(rpRaw.wallet>0 ? rpRaw.amount : "-1");
        let mss = rpRaw.endBy.replace("c","")+""
        let timee = moment(+mss);
        $('#rpayment-endson').val(timee.format("YYYY-MM-DD"));
        

        $('#rpayment-occur').off();
        $('#rpayment-occur').change((e)=>{
            let value  = $(e.target).val();
            if(value == 'monthly'){
                $('#rpmonth-date').show();
                $('#rpweek-date').hide();
            }else if(value == 'weekly'){
                $('#rpmonth-date').hide();
                $('#rpweek-date').show();
            }else{
                $('#rpmonth-date').hide();
                $('#rpweek-date').hide();
            }
        })

        let occurTime = rpRaw.occur.split("-")[0];
        let occurOn = rpRaw.occur.split("-")[1];
        $('#rpayment-occur').val(occurTime.toLowerCase());

        if(occurTime == 'monthly'){
            $('#rpmonth-date').show();
            $('#rpmonth-date').val(occurOn);
            $('#rpweek-date').hide();
        }else if(occurTime == 'weekly'){
            $('#rpmonth-date').hide();
            $('#rpweek-date').show();
            $('#rpweek-date').val(occurOn);
        }else{
            $('#rpmonth-date').hide();
            $('#rpweek-date').hide();
        }

        $('#save-rpayemnt').attr('id','update-rpayment');
        $('#update-rpayment').attr('rp-id',rpId);
        $('#update-rpayment').text('Update')
        $('#update-rpayment').off();
        $('#update-rpayment').click((e)=>{
            let rpId = $(e.target).attr('rp-id');
            let newRpRaw = {};

            newRpRaw.amount = $('#rpayment-amount').val()>0  ? $('#rpayment-amount').val() : 0;
            newRpRaw.name = $('#rpayment-name').val();
            newRpRaw.occur = $('#rpayment-occur').val();
            console.log(newRpRaw.occur)
            if(newRpRaw.occur=='monthly'){
                newRpRaw.occur+="-"+$('#rpmonth-date').val();
            }else if(newRpRaw.occur=='weekly'){
                newRpRaw.occur+="-"+$('#rpweek-date').val();
            }
        
            newRpRaw.type = $('#payment-type').val();
            newRpRaw.lastPaid = new Date().getTime();
            newRpRaw.walletId = $('#rpayment-wallet').val();
            newRpRaw.endBy = new Date($('#rpayment-endson').val()).getTime();

            paymentsService.UpdateRecPaymentById(rpId, JSON.stringify(newRpRaw)).then((data)=>{
                utils.handleApiResponse(data,"Creation Success");
                $('.btn-close').click();
                runner();
            })
        })
    }); 


    $('.delete-rp').click((e)=>{
        paymentsService.deleteRecPaymentById($(e.target).attr('rp-id')).then((data)=>{
            utils.handleApiResponse(data,"Deletion Success","Delete Failed, Try again...");
            $(e.target).closest(".rpayments").remove();
        });
    })
}

function getPaymentById(id){
    for(let i = 0; i < allRecurringPayments.length; i++){
        if(allRecurringPayments[i].id == id){
            return allRecurringPayments[i];
        }
    }
    return null;
}

function getNextDayOfTheWeek(dayName, excludeToday = true, refDate = new Date()) {
    const dayOfWeek = ["sun","mon","tue","wed","thu","fri","sat"]
                      .indexOf(dayName.slice(0,3).toLowerCase());
    if (dayOfWeek < 0) return;
    refDate.setHours(0,0,0,0);
    refDate.setDate(refDate.getDate() + +!!excludeToday + 
                    (dayOfWeek + 7 - refDate.getDay() - +!!excludeToday) % 7);
    return refDate;
}

function markPaymentAsPaidById(id,rpRaw){
    rpRaw.lastPaid = new Date().getTime();
    paymentsService.UpdateRecPaymentById(id,JSON.stringify(rpRaw)).then((data)=>{
        utils.handleApiResponse(data,"Status Updated","Update Failed.")
        runner();
    })
}

function mountPaymentCreateForm(rpRaw){

    let container = $('#newRPayment .modal-content');
     $('#newRPayment .modal-content').html("");
    let cloner = $('#tt-newrpform')[0].content.cloneNode(true);
    $(container)[0].appendChild(cloner);

    totalWalletSplits=1;

    let currTime = moment().format('YYYY-MM-DD HH:mm').split(" ").join("T");

    
    expenseFormUtil.listWalletsInForm();
    expenseFormUtil.listCategoriesInForm()
    expenseFormUtil.listTagsInForm();
    expenseFormUtil.setDateTimeInForm(currTime);    // Set current time initially
    $('#expense-name').val(rpRaw.name)
    $('#expense-amount').val(rpRaw.amount==-1 ? 0 : rpRaw.amount)
    $('#split-wallet').click(()=>expenseFormUtil.splitWalletHandler())       // Split expense ampunt 
    $('#expense-more').click(()=>extendForm());             // Extend the expense creation form      
    $('#save-expense-btn').off();
    $('#save-expense-btn').click(()=>createNewExpense());   // Save Handler
    

    async function createNewExpense(e){

        let totalAmount = 0;
        let reason = $('#expense-name').val();
        let spendOn = moment().format('MMM D, YYYY, h:mm:ss a');
        let userSpendOn = $('#expense-time').val();
        let categoryId = $('#all-categories-options').val();
        let note = $('#expense-note').val();


        let tagInfo = [];
        for(let i = 0; i < formSelectedTags.length; i++) tagInfo.push(+(formSelectedTags[i]));
        

        
        // Setting todays date for spend on date
        if(userSpendOn.length>0){

            let time =  userSpendOn.split("T")[1];
            userSpendOn = new Date(userSpendOn);

            const year = userSpendOn.getFullYear(); // 2017
            const month = userSpendOn.getMonth(); // 11
            const dayOfMonth = userSpendOn.getDate(); // 7


            userSpendOn = months[month]+" "+dayOfMonth+", "+year+", "+utils.to12Format(time+":03");
            spendOn = userSpendOn;
            
        }

        let walletSplits ={};
        let allWalletSplitValues = $('#newRecord .w-split');

        for(let k=0; k<allWalletSplitValues.length; k++){
            let amount = $(allWalletSplitValues[k]).find('#expense-amount').val();
            let walletId = $(allWalletSplitValues[k]).find('.form-wallet-list').val();
            if(walletId==undefined) walletId = -100; // -100 indicates no wallte entity
            if(amount == 0 ) continue;
            if(walletSplits[walletId]>0){
                walletSplits[walletId]+= +amount;
            }else{
                walletSplits[walletId]= +amount;
            }
            totalAmount+= (+amount);
        }

        

        // Expense info json
        let expenseInfo = {
            "type" : "expense",
            "amount" : +totalAmount,
            "walletSplits" : walletSplits,
            "transactionInfo" : {
                "spendOn" : spendOn,
                "categoryId" : +categoryId,
                "reason" : reason,
                "note" : note,
                "tagId" : tagInfo
            }
        }

        // Validate the new expense json
        if(expenseFormUtil.validateExpenseInfo(expenseInfo)){
            let categoryCreated = true;
            if(usingNewCategory==true) expenseInfo.transactionInfo.categoryId = await expenseFormUtil.createNewCategory();            
            if(categoryCreated) createExpenseApiCall(expenseInfo);
        }   

        // Create expense API call to the server
        async function createExpenseApiCall(expenseInfoo){
            $('#save-expense-btn').off()
            expenseInfoo = JSON.stringify(expenseInfoo)
            $('#spinner').css('display','block');
            await  createTransactions(expenseInfoo).then((data)=> {
                $('#newRecord .btn-close').click();
                $('#spinner').css('display','none');
                utils.handleApiResponse(data,"Expense Created ✅ ");
                // commonService.fetchNotifications();
                markPaymentAsPaidById(rpRaw.id,rpRaw);
            })

        }

    }

    function extendForm(){
        $('.more-expense-info').css('display', 'block');
        $('#expense-more').css('display', 'none');
    }


    $('#newRecord').modal({ show: 'false' }); 
    $('#newRecord').modal('show');
}

function saveRpayment(){

    let newRpRaw = {};

    newRpRaw.amount = $('#rpayment-amount').val()
    newRpRaw.amount = newRpRaw.amount.length==0 ? 0 : newRpRaw.amount;

    newRpRaw.name = $('#rpayment-name').val();
    newRpRaw.occur = $('#rpayment-occur').val();

    if(newRpRaw.occur=='monthly'){
        newRpRaw.occur+="-"+$('#rpmonth-date').val();
    }else if(newRpRaw.occur=='weekly'){
        newRpRaw.occur+="-"+$('#rpweek-date').val();
    }

    newRpRaw.type = $('#payment-type').val();
    newRpRaw.lastPaid = new Date().getTime();
    newRpRaw.walletId = $('#rpayment-wallet').val();
    newRpRaw.endBy = new Date($('#rpayment-endson').val()).getTime();
    if(isValidRecPayment(newRpRaw)){
        paymentsService.createRecPayment(JSON.stringify(newRpRaw)).then((data)=>{
            utils.handleApiResponse(data,"Creation Success","Failed try again...");
            $('.btn-close').click();
            runner();
        })
    }else{
        utils.handleApiResponse({statusCode:400},"","Please all required data.");
    }

    function isValidRecPayment(newRpRaw){
        // console.log(utils.isNumber(newRpRaw.endBy,$('#rpayment-endson').val()))
        console.log(newRpRaw.endBy);
        // return utils.isGreaterThanZero(newRpRaw.amount,$('#rpayment-amount')) &&
        return utils.isNotEmpty(newRpRaw.name,$('#rpayment-name')) 
        // utils.isNumber(newRpRaw.endBy,$('#rpayment-endson'));
    }

}

function getWalletNameById(id){
    userWallets = utils.userWallets;
    let walletName = '';
    for(let k=0; k<userWallets.length; k++){
        if(userWallets[k].id == id){
            walletName = userWallets[k].name;
            break;
        }
    }
    if(walletName.length==0) walletName='N/A'
    return walletName;
}