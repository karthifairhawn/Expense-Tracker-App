import * as walletService from '../apis/wallets.js';
import * as categoriesService from '../apis/categories.js';
import * as tagsService from '../apis/tags.js';
import * as transactionService from '../apis/transactions.js';


export var to12Format = (time) => {
    // Check correct time format and split into components
    time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

    if (time.length > 1) { // If time format correct
    time = time.slice (1);  // Remove full string match value
    time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join (''); // return adjusted time or original string
}
let userCardWallets = [];
let userNonCardWallets = [];

let userTags = null;
let userTagsMap = {};

let userCategories = null;
let userCategoriesMap = {};
export let userWallets = [];
let userWalletsMap = {};

var formSelectedTags = [];  
let totalWalletSplits = 1;
let usingNewCategory = false;
let basicFetchd = false;


export async function findBasicEntities(){
    let promisePending = [];
    promisePending.push(categoriesService.findCategories());
    promisePending.push(walletService.findWallets())
    promisePending.push(tagsService.findTags());

    await Promise.all(promisePending).then((values)=>{

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
            // console.log(wallets)
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



export let expenseFormUtil = {
    
    listWalletsInForm : async function listWalletsInForm(){

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
        allOptions += '<option value="-1"> &#xf05a; Select wallet</option>';


        $('#all-wallets-options').html(allOptions);
        $('#rpayment-wallet').html(allOptions);


    },

    listCategoriesInForm : async function listCategoriesInForm(){

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
            formSelectedTags.push(item)
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
            tagsService.createTag(JSON.stringify({
                "name":""+name,
                "color":"#44545"
            })).then((data)=>{
                allTagsId.push(data.data.id);
                formSelectedTags.push(data.data.id);
                handleApiResponse(data,"Tag Created ✅");
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
            toastResponse(data, "Category Creation Success","Category Creation Failed");
            handleApiResponse(data,"Category Created ✅ ");
            categoryId = data.data.id;
        })
        return categoryId;
    },

    validateExpenseInfo : function validateExpenseInfo(expenseInfo){ 

        let spendOn = expenseInfo.transactionInfo.spendOn;
        
        let valid = true;
        valid = isGreaterThanZero(expenseInfo.amount,$('#expense-amount')) && valid;
        valid = isLessThanN(expenseInfo.amount,10000000,$('#expense-amount')) && valid;
        valid = isLessThanN(new Date(spendOn).getTime(),new Date().getTime()+1,$('#expense-time')) && valid;
        valid = isNotEmpty(expenseInfo.transactionInfo.reason,$('#expense-name')) && valid;       
        if(usingNewCategory){
            valid = isNotEmpty($('#new-category-input').val(),$('#new-category-input')) && valid;
        }

        let allWalletSplitValues = $('#create-new-expense-form .w-split');

        for(let k=0; k<allWalletSplitValues.length; k++){
            let amount = $(allWalletSplitValues[k]).find('#expense-amount').val();
            valid = isGreaterThanN(amount,0,$(allWalletSplitValues[k]).find('#expense-amount')) && valid;
        }
        return valid;
    }

}

export var to24Format = (time) => {
    let hours = Number(time.match(/^(\d+)/)[1]);
    let minutes = Number(time.match(/:(\d+)/)[1]);
    let AMPM = time.match(/\s(.*)$/)[1];
    if(AMPM == "PM" && hours<12) hours = hours+12;
    if(AMPM == "AM" && hours==12) hours = hours-12;
    let sHours = hours.toString();
    let sMinutes = minutes.toString();
    if(hours<10) sHours = "0" + sHours;
    if(minutes<10) sMinutes = "0" + sMinutes;
    return (sHours + ":" + sMinutes);
}

export var moneyFormat =  (n)=>{
    return "₹ "+(Math.round(n * 100) / 100).toLocaleString();
}

$('#toastbtn').hide();
export function handleApiResponse(data,success,error){
    
    let titleColor = getColorCode(data+"".substring(0,1));
    let message = "";


    var toastElList = [].slice.call(document.querySelectorAll('.toast'))
    var toastList = toastElList.map(function(toastEl) {
      return new bootstrap.Toast(toastEl)
    })

    toastList.forEach(toast => toast.show()) 
    $('.toast-header').css('background-color',getColorCode(data.statusCode))


    if((data.statusCode+"").charAt(0)=='2'){
        if(success== undefined || success.length == 0 || success == null)  {
            message = "Operation Success ✅";
        }else{
            message = success;
        }
    }else if((data.statusCode+"").charAt(0)=='4' || (data.statusCode+"").charAt(0)=='5'){
        if(error== undefined || error.length == 0 || error == null)  {
            message = getStatusMessage(data.statusCode);
        }else{
            message = error;
        }
    } 
    $('.toast-body').text(message);

    $('#toastbtn').click();

    function getColorCode(val){
        val = (val+"").charAt(0);
        if(val==2) return '#4caf50'
        else if(val==4) return '#ff9800'
        else if(val==5) return '#f44336'
        else return '#ff9800'
    }

    function getStatusMessage(ind){
        let codes ={
            x100 : 'Continue ',
            x101 : 'Switching Protocols ',
            x102 : 'Processing ',
            x200 : 'OK ',
            x201 : 'Created ',
            x202 : 'Accepted ',
            x203 : 'Non - authoritative Information ',
            x204 : 'No Content ',
            x205 : 'Reset Content ',
            x206 : 'Partial Content ',
            x207 : 'Multi - Status ',
            x208 : 'Already Reported ',
            x226 : 'IM Used ',
            x300 : 'Multiple Choices ',
            x301 : 'Moved Permanently ',
            x302 : 'Found ',
            x303 : 'See Other ',
            x304 : 'Not Modified ',
            x305 : 'Use Proxy ',
            x307 : 'Temporary Redirect ',
            x308 : 'Permanent Redirect ',
            x400 : 'Bad Request ',
            x401 : 'Unauthorized ',
            x402 : 'Payment Required ',
            x403 : 'Forbidden ',
            x404 : 'Not Found ',
            x405 : 'Method Not Allowed ',
            x406 : 'Not Acceptable ',
            x407 : 'Proxy Authentication Required ',
            x408 : 'Request Timeout ',
            x409 : 'Conflict ',
            x410 : 'Gone ',
            x411 : 'Length Required ',
            x412 : 'Precondition Failed ',
            x413 : 'Payload Too Large ',
            x414 : 'Request - URI Too Long ',
            x415 : 'Unsupported Media Type ',
            x416 : 'Requested Range Not Satisfiable ',
            x417 : 'Expectation Failed ',
            x418 : 'I’m a teapot ',
            x421 : 'Misdirected Request ',
            x422 : 'Unprocessable Entity ',
            x423 : 'Locked ',
            x424 : 'Failed Dependency ',
            x426 : 'Upgrade Required ',
            x428 : 'Precondition Required ',
            x429 : 'Too Many Requests ',
            x431 : 'Request Header Fields Too Large ',
            x444 : 'Connection Closed Without Response ',
            x451 : 'Unavailable For Legal Reasons ',
            x499 : 'Client Closed Request ',
            x500 : 'Internal Server Error ',
            x501 : 'Not Implemented ',
            x502 : 'Bad Gateway ',
            x503 : 'Service Unavailable ',
            x504 : 'Gateway Timeout ',
            x505 : 'HTTP Version Not Supported ',
            x506 : 'Variant Also Negotiates ',
            x507 : 'Insufficient Storage ',
            x508 : 'Loop Detected ',
            x510 : 'Not Extended ',
            x511 : 'Network Authentication Required ',
            x599 : 'Network Connect Timeout Error',
        }
        return codes["x"+ind];
    }
}


// Validator Functions

export function isNotEmpty(val,element){
    let result = true;
    if(val == undefined || val == null || val.length == 0 || val =='null') result =  false;
    highlightElement(element,result);
    return result;
}

export function isNumber(val,element){
    let result = false;
    if(!isNaN(val)) result = true;
    highlightElement(element,result);
    return result;
}

export function isLessThanN(val,N,element) {
    let result = false;
    N = parseInt(N);
    if(isNumber(val)){
        if(val<N) result = true;
    }
    highlightElement(element,result);
    return result;
}

export function isGreaterThanN(val,N,element) {
    let result = false;
    N = parseInt(N);
    if(isNumber(val)){
        if(parseInt(val)>N) result = true;
    }
    highlightElement(element,result);
    return result;
}

export function isMobileNumber(val,element){
    let result = false;
    if(isNumber(val)){
        if((val+"").length==10) result = true;
    }
    highlightElement(element,result);
    return result;
}

export function isPositiveNumber(val,element){
    let result = false;

    if(isNumber(val)){
        if(parseInt(val)>=0) result = true;
    }
    highlightElement(element,result);
    return result;
}

export function isGreaterThanZero(val,element){
    let result = false;

    if(isNumber(val)){
        if(parseInt(val)>0) result = true;
    }
    highlightElement(element,result);
    return result;
}

export function isIfscCode(val,element){
    let result = false;
    var reg = /[A-Z|a-z]{4}[0][a-zA-Z0-9]{6}$/;    
    if (val.match(reg)) result = true;
    highlightElement(element,result);
    return result;
}

export function toastResponse(statusCode, success, fail){
    console.log(statusCode);
}

function highlightElement(element,isValid){
    if(isValid) $(element).css('border','1px solid #ced4da');
    else $(element).css('border','1px solid red');
}
