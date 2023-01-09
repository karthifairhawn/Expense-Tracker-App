import {findTransactions,findTransactionsById,createTransactions,deleteTransactionsById,updateTransactionsById, findTransactionsPaginated} from '../apis/transactions.js';
import {findWalletById, findWallets} from '../apis/wallets.js';
import {findTags,createTag,deleteTagById, findTagById} from '../apis/tags.js';
import {findCategories,createCategory,deleteCategoryById, findCategoryById} from '../apis/categories.js';

import * as util from './util.js';
import * as commonService from './common.js';

// Mount Dashboard by default
var currTimeSpan = JSON.parse(localStorage.getItem('config'))==null ? 'Recent' : JSON.parse(localStorage.getItem('config')).defaultView;
let isBannerListenerInitialized = false;
let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
let colorTwo = ['99b8cc','cc7aa3','85cc70','99ff66','a3f5f5','9999f5','ada399','ffd6ff','f5b87a','fadbbd','99b8cc'];
let colorOne = ['ccdbe6','e6bdd1','c2e6b8','ccffb3','d1fafa','ccccfa','d6d1cc','ffebff','fadbbd','c2c2d1','ccdbe6'];
let isMonthlyViewOverriden = false; 


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

let dateRangeContainer = document.getElementById("date-range-selector");
let dateRangeElement = document.getElementById("date-range-template");
let clone = dateRangeElement.content.cloneNode(true);
let pageNumber = 1;
let pageSize = 15;
$(dateRangeContainer).html('');
dateRangeContainer.appendChild(clone);  

// Hide monthly view section by default   
let listingExpenseDate = null;
let daysTotalExpense = 0;
let daysExpenseCount = 0
let rangeExpense =0;
let calendarMounted = false;
let weeklyTabInitialized = false;  

let previousExpenseFetch = {
    "expenseFrom" : null,
    "expenseTo" : null,
    "timeSpan" : null,
    "refreshExpenseContainer" : null,
    "containerId" : null,

    "expenseData" : null
}

let expenseFormUtil = {
    
    listWalletsInForm : async function listWalletsInForm(expenseId){

        let allOptions = '';       
        if(userWallets.length==0){
            $('#split-wallet').remove();
            // $('.wallet-name-section').html('<span class="nr-no-wallet-ind d-flex align-items-center"><i class="fas fa-exclamation-triangle"></i>No Wallet Found</span>');
        }

        for(let i=0;i<userWallets.length;i++){
            let overdraft = "";
            if(userWallets[i].balance<0) overdraft = "(overdraft)";
            let option = '<option value="'+userWallets[i].id+'" >'+userWallets[i].name+overdraft+'</option>';
            allOptions+=(option);
        }
        allOptions += '<option value="-100"> &#xf555; N/A </option>';
        if(userWallets.length==0){
            $('#all-wallets-options').attr("disabled", true);
            $('#all-wallets-options').after('<span style="position:absolute" class="text-secondary">You can create a new wallet in <a href="wallets.html" class="url">wallets page.</a> </span>');
        }
        $('#all-wallets-options').html(allOptions);

    },

    listCategoriesInForm : async function listCategoriesInForm(expenseId){

        let allCategories = userCategories;
        let allCategoriesHTML = '';
        allCategoriesHTML+='<option ico="f219" value="0">General Expense</option>';
        for(let i=0;i<allCategories.length;i++){
            allCategoriesHTML+='<option class="category-list-option" ico="'+allCategories[i].imagePath+'" value="'+allCategories[i].id+'">'+allCategories[i].name+'</option>'
        }
        allCategoriesHTML+='<option ico="create-cat" class="create-category-option">+ create new category</option>'; // Addition icon to use for category creation
        $('#all-categories-options').html(allCategoriesHTML);

        // Set Icon of selected option to left of option sleection
        let icon = $('#all-categories-options option:selected').attr('ico');
        $('#form-category-icon').html('<span class="create-category-ico" >&#x'+icon+'</span>')

        // Category change handler
        $('#all-categories-options').change((event)=>{
            let icon = $('option:selected', event.target).attr('ico');
            if(icon=='create-cat'){ 
                usingNewCategory = true;
                $('#category-label').text('Create Category');
                $('#all-categories-options').hide();  
                $('#create-category-btn').hide();
                $('#new-category-input').css('display','block');
                $('#new-category-ico').css('display','flex');
                $('#new-category-icon').css('display','block');
                $('#form-category-icon').hide();
                let allIcons = ['f2b9','f042','f5d0','f461','f0f9','f13d','f5d1','f558','f559','f77c','f77d','f666','f462','f434','f236','f0fc','f0f3','f84a','f6b6','f0e7','f5d7','f55c','f5da','f469','f519','f55d','f207','f55e','f6bb','f786','f55f','f46b','f1b9','f787','f217','f788','f6be','f0a3','f6c0','f51b','f51c','f5e7','f1fe','f080','f201','f200','f00c','f058','f4b8','f09d','f520','f521','f1c0','f108','f655','f470','f6d3','f044','f7fb','f052','e005','f52d','f0fb','f574','f1c8','f1c2','f575','f576','f008','f0b0','f577','f06d','f7e4','f134','f479','f578','f6de','f024','f11e','f74d','f0c3','f579','f11b','f52f','f0e3','f3a5','f22d','f6e2','f06b','f79c','f79f','f000','f57b','f7a0','f530','f0ac','f57c','f57d','f57e','f7a2','f450','f664','f19d','f7a6','f6e3','f665','f4bd','f4be','e05c','f258','f8c0','f8c1','f6e8','f025','f58f','f590','f004','f591','f6ec','f6ed','f1da','f453','f7aa','f015','f6f0','f7ab','f0f8','f47d','f47e','f80d','f593','f80f','f594','e065','f6f2','f246','f810','f7ad','f86d','f2c1','f2c2','f47f','f7ae','f03e','f302','f01c','f275','f534','f129','f05a','f033','f669','f595','f66a','f66b','f084','f11c','f66d','f596','f597','f598','f535','f66f','f1ab','f109','f5fc','e066','f812','f599','f59a','f59b','f59c','f5fd','f06c','f094','f536','f537','f3be','f3bf','f1cd','f0eb','f0c1','f195','f022','f124','f023','f3c1','f309','f30a','f30b','f30c','f2a8','f59d','f604','e067','f0d0','f076','f674','f183','f6fc','f8cc','f245','f7b6','f001','f6ff','f22c','f1ea','f53e','f481','f247','f248','f613','f679','f700','f03b','f815','f1fc','f5aa','f53f','f482','f1d8','f0c6','f4cd','f1dd','f540','f5ab','f67b','f0ea','f04c','f28b','f1b0','f67c','f304','f305','f5ac','f5ad','f14b','f303','f5ae','f816','f756','f095','f879','f3dd','f098','f87b','f2a0','f87c','f4d3','f484','f818','f67f','f072','f5af','f5b0','e069','f04b','f144','f1e6','f067','f055','f0fe','f2ce','f681','f682','f2fe','f75a','f619','f3e0','f154','f011','f683','f684','f5b1','f485','f486','f02f','f487','f542','e06a','e06b','f12e','f029','f128','f059','f458','f10d','f10e','f687','f7b9','f7ba','f75b','f074','f543','f8d9','f1b8','f01e','f2f9','f25d','f87d','f3e5','f122','f75e','f7bd','f079','f4d6','f70b','f018','f544','f135','f4d7','f09e','f143','f158','f545','f546','f547','f548','f70c','f156','f5b3','f5b4','f7bf','f7c0','f0c7','f549','f54a','f70e','f7c2','f002','f688','f689','f010','f00e','f4d8','f233','f61f','f064','f1e0','f1e1','f14d','f20b','f3ed','e06c','f21a','f48b','f54b','f290','f291','f07a','f2cc','f5b6','f4d9','f2f6','f2a7','f2f5','f5b7','f7c4','e06d','f0e8','f7c5','f7c9','f7ca','f54c','f714','f715','f7cc','f1de','f118','f5b8','f4da','f75f','f48d','f54d','f7cd','f7ce','f2dc','f7d0','f7d2','e06e','f696','f5bb','f197','f5bf','f048','f239','f0f2','f5c1','f185','f5c2','f5c3','f5c4','f5c5','f69b','f021','f2f1','f48e','f0ce','f45d','f10a','f3fa','f490','f3fd','f02b','f02c','f4db','f0ae','f1ba','f62e','f62f','f7d7','f120','f034','f035','f630','f491','f722','f238','f7da','f1f8','f2ed','f1bb','f091','f0d1','f4de','f63b','f4df','f63c','f553','f0e9','f09c','f093','f2e7','e085','f6a7','e076','f897','f45f','f772','f729','f554','f555','f494','f773','f83e','f496','f5cd','f193','f72f','f4e3','f0ad','f6ad'];
                let fontAwesomeIconeHtml = '';
                for(let i=0;i<allIcons.length;i++) fontAwesomeIconeHtml+='<span class="cat-sel-ico" style="font-weight:900" value="'+allIcons[i]+'">'+"&#x"+allIcons[i]+'</span>'
                // $('#new-category-icon').html(fontAwesomeIconeHtml);

                $('#new-category-ico').html(fontAwesomeIconeHtml);
                $('.cat-sel-ico').off();
                $('.cat-sel-ico').click((e)=>{
                    let key = $(e.target).attr('value');
                    $('.active-cat').removeClass('active-cat');
                    $(e.target).toggleClass('active-cat');
                    $('#new-category-icon').attr('value',key);
                    $('#new-category-icon').html("&#x"+key);    

                })
            }else{
                $('#form-category-icon').html('<span class="create-category-ico" >&#x'+icon+'</span>')
            }
        })


    },

    listTagsInForm : async function listTagsInForm(selectedTags){
        
        let allTagsInfo = userTags;
        let allTagsHTML = '';
        let allTagsId = [];
        formSelectedTags = [];
        for(let i=0;i<allTagsInfo.length;i++){
            allTagsHTML+='<option value="'+allTagsInfo[i].id+'">'+allTagsInfo[i].name+'</option>'
            allTagsId.push(+(allTagsInfo[i].id));
        }

        for(let item in selectedTags){
            formSelectedTags.push(selectedTags[item])
        }

        $('#locationSets').html(allTagsHTML);


        // Connecting tags selection input box with selectize plugin 
        $('#locationSets').selectize({
            delimiter: ",",
            persist: false,
            create:true,
            plugins: ['remove_button'],
            selectOnTab : true,
            items:selectedTags,
            onItemAdd: (value,obj)=>{
                let status = true;
                if(allTagsId.includes(+value)) formSelectedTags.push(value);
                else{
                    status = createNewTag(value,obj)
                }                    
                return false;
            },
            onItemRemove : ((value)=>{
                formSelectedTags = formSelectedTags.filter(e => e != value)
            })
        });

        function createNewTag(name,obj){
            if(name.length<3 || name.length>15){
                alert('pleas create tag in len between 3 and 15');
                $(obj).hide();
                return false;
            }
            createTag(JSON.stringify({
                "name":""+name,
                "color":"#44545"
            })).then((data)=>{
                allTagsId.push(data.data.id);
                formSelectedTags.push(data.data.id);
                util.handleApiResponse(data,"Tag Created ✅");
                userTags.push(data.data);
                userTagsMap[data.data.id] = data.data;
            })
            return true;
        }

        // Setting tag creation max length as 14
        $('.selectize-control input').attr('maxlength','14')
    },

    splitWalletHandler : function splitWalletHandler(){

        // Check is all wallet filled before creation
        if(!IsAllWalletSplitFilled()) return;

        // Clone wallet split and add it to dom
        totalWalletSplits++;
        let walletSplitAdditional = $('.wallet-split1').clone().removeClass('wallet-split1')
        walletSplitAdditional.find('.message-text').remove();
        walletSplitAdditional.find('#expense-amount').val(0);
        $('.wallet-split1').find('#split-wallet').remove();


        walletSplitAdditional.appendTo($('#all-wallet-splits'));
        $('.w-split').append('<i class="far fa-times-circle"></i>');

        $('.w-split').find('.far').click((event)=>{
            $(event.target).closest('.w-split').remove();
            totalWalletSplits--;
            if(totalWalletSplits==1){
                $('.w-split').find('.fa-times-circle').remove();
                return;
            }
        });


        // Setting some css
        $('.w-split').addClass('d-flex');
        $('.wallet-name-section').addClass('w90');


        function IsAllWalletSplitFilled(){

            let allWalletSplitValues = $('.w-split');

            for(let k=0; k<allWalletSplitValues.length; k++){
                let amount = $(allWalletSplitValues[k]).find('#expense-amount').val();
                if(amount == 0 || amount==undefined || amount==null){
                    $(allWalletSplitValues[k]).find('#expense-amount').css('border-color','red')
                    return false;
                }else{
                    $(allWalletSplitValues[k]).find('#expense-amount').css('border-color','#ced4da')

                }
            }
            return true;
        }

    },

    setDateTimeInForm : function setDateTimeInForm(dateTime){
        $('#expense-time').val(dateTime);
    },

    createNewCategory : async function createNewCategory(){

        let newCategoryName = $('#new-category-input').val();
        let newCategoryIcon = $('#new-category-icon').attr('value')
        let categoryId = null;

        let raw = {
            "name": newCategoryName,
            "imagePath": newCategoryIcon
        }
        raw = JSON.stringify(raw)

        await createCategory(raw).then((data)=>{
            util.toastResponse(data, "Category Creation Success","Category Creation Failed");
            util.handleApiResponse(data,"Category Created ✅ ");
            userCategories.push(data.data);
            userCategoriesMap[data.data.id] = data.data;
            categoryId = data.data.id;
        })
        return categoryId;
    },

    validateExpenseInfo : function validateExpenseInfo(expenseInfo){ 

        let spendOn = expenseInfo.transactionInfo.spendOn;
        
        let valid = true;
        valid = util.isGreaterThanZero(expenseInfo.amount,$('#expense-amount')) && valid;
        valid = util.isLessThanN(expenseInfo.amount,10000000,$('#expense-amount')) && valid;
        valid = util.isLessThanN(new Date(spendOn).getTime(),new Date().getTime()+1,$('#expense-time')) && valid;
        valid = util.isNotEmpty(expenseInfo.transactionInfo.reason,$('#expense-name')) && valid;       
        if(usingNewCategory){
            valid = util.isNotEmpty($('#new-category-input').val(),$('#new-category-input')) && valid;
        }

        let allWalletSplitValues = $('#create-new-expense-form .w-split');

        for(let k=0; k<allWalletSplitValues.length; k++){
            let amount = $(allWalletSplitValues[k]).find('#expense-amount').val();
            valid = util.isGreaterThanN(amount,0,$(allWalletSplitValues[k]).find('#expense-amount')) && valid;
        }
        return valid;
    }

}

$(document).ready(()=>{
    updateHeader();
    findBasicEntities();
    initiateDateSelectorPlugin();
})

function findBasicEntities(){
    let promisePending = [];
    promisePending.push(findCategories());
    promisePending.push(findWallets())
    promisePending.push(findTags());

    Promise.all(promisePending).then((values)=>{

        if(values[0]==null || values[1]==null || values[2]==null ) return;

        userCategories= (values[0].data)
        for(let k=0; k<userCategories.length; k++){
            userCategoriesMap[userCategories[k].id] = userCategories[k];
        }
        userCategoriesMap[0] = {
            id:0,
            name: 'General Expense',
        }
        
        let wallets = values[1].data;
        for(const category in wallets){
            if(category =='Credit Card') userCardWallets.push(...wallets[category]);
            else userNonCardWallets.push(...wallets[category]);
            userWallets.push(...wallets[category]);
        }
        for(let key in userWallets) userWalletsMap[userWallets[key].id] = userWallets[key];

        userTags = values[2].data;
        for(let k=0; k<userTags.length; k++){
            userTagsMap[userTags[k].id] = userTags[k];
        }
    })

}

// Fetch expense info or the selected date range  -- [TRIGGER = Any date range change in date selector plugin called at initiateDateSelectorPlugin()] 
function setFetchDetails(expenseFrom,expenseTo,timeSpan,refreshExpenseContainer,containerId,expenseData){
    previousExpenseFetch =  {
        "expenseFrom" : expenseFrom,
        "expenseTo" : expenseTo,
        "timeSpan" : timeSpan,
        "refreshExpenseContainer" : refreshExpenseContainer,
        "containerId" : containerId,
        "expenseData" : expenseData
    }
}

function repopulateExpenseDetails(refetch){
    findAllExpenseDetails(previousExpenseFetch.expenseFrom,previousExpenseFetch.expenseTo,previousExpenseFetch.timeSpan,true,previousExpenseFetch.containerId,refetch);
}

async function findAllExpenseDetails(expenseFrom,expenseTo,timeSpan,refreshExpenseContainer,containerId,refetch){   
    $('#date-range-selector').show();
    if(refreshExpenseContainer==true){
        $('.edit-expense-form').remove();
        $('.view-expense-modal').remove();
        listingExpenseDate = null;
        $('#'+containerId).html("");
    }

    // Clearing up old expense section data
    daysTotalExpense = 0;
    let expenseData = null;

    
    // Find all expense info from selected date range
    if(timeSpan!=null) $('.timespan').text(timeSpan)


    // Seperate Fetching Mechanism for timespan view and Recent transactions
    if(refetch==false){
        expenseData = previousExpenseFetch.expenseData;
    }else{
        if(timeSpan=='Recent') await findTransactionsPaginated(pageNumber,pageSize,'expenses').then((data)=>expenseData = data);
        else                   await findTransactions(expenseFrom,expenseTo,'expenses').then((data)=>{ expenseData = data });
    }


    // Add loading indicator at end of container only for recent transactions
    
    // Store arg values in ana object that will be used for refresh 
    setFetchDetails(expenseFrom,expenseTo,timeSpan,refreshExpenseContainer,containerId,expenseData);

    if(expenseData==null) return;
    if(expenseData.data.expenses.length == 0) zeroExpensesHandler(containerId);

    let expenses = expenseData.data.expenses;
    for(let i=0; i<expenses.length; i++){ 
        // Find all wallets (search in already fetched wallets if not found get from server)
        let wallets = new Array();
        for (const [key, value] of Object.entries(expenses[i].walletSplits)){
            let searched = null;
            searched = (userWalletsMap[key])
            if(searched!=null)  wallets.push(searched);
            else if(key<0){
                searched = {
                    "id": -100,
                    "name": "Wallet not linked",
                    "type": "Other",
                    "archiveWallet": false,
                    "balance": 1000,
                    "excludeFromStats": false,
                    "walletInfo": {
                        "note": ""
                    }
                    }
                    wallets.push(searched)
            }
        }
        
        // Find Category info
        let categoryInfo = {};
        categoryInfo= userCategoriesMap[expenses[i].transactionInfo.categoryId];
        
        // Add expense amount to currentRangeTotal and Populate
        rangeExpense+=expenses[i].amount;
        newDateSectionHandler(expenses[i]);
        populateExpense(wallets,expenses[i],categoryInfo,containerId);
    }

    // Only appliable for recent transactions section
    if(timeSpan=='Recent' && expenseData.data.expenses.length==15) mountLoadingScreen();
    function mountLoadingScreen(){

        if(expenseData.data.expenses.length == 0) return;

        // Load more expenses when reached expense container end
        $('#'+containerId).off();
        $('#'+containerId).scroll(function(e){

            // grab the scroll amount and the window height
            let elementte = $('#'+containerId)[0];
            var scrollPercent = (elementte.scrollTop / (elementte.scrollHeight - elementte.offsetHeight))*100;

            if(scrollPercent > 70) {
                // $('#'+containerId).append('<div id="espinner" style="display: flex;align-items: center;justify-content: center;height:200px"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>')
                $('#'+containerId).append('<div class="exp-loading-skeleton"> <div class="post"> <div class="avatar"></div> <div class="line"></div> </div> </div>');
                $('#'+containerId).append('<div class="exp-loading-skeleton"> <div class="post"> <div class="avatar"></div> <div class="line"></div> </div> </div>');
                $('#'+containerId).append('<div class="exp-loading-skeleton"> <div class="post"> <div class="avatar"></div> <div class="line"></div> </div> </div>');
                $('#'+containerId).append('<div class="exp-loading-skeleton"> <div class="post"> <div class="avatar"></div> <div class="line"></div> </div> </div>');
                $('#'+containerId).off();
                pageNumber++;
                setTimeout( async ()=>{
                    await findAllExpenseDetails(null,null,'Recent',false,containerId)
                    $('#'+containerId).find('.exp-loading-skeleton').remove()
                },1500)
            }
        
        });
    }

    function newDateSectionHandler(expense){
       
        if(expense.transactionInfo.spendOn.split(" ")[0]!=listingExpenseDate){
            daysExpenseCount = 1;
            daysTotalExpense = expense.amount;
            createNewDateSection(expense.transactionInfo.spendOn.split(" ")[0]); 
            listingExpenseDate = expense.transactionInfo.spendOn.split(" ")[0];
        }else{
            daysExpenseCount+=1;
            daysTotalExpense+=expense.amount;
            $('.days-expense'+listingExpenseDate).text(util.moneyFormat(daysTotalExpense)); 
            $('.dtb'+listingExpenseDate).find('.expenses-count').text(daysExpenseCount); 
        }
        
        function createNewDateSection(newDate){
            let dateSection = document.createElement("div");
            $(dateSection).addClass("date-section");

            // Monthly view calendar update
            let calander = $('.dt'+newDate);
            let calendarBoxContent = $('<div class="calendar-dtb dtb'+newDate+'"></div>');
            $(calendarBoxContent).append('<span> <span class="expenses-count">1 </span> Expenses</span>'); // Expense Count will be updated by newDateSection() in populateExpense();
            $(calendarBoxContent).append('<h4 class="dte-amount days-expense'+newDate+'">'+util.moneyFormat(daysTotalExpense)+'</h4>');
            $(calander).find('.monthly-indicator-wrap').html(calendarBoxContent);

            let date = newDate.split("-").reverse();
            date[1] = months[date[1]-1];
            date = date.join(' ')

            let daysExpenseTemplate = "<span class='days-expense"+newDate+" days-expense'>"+daysTotalExpense+'</span></small></div>';                
            dateSection.innerHTML = '<div class="date-grouping" date="'+date.replaceAll(" ","-")+'" style="margin-top:30px"><b>'+date+'</b> | <small>Total Expense: '+ daysExpenseTemplate;
            dateSection.style.color = '#385170';
            $('#'+containerId).append(dateSection);
        }
            
    }
}

// Fetch Wallet Split and tag info then populateExpense [Trigger = findAllExpenseDetails()]
async function populateExpense(walletInfo,expense,categoryInfo,containerIdToMount){

    let allTagsInfo = [];
    let walletName = null;
    let isWalletMissSet =  null;
    let tagsIds = expense.transactionInfo.tagId;
    
    let expenseContainer = $("#"+containerIdToMount)[0];
    let currentElement = null;
    let color = '#'+colorOne[expense.id%9];
    let colorTw = '#'+colorTwo[expense.id%9];

    cloneExpenseTemplate();

    populateCardInformation();
    populateWalletDetails();
    populateTags();

    setCustomAttributes();
    setCustomStyling();

    addViewListener();
    addDeleteListener();
    addEditListener();

    
    mountExpenseToDom();

    // Grouping multiple days expense with dates and calculating per days's expense 

    function cloneExpenseTemplate(){
        let expenseTemplate = $("#expense-card-template")[0];
        let expenseTemplateClone = expenseTemplate.content.cloneNode(true);
        $(expenseTemplateClone).find('#editExpenseForm').attr('id','editExpenseForm'+expense.id);
        $(expenseTemplateClone).find('.edit-expense-btn').click(()=>{
            $('#myModal').modal({ show: false})
            $('#'+'editExpenseForm'+expense.id).modal('show');
            $('#'+'editExpenseForm'+expense.id).appendTo('body');
            mountEditExpenseForm(expense.id);
        })
        currentElement = expenseTemplateClone;
    }

    // Populating information to the card
    function populateCardInformation(){

        // Format expense time
        let timeOnly = expense.transactionInfo.spendOn.split(" ")[1].split(":");
        let fullExpenseTime = (util.to12Format(timeOnly[0]+":"+timeOnly[1]));
                
        // Setting expense data to the dom
        if(categoryInfo?.imagePath == undefined){
            categoryInfo.imagePath = 'f543'
        }

        

        $(currentElement).find(".title").text(expense.transactionInfo.reason+" ");
        $(currentElement).find(".spend-amount").text("-"+ util.abbreviateNumber(expense.amount));
        $(currentElement).find(".expense-note").text(expense.transactionInfo.note);
        $(currentElement).find(".timestamp").text(expense.timestamp);
        $(currentElement).find(".category").text(categoryInfo.name);
        $(currentElement).find(".spend-on").text(fullExpenseTime);
        $(currentElement).find(".category-ico").html('&#x'+categoryInfo.imagePath)
    }

    // Find and append wallet Split;
    function populateWalletDetails(){

        if(walletInfo.length==0) return;
        
        for(let i=0; i<walletInfo.length;i++){
            if(walletInfo[i].id <   0 ){
                isWalletMissSet = false;
                let newWalletSplit = $('<div class="wallet-split d-flex card-field"> <div class="w-50 account-name label"> Indian Bank </div> <div class="w-50 account-spend value"> 500 ₹ </div> </div>');
                $(newWalletSplit).find('.account-name').text(walletInfo[i].name);
                $(newWalletSplit).find('.account-spend').text('N/A');
                // $(currentElement).find(".wallet-splits").append(newWalletSplit);
                
            }else{
                let id = walletInfo[i]?.id;
                let newWalletSplit = $('<div class="wallet-split d-flex card-field"> <div class="w-50 account-name label"> Indian Bank </div> <div class="w-50 account-spend value"> 500 ₹ </div> </div>');
                $(newWalletSplit).find('.account-name').text(walletInfo[i].name);
                $(newWalletSplit).find('.account-spend').text(expense.walletSplits[id]+" ₹");
                $(currentElement).find(".wallet-splits").append(newWalletSplit);
            }
        }

        if($(currentElement).find('.wallet-split').size()==0)  $(currentElement).find('.wallet-splits').parent().remove();

        // Finding wallet name
        if(walletInfo[0].id<0){
            walletName = '<span class="muted">N/A</span>'
        }else if(walletInfo.length == 1){
            $(currentElement).find('.fa-wallet').css('color','white')
            walletName = (walletInfo[0]?.name);
        }else{
            $(currentElement).find('.fa-wallet').css('color','white')
            let accounts = walletInfo.length;
            walletName = +accounts+" Accounts "+'<i class="fa-solid fa-arrows-split-up-and-left"></i> '
        }

        let walletType = walletInfo.length > 1 ? 'Multiple Wallet Split' : walletInfo[0]?.data?.type ;
        $(currentElement).find(".wallet-name").html(walletName);
        $(currentElement).find(".wallet-type").text(walletType);

        // Detection of isDeleted Wallets Expense
        handleWalletedDeletedExpenses();
        function handleWalletedDeletedExpenses(){
            if(isWalletMissSet === true) $(currentElement).find('.edit-expense-btn').remove();
            if(isWalletMissSet === true) $(currentElement).find('.expense-edit-btn').remove();
            if(isWalletMissSet === true) $(currentElement).find('.wallet-splits').before('<div class="text-danger">Some wallets has been deleted.(editing disabled)</div>');
            if(isWalletMissSet === true) $(currentElement).find('.expense-edit-btn').off()
            if(isWalletMissSet === true) $(currentElement).find(".title").append('<i class="fas expired-expense-ico fa-ban"></i>'); 
        }


    }

    // Populating Tags
    function populateTags(){

        for(let i=0;i<tagsIds.length;i++){
            let tagInfo = {data:userTagsMap[tagsIds[i]]};
            if(tagInfo.data==undefined){
                tagInfo.data = {name:"syncing..."};
                allTagsInfo.push(tagInfo);
            }else{
                allTagsInfo.push(tagInfo);
            }
        }

        let newTag =$('<div class="tag d-flex align-items-center justify-content-between"> <span>&nbsp;</span> <span class="tag-text">upi</span> </div>')
        let allTagsSection = $(currentElement).find('.all-tags-section');
        let modelAllTagsSection = $(currentElement).find('.all-tags-msection');

        for(let i=0;i<allTagsInfo.length;i++){
            let newTagClone = newTag.clone();
            newTagClone.find('.tag-text').text(allTagsInfo[i].data.name.toLowerCase());
            // newTagClone.find('.tag-text').css('background-color',('#'+colorTwo[allTagsInfo[i].data.id%9]));
            modelAllTagsSection.append(newTagClone);

            if(i<3){
                let newElement = newTag.clone();
                newElement.find('.tag-text').text(""+allTagsInfo[i].data.name.toLowerCase());
                // newElement.find('.tag-text').css('background-color',('#'+colorOne[allTagsInfo[i].data.id%9]));
                allTagsSection.append(newElement);
            }
        }

        if(allTagsInfo.length>3){
            let newElement = $('<div class="d-flex align-items-center justify-content-between"> <span>&nbsp;</span> <span class="tty">upi</span> </div>')
            newElement.find('.tty').text('+ '+ (allTagsInfo.length -3) + ' more');
            newElement.find('.tty').css('color','#fff');
            allTagsSection.append(newElement);
        }
        
    }
    
    // Setting dynamic attributes
    function setCustomAttributes(){
        $(currentElement).find('#exampleModal').attr('id','expense'+expense.id)
        $(currentElement).find(".expense-delete-btn").attr('expense-id',''+expense.id);
        $(currentElement).find(".edit-expense-btn").attr('expense-id',expense.id);
        $(currentElement).find(".expense-edit-btn").attr('expense-id',expense.id);
        $(currentElement).find('.expense-card').attr('expense-id',expense.id);

    }

    // Adding Dynamic Styling
    function setCustomStyling(){
        $(currentElement).find('.category-ico').css('background-color','#363636');
        $(currentElement).find('.modal-content .category-ico').css('background-color','#43cead');
        $(currentElement).find('.category-ico').css('color','#'+colorOne[categoryInfo.id%9]);
        $(currentElement).find(".view-expense-modal .category").css('background-color', '#ace9db');  
        $(currentElement).find(".view-expense-modal .category").css('color', '#000');  
    }


    function addViewListener(){
        $(currentElement).find('.expcard-body').click(()=>{
            $('#expense'+expense.id).modal({ show: false})
            $('#expense'+expense.id).modal('show');
        })
    }
    
    // Delete Button Listener
    function addDeleteListener() {
        $(currentElement).find('.expense-delete-btn').click((event)=>{ 
            let expenseId = $(event.target).attr('expense-id');
            $('#spinner').css('display','block');

            deleteTransactionsById(+expenseId).then((data)=> {
                util.handleApiResponse(data,"Expense Deleted 🗑️ ");
                $('#spinner').css('display','none');
                $(event.target).closest('.modal-content').find('.btn-close').click();
                

                let mayDateElement = ($('.expense-card[expense-id='+expenseId+']').prev());
                $('.expense-card[expense-id='+expenseId+']').remove();
                let nextElement = $(mayDateElement).next();

                if($(mayDateElement).hasClass('date-section') && ($(nextElement).length==0 || $(nextElement).hasClass('date-section'))){
                    $(mayDateElement).remove();
                    if($(('#'+previousExpenseFetch.containerId)).children().length==0){
                        zeroExpensesHandler(previousExpenseFetch.containerId);
                    }
                }
                
                updateHeader();
            });
        })
    }

    // Open edit on clicking title
    function addEditListener(){
        $(currentElement).find('.modal-title').click((event)=>{
            $(currentElement).find('.expense-edit-btn').click();
        });
    }


    function mountExpenseToDom(){

        // To Fix Modal Mounting inside container issues
        $(currentElement).find('.expcard-body').click(()=>{
        $('#expense'+expense.id).appendTo('body');
        })
        $(expenseContainer).append(currentElement);
    }

}     

// Initiate the date range selector plugin and trigger populateExpense for Recent
function initiateDateSelectorPlugin(){

    function dateChangeCallback(start, end, timeSpan) {

        // No date in expense list for today and yesterday's expense
        let expenseFrom = start;
        let expenseTo = end;
        let refreshExpenseContainer = true;

        if(timeSpan=='Recent'){
            pageNumber = 1;
            refreshExpenseContainer = false;
        }else{
            expenseFrom = start.format('YYYYMMDD').split('-').join('');
            expenseTo = end.format('YYYYMMDD').split('-').join('');
        }

        createMountPoint(timeSpan,true)
        if(timeSpan=='Yesterday' || timeSpan=='Recent' || timeSpan=='Custom Range') findAllExpenseDetails(expenseFrom,expenseTo,timeSpan,true,'expense-card-container'); // true = refreshExpenseContainer

        // findAllExpenseDetails(expenseFrom,expenseTo,timeSpan,true,null); // true = refreshExpenseContainer


        $('#date-range-type').html(timeSpan);
        currTimeSpan = timeSpan;
    }

    let allDateRanges =  {
        'Recent' : [moment(),moment()], // "Works based on count the keys has no usage",
        'Yesterday' : [moment().subtract(1, 'days'),moment().subtract(1, 'days')], // 
        'Last 7 Days' : [moment().subtract(6, 'days'),moment()], //
        'Monthly': [moment().startOf('month'), moment().endOf('month')],
    };

    let start = allDateRanges[currTimeSpan][0];
    let end = allDateRanges[currTimeSpan][1];

    let now = moment().format('MM/DD/YYYY');

    $('#reportrange').daterangepicker({ startDate: start, endDate: end,maxDate: now, ranges: allDateRanges }, dateChangeCallback);

    // To be removed
    setTimeout(() => {
        dateChangeCallback(start, end, currTimeSpan);
    }, 300);


}  

// Called if no expenses for the user [Trigger = findAllExpenseDetails]
function zeroExpensesHandler(containerId){

    if(previousExpenseFetch.timeSpan=='Recent' && $('#'+containerId).children().length==0 ){
        let element = $('.tt-no-expense-template');
        let userData = util.getUserData();
        $(element).find('.username').text(userData.name+", ");
        $("#"+containerId).append(element);
        // $('#date-range-selector').hide();
        $('.first-add-exp').click(()=>{
            $('#create-expense-btn').click();
        })
        $(element).css('display', 'block');
    }else if( $('#'+containerId).children().length==0){
        $('#'+previousExpenseFetch.containerId).append('<div class="card"><div class="card-body d-flex align-items-center justify-content-center"><span class="h3">No expenses found.</span></div></div>')
    }else{
        $('#'+previousExpenseFetch.containerId).append('<div class="card"></div>')

    }

}

// Monthly View Functions
function calendarMonthExpensesChange(month,year){
    if((month+"").length == 1) month = "0"+month;
    let start = year+""+month+"01";
    let end = year+""+month+(32 - new Date(year, month-1, 32).getDate());
    findAllExpenseDetails(start, end,'Monthly',true,'');
}

function calendarSingleDayExpense(element){

    let date = $(element).attr('date');
    date = date.replaceAll("-","");
    
    $('#monthly-day-expenses').html("");
    findAllExpenseDetails(date, date,'Monthly',true,'monthly-day-expenses'); // Start and end date date is same because the this to a days expenses

}

// All view mounting engines.
function createMountPoint(timeSpan,refreshExpenseContainer){

    unmountRecentExpenses();
    unmountWeeklyExpenses();
    unmountCalendar();        

    if(timeSpan=='Last 7 Days') mountWeeklyExpenses();
    else if(timeSpan=='Recent' || timeSpan=='Yesterday' || timeSpan=='Custom Range') mountRecentExpensesSection();
    else if(timeSpan=='Monthly'){
        if(!isMonthlyViewOverriden){
            monthlyViewOverride();
            isMonthlyViewOverriden = true;
            $('#mycalendar').monthly({});
            $('.monthly-event-list').attr('id','monthly-day-expenses');
        }
        mountCalendarExpensesSection();
    }else if(timeSpan=='Weekly') mountWeeklyExpenses();

    // Weekly and Monthly view Override
    function monthlyViewOverride() {

        (function ($) {
            "use strict";
            $.fn.extend({
                monthly: function(customOptions) {

                    // These are overridden by options declared in footer
                    var defaults = {
                        dataType: "xml",
                        disablePast: false,
                        eventList: true,
                        events: "",
                        jsonUrl: "",
                        linkCalendarToEventUrl: false,
                        maxWidth: false,
                        mode: "event",
                        setWidth: false,
                        showTrigger: "",
                        startHidden: false,
                        stylePast: false,
                        target: "",
                        useIsoDateFormat: false,
                        weekStart: 0,	// Sunday
                        xmlUrl: ""
                    };

                    var	options = $.extend(defaults, customOptions),
                        uniqueId = $(this).attr("id"),
                        parent = "#" + uniqueId,
                        currentDate = new Date(),
                        currentMonth = currentDate.getMonth() + 1,
                        currentYear = currentDate.getFullYear(),
                        currentDay = currentDate.getDate(),
                        locale = (options.locale || defaultLocale()).toLowerCase(),
                        monthNameFormat = options.monthNameFormat || "short",
                        weekdayNameFormat = options.weekdayNameFormat || "short",
                        monthNames = options.monthNames || defaultMonthNames(),
                        dayNames = options.dayNames || defaultDayNames(),
                        markupBlankDay = '<div class="m-d monthly-day-blank"><div class="monthly-day-number"></div></div>',
                        weekStartsOnMonday = options.weekStart === "Mon" || options.weekStart === 1 || options.weekStart === "1",
                        primaryLanguageCode = locale.substring(0, 2).toLowerCase();

                if (options.maxWidth !== false) {
                    $(parent).css("maxWidth", options.maxWidth);
                }
                if (options.setWidth !== false) {
                    $(parent).css("width", options.setWidth);
                }

                if (options.startHidden) {
                    $(parent).addClass("monthly-pop").css({
                        display: "none",
                        position: "absolute"
                    });
                    $(document).on("focus", String(options.showTrigger), function (event) {
                        $(parent).show();
                        event.preventDefault();
                    });
                    $(document).on("click", String(options.showTrigger) + ", .monthly-pop", function (event) {
                        event.stopPropagation();
                        event.preventDefault();
                    });
                    $(document).on("click", function () {
                        $(parent).hide();
                    });
                }

                // Add Day Of Week Titles
                _appendDayNames(weekStartsOnMonday);

                // Add CSS classes for the primary language and the locale. This allows for CSS-driven
                // overrides of the language-specific header buttons. Lowercased because locale codes
                // are case-insensitive but CSS is not.
                $(parent).addClass("monthly-locale-" + primaryLanguageCode + " monthly-locale-" + locale);

                // Add Header & event list markup
                $(parent).prepend('<div class="monthly-header"><div class="monthly-header-title"><a href="#" class="monthly-header-title-date" onclick="return false"></a></div><a href="#" class="monthly-prev"></a><a href="#" class="monthly-next"></a></div>').append('<div class="monthly-event-list"></div>');

                // Set the calendar the first time
                setMonthly(currentMonth, currentYear);

                // How many days are in this month?
                function daysInMonth(month, year) {
                    return month === 2 ? (year & 3) || (!(year % 25) && year & 15) ? 28 : 29 : 30 + (month + (month >> 3) & 1);
                }

                // Build the month
                function setMonthly(month, year) {
                    

                    calendarMonthExpensesChange(month, year);
                    $(parent).data("setMonth", month).data("setYear", year);

                    // Get number of days
                    var index = 0,
                        dayQty = daysInMonth(month, year),
                        // Get day of the week the first day is
                        mZeroed = month - 1,
                        firstDay = new Date(year, mZeroed, 1, 0, 0, 0, 0).getDay(),
                        settingCurrentMonth = month === currentMonth && year === currentYear;

                    // Remove old days
                    $(parent + " .monthly-day, " + parent + " .monthly-day-blank").remove();
                    $(parent + " .monthly-event-list, " + parent + " .monthly-day-wrap").empty();
                    // Print out the days
                    for(var dayNumber = 1; dayNumber <= dayQty; dayNumber++) {
                        // Check if it's a day in the past
                        var isInPast = options.stylePast && ( year < currentYear || (year === currentYear && ( month < currentMonth || (month === currentMonth && dayNumber < currentDay))));
                        var innerMarkup = '<div class="monthly-day-number">' + (dayNumber) + '</div><div class="monthly-indicator-wrap"></div>';
                        if(options.mode === "event") {
                            var thisDate = new Date(year, mZeroed, dayNumber, 0, 0, 0, 0);
                            let currentMonth = thisDate.getMonth()+1;
                            if((currentMonth+"")==1) currentMonth = "0"+currentMonth;
                            $(parent + " .monthly-day-wrap").append("<div"
                                + attr("class", "m-d monthly-day monthly-day-event"
                                    + (isInPast ? " monthly-past-day" : "")
                                    // + " dt" + year+"-"+mZeroed+"-"+dayNumber
                                    + " dt" + thisDate.getFullYear()+"-"+(currentMonth)+"-"+ ( (thisDate.getDate()+"").length == 1 ? "0"+thisDate.getDate() : thisDate.getDate())
                                    )
                                + attr("data-number", dayNumber)
                                + attr("date",thisDate.getFullYear()+"-"+(currentMonth)+"-"+ ( (thisDate.getDate()+"").length == 1 ? "0"+thisDate.getDate() : thisDate.getDate()))
                                + ">" + innerMarkup + "</div>");
                        } else {
                            $(parent + " .monthly-day-wrap").append("<a"
                                + attr("href", "#")
                                + attr("class", "m-d monthly-day monthly-day-pick" + (isInPast ? " monthly-past-day" : ""))
                                + attr("data-number", dayNumber)
                                + ">" + innerMarkup + "</a>");
                        }
                    }

                    if (settingCurrentMonth) {
                        $(parent + ' *[data-number="' + currentDay + '"]').addClass("monthly-today");
                    }

                    // Reset button
                    $(parent + " .monthly-header-title").html('<a href="#" class="monthly-header-title-date" onclick="return false">' + monthNames[month - 1] + " " + year + "</a>" + (settingCurrentMonth && $(parent + " .monthly-event-list").hide() ? "" : '<a href="#" class="monthly-reset"></a>'));

                    // Account for empty days at start
                    if(weekStartsOnMonday) {
                        if (firstDay === 0) {
                            _prependBlankDays(6);
                        } else if (firstDay !== 1) {
                            _prependBlankDays(firstDay - 1);
                        }
                    } else if(firstDay !== 7) {
                        _prependBlankDays(firstDay);
                    }

                    // Account for empty days at end
                    var numdays = $(parent + " .monthly-day").length,
                        numempty = $(parent + " .monthly-day-blank").length,
                        totaldays = numdays + numempty,
                        roundup = Math.ceil(totaldays / 7) * 7,
                        daysdiff = roundup - totaldays;
                    if(totaldays % 7 !== 0) {
                        for(index = 0; index < daysdiff; index++) {
                            $(parent + " .monthly-day-wrap").append(markupBlankDay);
                        }
                    }

                    // Events
                    var divs = $(parent + " .m-d");
                    for(index = 0; index < divs.length; index += 7) {
                        divs.slice(index, index + 7).wrapAll('<div class="monthly-week"></div>');
                    }
                }

                function attr(name, value) {
                    var parseValue = String(value);
                    var newValue = "";
                    for(var index = 0; index < parseValue.length; index++) {
                        switch(parseValue[index]) {
                            case "'": newValue += "&#39;"; break;
                            case "\"": newValue += "&quot;"; break;
                            case "<": newValue += "&lt;"; break;
                            case ">": newValue += "&gt;"; break;
                            default: newValue += parseValue[index];
                        }
                    }
                    return " " + name + "=\"" + newValue + "\"";
                }

                // Day names in top of calendar
                function _appendDayNames(startOnMonday) {
                    var offset = startOnMonday ? 1 : 0,
                        dayName = "",
                        dayIndex = 0;
                    for(dayIndex = 0; dayIndex < 6; dayIndex++) {
                        dayName += "<div>" + dayNames[dayIndex + offset] + "</div>";
                    }
                    dayName += "<div>" + dayNames[startOnMonday ? 0 : 6] + "</div>";
                    $(parent).append('<div class="monthly-day-title-wrap">' + dayName + '</div><div class="monthly-day-wrap"></div>');
                }

                // Detect the user's preferred language
                function defaultLocale() {
                    if(navigator.languages && navigator.languages.length) {
                        return navigator.languages[0];
                    }
                    return navigator.language || navigator.browserLanguage;
                }

                // Use the user's locale if possible to obtain a list of short month names, falling back on English
                function defaultMonthNames() {
                    if(typeof Intl === "undefined") {
                        return ["Jan", "Feb", "Mar", "Apr", "May", "June", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    }
                    var formatter = new Intl.DateTimeFormat(locale, {month: monthNameFormat});
                    var names = [];
                    for(var monthIndex = 0; monthIndex < 12; monthIndex++) {
                        var sampleDate = new Date(2017, monthIndex, 1, 0, 0, 0);
                        names[monthIndex] = formatter.format(sampleDate);
                    }
                    return names;
                }

                function formatDate(year, month, day) {
                    if(options.useIsoDateFormat) {
                        return new Date(year, month - 1, day, 0, 0, 0).toISOString().substring(0, 10);
                    }
                    if(typeof Intl === "undefined") {
                        return month + "/" + day + "/" + year;
                    }
                    return new Intl.DateTimeFormat(locale).format(new Date(year, month - 1, day, 0, 0, 0));
                }

                // Use the user's locale if possible to obtain a list of short weekday names, falling back on English
                function defaultDayNames() {
                    if(typeof Intl === "undefined") {
                        return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                    }
                    var formatter = new Intl.DateTimeFormat(locale, {weekday: weekdayNameFormat}),
                        names = [],
                        dayIndex = 0,
                        sampleDate = null;
                    for(dayIndex = 0; dayIndex < 7; dayIndex++) {
                        // 2017 starts on a Sunday, so use it to capture the locale's weekday names
                        sampleDate = new Date(2017, 0, dayIndex + 1, 0, 0, 0);
                        names[dayIndex] = formatter.format(sampleDate);
                    }
                    return names;
                }

                function _prependBlankDays(count) {
                    var wrapperEl = $(parent + " .monthly-day-wrap"),
                        index = 0;
                    for(index = 0; index < count; index++) {
                        wrapperEl.prepend(markupBlankDay);
                    }
                }

                function setNextMonth() {
                    var	setMonth = $(parent).data("setMonth"),
                        setYear = $(parent).data("setYear"),
                        newMonth = setMonth === 12 ? 1 : setMonth + 1,
                        newYear = setMonth === 12 ? setYear + 1 : setYear;
                    setMonthly(newMonth, newYear);
                    viewToggleButton();
                }

                function setPreviousMonth() {
                    var setMonth = $(parent).data("setMonth"),
                        setYear = $(parent).data("setYear"),
                        newMonth = setMonth === 1 ? 12 : setMonth - 1,
                        newYear = setMonth === 1 ? setYear - 1 : setYear;
                    setMonthly(newMonth, newYear);
                    viewToggleButton();
                }

                // Function to go back to the month view
                function viewToggleButton() {
                    if($(parent + " .monthly-event-list").is(":visible")) {
                        $(parent + " .monthly-cal").remove();   
                        $(parent + " .monthly-header-title").prepend('<a href="#" class="monthly-cal"></a>');
                    }
                    // $(".monthly-event-list").html("");
                }

                // Advance months
                $(document.body).on("click", parent + " .monthly-next", function (event) {
                    $('.monthly-event-list').css('display', 'none');
                    setNextMonth();
                    event.preventDefault();
                });

                // Go back in months
                $(document.body).on("click", parent + " .monthly-prev", function (event) {
                    $('.monthly-event-list').css('display', 'none');
                    setPreviousMonth();
                    event.preventDefault();
                });

                // Reset Month
                $(document.body).on("click", parent + " .monthly-reset", function (event) {
                    $(this).remove();
                    setMonthly(currentMonth, currentYear);
                    viewToggleButton();
                    event.preventDefault();
                    event.stopPropagation();
                });

                // Back to month view
                $(document.body).on("click", parent + " .monthly-cal", function (event) {
                    $(this).remove();
                    $(parent + " .monthly-event-list").css("transform", "scale(0)");
                    setTimeout(function() {
                        $(parent + " .monthly-event-list").hide();
                    }, 250);
                    event.preventDefault();
                });

                // Click A Day
                $(document.body).on("click touchstart", parent + " .monthly-day", function (event) {
                    // If events, show events list
                    var whichDay = $(this).data("number");
                    if(options.mode === "event" && options.eventList) {
                        var	theList = $(parent + " .monthly-event-list");
                        theList.show();
                        theList.css("transform");
                        theList.css("transform", "scale(1)");
                        $(parent + ' .monthly-list-item[data-number="' + whichDay + '"]').show();
                        
                        viewToggleButton();
                        if(!options.linkCalendarToEventUrl) {
                            event.preventDefault();
                        }
                        calendarSingleDayExpense(this);
                    // If picker, pick date
                    } else if (options.mode === "picker") {
                        var	setMonth = $(parent).data("setMonth"),
                            setYear = $(parent).data("setYear");
                        // Should days in the past be disabled?
                        if($(this).hasClass("monthly-past-day") && options.disablePast) {
                            // If so, don't do anything.
                            event.preventDefault();
                        } else {
                            // Otherwise, select the date ...
                            $(String(options.target)).val(formatDate(setYear, setMonth, whichDay));
                            // ... and then hide the calendar if it started that way
                            if(options.startHidden) {
                                $(parent).hide();
                            }
                        }
                        event.preventDefault();
                    }
                });

                // Clicking an event within the list
                $(document.body).on("click", parent + " .listed-event", function (event) {
                    var href = $(this).attr("href");
                    // If there isn't a link, don't go anywhere
                    if(!href) {
                        event.preventDefault();
                    }
                });

            }
            });
        }(jQuery));

    }

    function mountWeeklyExpenses(){

        if(weeklyTabInitialized) return;

        (function($) {
    
            Date.prototype.addDays = function(days) {
                var date = new Date(this.valueOf());
                date.setDate(date.getDate() + days);
                return date;
            }
        
            $.fn.markyourcalendar = function(opts) {
                var prevHtml = `<div id="myc-prev-week" class="d-flex align-items-center justify-content-center"><i class="fa-solid fa-chevron-left"></i></div>`;            
                var nextHtml = `<div id="myc-next-week" class="d-flex align-items-center justify-content-center"><i class="fa-solid fa-chevron-right"></i></div>`;
                var defaults = {
                    isMultiple: false,
                    months: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
                    prevHtml: prevHtml,
                    nextHtml: nextHtml,
                    startDate: new Date(),
                    weekdays: ['sun', 'mon', 'tue', 'wed', 'thurs', 'fri', 'sat'],
                };
                var settings = $.extend({}, defaults, opts);
                var onClickNavigator = settings.onClickNavigator;
                var instance = this;
        
                // kuhanin ang buwan
                this.getMonthName = function(idx) {  return settings.months[idx]; };
        
        
                // here is the controller to switch weeks
                // Controller to change 
                this.getNavControl = function() {
                    var previousWeekHtml = `<div id="myc-prev-week-container">` + settings.prevHtml + `</div>`;
                    var nextWeekHtml = `<div id="myc-prev-week-container">` + settings.nextHtml + `</div>`;
                    var monthYearHtml = `
                        <div id="myc-current-month-year-container" date='`+settings.startDate.getMonth()+ '-' + settings.startDate.getFullYear() +`'>
                            ` + this.getMonthName(settings.startDate.getMonth()) + ' ' + settings.startDate.getFullYear() + `
                        </div>
                    `;
        
                    var navHtml = `
                        <div id="myc-nav-container" class="d-flex align-items-center justify-content-between w-100">
                            ` + previousWeekHtml + `
                            ` + monthYearHtml + `
                            ` + nextWeekHtml + `
                        </div>
                    `;
                    return navHtml;
                };
        
    
                // Create weekly dates header tabs.
                this.getDatesHeader = async function() {
                    $('#spinner').show();
                    let startDay = moment(settings.startDate).format('YYYYMMDD');
                    let endDay = moment(settings.startDate).add(6, 'days').format('YYYYMMDD');
                    var expenseBasedOnDate ={};
                    await findTransactions(startDay,endDay,'expenses').then((data)=>{ 
                        let expenseDatas = data.data.expenses;
                        for (var j = 0; j < expenseDatas.length; j++) {
                            let expenseData = expenseDatas[j];
                            let date = moment(expenseData.transactionInfo.spendOn,'YYYY-MM-DD').format('YYYYMMDD');
                            if(expenseBasedOnDate[date]==null){
                                expenseBasedOnDate[date] = [];
                                expenseBasedOnDate[date].push(expenseData);
                            }else{
                                expenseBasedOnDate[date].push(expenseData);
                            }  
                        }

                     });

                    var tmp = ``;
                    for (var i = 0; i < 7; i++) {
                        var d = settings.startDate.addDays(i);
                        settings.startDate.addDays(i).setHours(0,0,0,0) == new Date().setHours(0,0,0,0)
                        let classes = "";
                        let today = "";
                        if(settings.startDate.addDays(i).setHours(0,0,0,0) == new Date().setHours(0,0,0,0)){
                            classes = `active-weekly-day"`;
                            today = " (today)";
                        }
                        let monthtt = (d.getMonth()+1);
                        if((monthtt+"").length == 1 ) monthtt = "0"+monthtt;
                        let datee = d.getDate();
                        if((datee+"").length == 1 ) datee = "0"+datee;
                        let dateAttr = d.getFullYear()+""+monthtt+""+datee;
                        let allCurrentExpenses = expenseBasedOnDate[dateAttr];
                        if(allCurrentExpenses==null){
                            allCurrentExpenses = [];
                        }
                        let expenseAmount = 0;
                        for(var j = 0; j < allCurrentExpenses.length; j++){
                            let expenseData = allCurrentExpenses[j];
                            expenseAmount += expenseData.amount;
                        }
                        tmp += `
                            <div date='`+dateAttr+`' class="d-flex flex-column flex-wrap myc-date-header `+classes+`" id="myc-date-header-` + i + `">
                                <div class="myc-date-number">` + d.getDate() + today + `</div>
                                <div class="myc-date-display">` + settings.weekdays[d.getDay()]+ `</div>
                                <hr>
                                <span class="">`+allCurrentExpenses.length+` Expenses | `+util.abbreviateNumber(expenseAmount)+`</span>
                            </div>
                        `;
                        $('#spinner').hide();
                    }



                    var ret = `<div id="myc-dates-container" class="weekly-dates-container d-flex justify-content-around">` + tmp + `</div>`;                
                    return ret;
                }
    
    
                // when last week was pressed
                this.on('click', '#myc-prev-week', function() {
                    settings.startDate = settings.startDate.addDays(-7);
                    render(instance);
        
                    if ($.isFunction(onClickNavigator)) {
                        onClickNavigator.call(this, ...arguments, instance);
                    }

                    addDateFetchLister()
                    $('#myc-dates-container .myc-date-header ').last().click();
                });
        
                // when next week is pressed
                this.on('click', '#myc-next-week', function() {
                    settings.startDate = settings.startDate.addDays(7);
                    render(instance);
        
                    if ($.isFunction(onClickNavigator)) {
                        onClickNavigator.call(this, ...arguments, instance);
                    }
                    addDateFetchLister()
                    $('#myc-dates-container .myc-date-header ').first().click();
                });
        
                var render = async function() {
                    var ret = `
                        <div id="myc-container">
                            <div id="myc-nav-container">` + instance.getNavControl() + `</div>
                            <div id="myc-week-container">
                            <div id="myc-dates-container">` + await instance.getDatesHeader() + `</div>
                            <div id="myc-available-time-container">` + `</div>
                            </div>
                        </div>
                    `;
                    instance.html(ret);
                    addDateFetchLister();
                    findAllExpenseDetails(moment().format('YYYYMMDD'),moment().format('YYYYMMDD'),'Last 7 Days ',false,'myc-available-time-container')
                };
        
                render();

                

                function addDateFetchLister (){
                    $('.myc-date-header').off();
                    $('.myc-date-header').click((e)=>{
                        let element = $(e.target).closest('.myc-date-header');
                        let date = $(element).attr('date');
                        $('.active-weekly-day').removeClass('active-weekly-day');
                        $(element).addClass('active-weekly-day');
                        findAllExpenseDetails(date,date,'Weekly',true,'myc-available-time-container')
                    })

                    $('#myc-current-month-year-container').off();
                    $('#myc-current-month-year-container').click(()=>{
                        let date = $(this).attr('date');
                        createMountPoint('Monthly')
                        $('.daterangepicker li[data-range-key=Monthly]').click();
                        $('#date-range-type').text('Monthly')
                    });
                }

            };

        })(jQuery);

        $('#weekly-view').html('');
        $('#weekly-view').markyourcalendar({ startDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()-6)});


        weeklyTabInitialized = true;


    }
    
    function mountCalendarExpensesSection() {
        $('.monthly-view').show();
        calendarMounted = true;
    }
    
    function mountRecentExpensesSection(){
        $('#expense-card-container').show();
    } 

    function unmountWeeklyExpenses(){ 

        $('#weekly-view').html(""); 
        weeklyTabInitialized = false; 
    }
    
    function unmountRecentExpenses(){ 
        $('#expense-card-container').hide() 
    }

    function unmountCalendar() {
        $('.monthly-view').hide();
        calendarMounted = false;
    }

}

function mountCreateExpenseForm(){  
    // Removing old forms from dom to prevent duplicate elements on form selection
    $('.new-expense-form .modal-content').html('');
    $('.edit-expense-form .modal-content').html('');

    // Clone form to DOM
    let newExpenseFormClone = document.getElementById('tt-new-expense-form').content.cloneNode(true);
    $('#newRecord .modal-content').html($(newExpenseFormClone));
    totalWalletSplits=1;

    let currTime = moment().format('YYYY-MM-DD HH:mm').split(" ").join("T");

    
    expenseFormUtil.listWalletsInForm();
    expenseFormUtil.listCategoriesInForm()
    expenseFormUtil.listTagsInForm();
    expenseFormUtil.setDateTimeInForm(currTime);    // Set current time initially
    $('#all-wallets-options').val(-100);
    

    $('#split-wallet').click(()=>expenseFormUtil.splitWalletHandler())       // Split expense ampunt 
    $('#expense-more').click(()=>extendForm());             // Extend the expense creation form      
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


            userSpendOn = months[month]+" "+dayOfMonth+", "+year+", "+util.to12Format(time+":03");
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
            await createTransactions(expenseInfoo).then((data)=> {
                $('#newRecord .btn-close').click();
                $('#spinner').css('display','none');
                updateHeader();
                pushExpenseToSection(data);

                // let newExpenseData = previousExpenseFetch.expenseData.data.expenses;
                
                // let newMomentPlace = moment(data.data.transactionInfo.spendOn, 'MMM D, YYYY, h:mm:ss a');
                // let insertionIndex = 0;
                // for(let kj=0; kj<newExpenseData.length; kj++){
                //     // console.log(kj)
                //     let iter = moment(newExpenseData[kj].transactionInfo.spendOn, 'MMM D, YYYY, h:mm:ss a');
                    
                //     if(iter.isBefore(newMomentPlace)){
                //         // console.log(iter.format('MMM D, YYYY, h:mm:ss a'));
                //         // console.log(newMomentPlace.format('MMM D, YYYY, h:mm:ss a'));
                //         insertionIndex = kj;
                //         break;
                //     }

                // }
                // newExpenseData.splice(insertionIndex, 0, data.data);
                
                // console.log(newExpenseData)
                

                // repopulateExpenseDetails(false);
                util.handleApiResponse(data,"Expense Created ✅ ");
                commonService.fetchNotifications();
            })

        }

    }

    function extendForm(){
        $('.more-expense-info').css('display', 'block');
        $('#expense-more').css('display', 'none');
    }
}


// To handle case where newly created expense is need to be pushed to existing date section
function pushExpenseToSection(expenseData){

    let createdDate = moment(expenseData.data.transactionInfo.spendOn, 'MMM DD, YYYY').format('DD-MMM-YYYY');
    if($('.date-grouping[date='+createdDate+']').length==0){
        $('#reload-expenses').click();
        return;
    }
    $('.date-grouping[date='+createdDate+']').parent().after('<div id="justCreated"></div>');

    let expense = expenseData.data;

    let wallets = new Array();
    for (const [key, value] of Object.entries(expense.walletSplits)){
        let searched = null;
        searched = (userWalletsMap[key])
        if(searched!=null)  wallets.push(searched);
        else if(key<0){
            searched = {
                "id": -100,
                "name": "Wallet not linked",
                "type": "Other",
                "archiveWallet": false,
                "balance": 1000,
                "excludeFromStats": false,
                "walletInfo": {
                    "note": ""
                }
            }
            wallets.push(searched)
        }
    }

    let categoryid = expense.transactionInfo.categoryId;
    let categoryInfo = (userCategoriesMap[categoryid]);
    if(categoryInfo==null){
        findCategoryById(categoryid).then((data)=>{
            categoryInfo = data.data;
            populateExpense(wallets,expense,categoryInfo,'justCreated');
            $('#justCreated').attr('id','');
            updateExistingDateSectionBalance(expenseData);
        })
    }else{
        populateExpense(wallets,expense,categoryInfo,'justCreated');
        $('#justCreated').attr('id','');
    
        updateExistingDateSectionBalance(expenseData);
    }


}

function replaceExpenseInSection(expenseData){
    let expenseId = expenseData.data.id;   
    $('#editExpenseForm'+expenseId).remove();
    let element = $('.expense-card[expense-id="' + expenseId+'"');
    $(element).replaceWith("<div id='justCreated'></div>");

    let expense = expenseData.data;

    let wallets = new Array();
    for (const [key, value] of Object.entries(expense.walletSplits)){
        let searched = null;
        searched = (userWalletsMap[key])
        if(searched!=null)  wallets.push(searched);
        else if(key<0){
            searched = {
                "id": -100,
                "name": "Wallet not linked",
                "type": "Other",
                "archiveWallet": false,
                "balance": 1000,
                "excludeFromStats": false,
                "walletInfo": {
                    "note": ""
                }
            }
            wallets.push(searched)
        }
    }

    let categoryid = expense.transactionInfo.categoryId;
    let categoryInfo = (userCategoriesMap[categoryid]);;


    populateExpense(wallets,expense,categoryInfo,'justCreated');
    $('#justCreated').attr('id','');

}

// Update existing date section balance
function updateExistingDateSectionBalance(expenseData){
    let createdDate = moment(expenseData.data.transactionInfo.spendOn, 'MMM DD, YYYY').format('DD-MMM-YYYY');
    let existingAmount = +($('.date-grouping[date='+createdDate+'] .days-expense').text()).split(" ")[1];
    $('.date-grouping[date='+createdDate+'] .days-expense').text(existingAmount+expenseData.data.amount);
}

function mountEditExpenseForm(expenseId){

    // Removing old forms from dom to prevent duplicate elements on form selection

    $('.new-expense-form .modal-content').html('');
    $('.edit-expense-form .modal-content').html('');
    

    // Mount form to the dom

    $('#editExpenseForm'+expenseId+' .modal-content').html('');
    let newEditFormSelector = '#editExpenseForm'+expenseId;
    let newEditForm = $('#tt-new-expense-form')[0].content.cloneNode(true);
    $(newEditForm).appendTo(newEditFormSelector+ ' .modal-content');
    $('.more-expense-info').css('display', 'block');
    $('#expense-more').css('display', 'none');
    $('#split-wallet').click(()=>expenseFormUtil.splitWalletHandler())       // Split expense ampunt 


    usingNewCategory = false;
    
    

    expenseFormUtil.listWalletsInForm(expenseId);
    expenseFormUtil.listCategoriesInForm(expenseId)
    insertExpenseData(expenseId);
    


    // Populate old data to edit form
    async function insertExpenseData(expenseId){

        await findTransactionsById(expenseId).then((data)=>{ insertExpenseDataToForm(data.data)})

        async function insertExpenseDataToForm(expenseData){

            // Parse time to inject into date time input box
            let form =  $('#editExpenseForm'+expenseId+' .modal-content');
            let time = expenseData.transactionInfo.spendOn.split(" ")[1].split(":");
            time = time[0]+":"+time[1];
            time  = (expenseData.transactionInfo.spendOn.split(" ")[0]+"T"+time);


            $(form).find('.modal-title').text("Edit Expense")
            $(form).find('#save-expense-btn').attr("id","editexp-submit-btn");
            $(form).find('#expense-time').val(time);
            $(form).find('#expense-name').val(expenseData.transactionInfo.reason);
            $(form).find('#all-categories-options').val(expenseData.transactionInfo.categoryId);
            $(form).find('#expense-note').val(expenseData.transactionInfo.note);
            expenseFormUtil.listTagsInForm((expenseData.transactionInfo.tagId));
            


            // Add all wallet split to DOM
            let walletSplits = expenseData.walletSplits;
            let  initialWalletSplit =  $(form).find('.wallet-split1');
            let filledFirstWalletSplit = false;
            totalWalletSplits = 0;
            for(const walletId in walletSplits){
                if(!filledFirstWalletSplit){
                    filledFirstWalletSplit = true;

                    if($(initialWalletSplit).find(".form-wallet-list option[value='"+walletId+"']").length == 0){
                        $(initialWalletSplit).find('.form-wallet-list').val(-100);
                    }else{
                        $(initialWalletSplit).find('.form-wallet-list').val(walletId);
                    }
                    $(initialWalletSplit).find('#expense-amount').val(walletSplits[walletId]);
                }else{
                    let newWalletSplit = $(initialWalletSplit).clone();
                    newWalletSplit.removeClass('wallet-split1');

                    if($(newWalletSplit).find(".form-wallet-list option[value='"+walletId+"']").length == 0){
                        $(newWalletSplit).find('.form-wallet-list').val(-100);
                    }else{
                        $(newWalletSplit).find('.form-wallet-list').val(walletId);
                    }

                    $(newWalletSplit).find('#expense-amount').val(walletSplits[walletId]);
                    $(form).find('#all-wallet-splits').append(newWalletSplit);
                }
                totalWalletSplits++;
            }


            // Add remove option to all wallet splits
            if(totalWalletSplits>1) $('.w-split').append('<i class="far fa-times-circle"></i>');
            $('.w-split').find('.far').click((event)=>{
                $(event.target).closest('.w-split').remove();
                totalWalletSplits--;
                if(totalWalletSplits==1){
                    $('.w-split').find('.fa-times-circle').remove();
                    return;
                }
            });

            // Save button Handler
            $(form).find('#editexp-submit-btn').click(()=>{ updateExpenseDetails(); })

        }

    }

    // Submit the form to the api
    async function updateExpenseDetails(){

        let form =  $('#editExpenseForm'+expenseId+' .modal-content');

        let totalAmount = 0;
        let reason =  $(form).find('#expense-name').val();
        
        let spendOn = null;
        let userSpendOn = $(form).find('#expense-time').val();
        spendOn = userSpendOn;
        let categoryId = $(form).find('#all-categories-options').val();
        let note =  $(form).find('#expense-note').val();
        let tagInfo = [];

        for(let i = 0; i < formSelectedTags.length; i++) tagInfo.push(+(formSelectedTags[i]));

        // Setting todays date for spend on date
        if(userSpendOn.length>0){

            let time =  userSpendOn.split("T")[1];
            userSpendOn = new Date(userSpendOn);

            const year = userSpendOn.getFullYear(); // 2017
            const month = userSpendOn.getMonth(); // 11
            const dayOfMonth = userSpendOn.getDate(); // 7


            userSpendOn = months[month]+" "+dayOfMonth+", "+year+", "+(time+":03");
            spendOn = userSpendOn;
            
        }

        let walletSplits ={};
        let allWalletSplitValues =  $(form).find('.w-split');

        for(let k=0; k<allWalletSplitValues.length; k++){   
            let amount = $(allWalletSplitValues[k]).find('#expense-amount').val();
            let walletId = $(allWalletSplitValues[k]).find('.form-wallet-list').val();
            if(walletSplits[walletId]>0){
                walletSplits[walletId]+= +amount;
            }else{
                walletSplits[walletId]= +amount;
            }
            totalAmount+= (+amount);
        }


        spendOn = spendOn.split(" ");
        let time = spendOn[3].split(":");
        time = time[0]+":"+time[1]+":"+time[2];
        spendOn = spendOn[0]+" "+spendOn[1]+" "+spendOn[2]+" "+util.to12Format(time);
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
            if(usingNewCategory==true) expenseInfo.transactionInfo.categoryId = await expenseFormUtil.createNewCategory();    
            $('.edit-expense-form .btn-close').click();
            updateExpenseApiCall(expenseInfo)
        }


        // Create expense API call to the server
        async function updateExpenseApiCall(expenseInfoo){
            expenseInfoo = JSON.stringify(expenseInfoo)
            $('#spinner').css('display','block');
            updateTransactionsById(expenseId,expenseInfoo).then((data)=> {
                $('#spinner').css('display','none');
                $('.modal-backdrop').remove();
                util.handleApiResponse(data,"Expense Edited ✏️ ");
                updateHeader();
                replaceExpenseInSection(data);
                // repopulateExpenseDetails(false);
                commonService.fetchNotifications();
            });
            $('body').css('overflow', 'scroll');
        }


    }

}

async function updateHeader(timeRange){


    // Show current set range total expense in header container
    if(timeRange==null || timeRange.length==0 ){ timeRange = localStorage.getItem("spendingsBannerTime"); }
    if(timeRange==null) timeRange = "This Week";
    let dateRanges = {
        'Today': [moment(), moment()],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'This Week': [moment().startOf('week'), moment()],
        'This Month' : [moment().startOf('month'), moment().endOf('month')],
    }
    let st = dateRanges[timeRange][0].format('YYYYMMDD');
    let end = dateRanges[timeRange][1].format('YYYYMMDD');

    let expenseData = null;
    await findTransactions(st,end,'expenses').then((data)=>{
        if(data==null) return;
        expenseData = data.data.expenses
    });

    let rangeExpense = 0;
    if(expenseData==null) return;
    for(let i=0; i<expenseData.length; i++) rangeExpense+=expenseData[i].amount;
    

    $('.reporting-days-total').text(rangeExpense);
    $('#mi-bal-amount').text(util.moneyFormat(rangeExpense));
    $('.main-balance .header-timespan ').text(", "+timeRange+"");


    initiateBannerListeners();
    function initiateBannerListeners(){

        $('.htimespan-select .fa-chevron-down').off();
        $('.htimespan-select .fa-chevron-down').click(()=>{
            $('.htimespan-select .options').toggle();
        })

        $('.htimespan-select .option').off()
        $('.htimespan-select .option').click((e)=>{
            $('.htimespan-select .options').toggle();
            localStorage.setItem("spendingsBannerTime",$(e.target).text());
            let timeSpan = $(e.target).text();
            updateHeader(timeSpan);
        });

    }

    $('#create-expense-btn').off();
    $('#create-expense-btn').click(()=>{ mountCreateExpenseForm() });
}

function initiateSettingsListeners(){

    $('#dashboard-view').change(()=>{
        let config = localStorage.getItem("config") == null ? {} : JSON.parse(localStorage.getItem("config"));
        config.defaultView = $('#dashboard-view').val();
        localStorage.setItem("config",JSON.stringify(config));
        util.handleApiResponse({statusCode: 200},"Default view updated");
    })

    $('#categories-view-btn').click(()=>{
        $('#dashboard-settings .modal-body').html('');
        mountCategories($('#dashboard-settings .modal-body'));
    })
    
    $('#tags-view-btn').click(()=>{
        $('#dashboard-settings .modal-body').html('');
        mountTags($('#dashboard-settings .modal-body'));
    })
}

function mountCategories(container){
    $(container).append('<div class="h3">Categories</div>');
    for(let i=0;i<userCategories.length;i++){
        let newCategoryList = $('<div class="d-flex justify-content-between align-items-center border p-3 mb-1 cat-list-section ">'+
                                    '<span class="cname h5"></span>'+
                                    '<div>'+
                                        '<span class="delete-btn me-1 btn btn-danger" category-id='+userCategories[i].id+'><i class=" fas fa-trash"></i></span>'+
                                    '</div>'+
                                '</div>');

        $(newCategoryList).find('.cname').text(userCategories[i].name);
        container.append(newCategoryList);
    }

    if(userCategories.length==0){
        $(container).append('<hr>');
        $(container).append('<div class="h4">No categories found.</div>');
        $(container).append('<div>One can be created when adding an expense.</div>');
    }

    $('.cat-list-section .delete-btn').click((e)=>{
        let element = $(e.target).closest('.delete-btn');
        let categoryId = $(element).attr('category-id');

        deleteCategoryById(categoryId).then((data)=>{
            util.handleApiResponse(data,"Category deleted successfully","Category deletion failed");
            $(element).closest('.cat-list-section').remove();
        });
    });
}

function mountTags(container){
    $(container).append('<div class="h3">Tags</div>');
    for(let i=0;i<userTags.length;i++){
        let newCategoryList = $('<div class="d-flex justify-content-between align-items-center border p-3 mb-1 tag-list-section">'+
                                    '<span class="cname h5"></span>'+
                                    '<div>'+
                                        // '<span class="delete-btn me-1 btn btn-warning" tag-id="'+userTags[i].id+'"><i class=" fas fa-edit"></i></span>'+
                                        '<span class="delete-btn me-1 btn btn-danger" tag-id="'+userTags[i].id+'"><i class=" fas fa-trash"></i></span>'+
                                    '</div>'+
                                '</div>');

        $(newCategoryList).find('.cname').text(userTags[i].name);
        container.append(newCategoryList);
    }

    if(userTags.length==0){
        $(container).append('<hr>');
        $(container).append('<div class="h4">No tags found.</div>');
        $(container).append('<div>One can be created when adding an expense.</div>');
    }

    $('.tag-list-section .delete-btn').click((e)=>{
        let element = $(e.target).closest('.delete-btn');
        let tagId = $(element).attr('tag-id');
        
        deleteTagById(tagId).then((data)=>{
            util.handleApiResponse(data,"Tag deleted successfully","Tag deletion failed");
            $(element).closest('.tag-list-section').remove();
        })
    });
}




$('#reload-expenses').click(()=>{
    findAllExpenseDetails(previousExpenseFetch["expenseFrom"],previousExpenseFetch["expenseTo"],previousExpenseFetch["timeSpan"],previousExpenseFetch["refreshExpenseContainer"],previousExpenseFetch["containerId"]);
});


$('.settings-btn').click(()=>{
    $('.set-home').show();
    $('#category-set .label').append('('+userCategories.length+')');
    $('#tags-set .label').append('('+userTags.length+')');
    let dashboard = $('#tt-dashboard-settings')[0].content.cloneNode(true)
    $('#dashboard-settings .modal-body').html("");
    $('#dashboard-settings .modal-body').append(dashboard);
    $('#dashboard-view').val(currTimeSpan); 

    initiateSettingsListeners();

})

