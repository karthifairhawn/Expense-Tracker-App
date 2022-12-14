import {findTransactions,findTransactionsById,createTransactions,deleteTransactionsById,updateTransactionsById, findTransactionsPaginated} from '../apis/transactions.js';
import {findWalletById, findWallets,createWallet,deleteWalletById,updateWalletById} from '../apis/wallets.js';
import {findTagById,findTags,createTag} from '../apis/tags.js';
import {findCategoryById,findCategories,createCategory} from '../apis/categories.js';

import * as util from './util.js';

// Mount Dashboard by default
var currTimeSpan = 'Recent';
let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
let colorOne = ['d6eb70','cc7aa3','85cc70','99ff66','a3f5f5','9999f5','ada399','ffd6ff','f5b87a','fadbbd','99b8cc'];
let colorTwo = ['ebf5b8','e6bdd1','c2e6b8','ccffb3','d1fafa','ccccfa','d6d1cc','ffebff','fadbbd','c2c2d1','ccdbe6'];
let isMonthlyViewOverriden = false; 
$('.nav-item[tabs=dashboard]').addClass('active')


refreshDashboard();


async function refreshDashboard(){ 


    let userCardWallets = [];
    let userNonCardWallets = [];
    let totalBalance = 0;

    let userTags = null;
    let userTagsMap = {};

    let userCategories = null;
    let userCategoriesMap = {};
    
    let userWallets = [];
    let userWalletsMap = {};

    var formSelectedTags = [];  
    let totalWalletSplits = 1;
    let usingNewCategory = false;
    

    let expenseFormUtil = {
        
        listWalletsInForm : async function listWalletsInForm(){

            let allOptions = '';
            if(userWallets.length==0){
                $('#newRecord .modal-body').html('<div class="h3">Please add wallet to create expense.<div> <br> <a href="wallets.html" class="btn btn-primary">Create Wallet</a>')
                return false;
            }

            for(let i=0;i<userWallets.length;i++){
                let overdraft = "";
                if(userWallets[i].balance<0) overdraft = "(      overdraft)";
                let option = '<option value="'+userWallets[i].id+'" >'+userWallets[i].name+overdraft+'</option>';
                allOptions+=(option);
            }
            $('#all-wallets-options').html(allOptions);

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
                    $('#new-category-icon').css('display','block');
                    $('#form-category-icon').hide();
                    let allIcons = ['f641','f2b9','f2bb','f042','f5d0','f037','f039','f036','f038','f461','f0f9','f2a3','f13d','f103','f100','f101','f102','f107','f104','f105','f106','f556','f644','f5d1','f187','f557','f358','f359','f35a','f35b','f0ab','f0a8','f0a9','f0aa','f063','f060','f061','f062','f0b2','f337','f338','f2a2','f069','f1fa','f558','f5d2','f29e','f559','f77c','f77d','f55a','f04a','f7e5','e059','e05a','f666','f24e','f515','f516','f05e','f462','f02a','f0c9','f433','f434','f2cd','f244','f240','f242','f243','f241','f236','f0fc','f0f3','f1f6','f55b','f647','f206','f84a','f1e5','f780','f1fd','f517','f6b6','f29d','f781','f032','f0e7','f1e2','f5d7','f55c','f02d','f6b7','f7e6','f518','f5da','f02e','f84c','f850','f853','f436','f466','f49e','e05b','f468','f2a1','f5dc','f7ec','f0b1','f469','f519','f51a','f55d','f188','f1ad','f0a1','f140','f46a','f207','f55e','f64a','f1ec','f133','f073','f274','f783','f272','f271','f273','f784','f030','f083','f6bb','f786','f55f','f46b','f1b9','f5de','f5df','f5e1','f5e4','f8ff','f0d7','f0d9','f0da','f150','f191','f152','f151','f0d8','f787','f218','f217','f788','f6be','f0a3','f6c0','f51b','f51c','f5e7','f1fe','f080','f201','f200','f00c','f058','f560','f14a','f7ef','f439','f43a','f43c','f43f','f441','f443','f445','f447','f13a','f137','f138','f139','f078','f053','f054','f077','f1ae','f51d','f111','f1ce','f64f','f7f2','f328','f46c','f46d','f017','f24d','f20a','f0c2','f381','f73b','f6c3','f73c','f73d','f740','f6c4','f743','f382','f561','f121','f126','f0f4','f013','f085','f51e','f0db','f075','f27a','f651','f4ad','f7f5','f4b3','f086','f653','f51f','f14e','f066','f422','f78c','f562','f563','f564','f0c5','f1f9','f4b8','f09d','f125','f565','f654','f05b','f520','f521','f7f7','f1b2','f1b3','f0c4','f1c0','f2a4','f747','f108','f655','f470','f522','f6cf','f6d1','f523','f524','f525','f526','f527','f528','f566','f5eb','f7fa','f529','f567','f471','f6d3','f155','f472','f474','f4b9','f52a','f52b','f192','f4ba','f019','f568','f6d5','f5ee','f569','f56a','f6d7','f44b','f793','f794','f6d9','f044','f7fb','f052','f141','f142','f0e0','f2b6','f658','f199','f52c','f12d','f796','f153','f362','f12a','f06a','f071','f065','f424','f31e','f35d','f360','f06e','f1fb','f070','f863','f049','f050','e005','f1ac','f52d','f56b','f182','f0fb','f15b','f15c','f1c6','f1c7','f1c9','f56c','f6dd','f56d','f1c3','f56e','f1c5','f56f','f570','f571','f477','f478','f1c1','f1c4','f572','f573','f574','f1c8','f1c2','f575','f576','f008','f0b0','f577','f06d','f7e4','f134','f479','f578','f6de','f024','f11e','f74d','f0c3','f579','f07b','f65d','f07c','f65e','f031','f44e','f04e','f52e','f119','f57a','f662','f1e3','f11b','f52f','f0e3','f3a5','f22d','f6e2','f06b','f79c','f79f','f000','f57b','f7a0','f530','f0ac','f57c','f57d','f57e','f7a2','f450','f664','f19d','f531','f532','f57f','f580','f581','f582','f583','f584','f585','f586','f587','f588','f589','f58a','f58b','f58c','f58d','f7a4','f7a5','f58e','f7a6','f0fd','f805','f6e3','f665','f4bd','f4be','e05c','f4c0','f4c1','f258','f806','f256','f25b','f0a7','f0a5','f0a4','f0a6','f25a','f255','f257','e05d','f259','f4c2','f4c4','e05e','f2b5','e05f','e060','f6e6','f807','f292','f8c0','f8c1','f6e8','f0a0','e061','e062','e063','e064','f1dc','f025','f58f','f590','f004','f7a9','f21e','f533','f591','f6ec','f6ed','f1da','f453','f7aa','f015','f6f0','f7ab','f0f8','f47d','f47e','f80d','f593','f80f','f594','f254','f253','f252','f251','f6f1','e065','f6f2','f246','f810','f7ad','f86d','f2c1','f2c2','f47f','f7ae','f03e','f302','f01c','f03c','f275','f534','f129','f05a','f033','f669','f595','f66a','f66b','f084','f11c','f66d','f596','f597','f598','f535','f66f','f1ab','f109','f5fc','e066','f812','f599','f59a','f59b','f59c','f5fd','f06c','f094','f536','f537','f3be','f3bf','f1cd','f0eb','f0c1','f195','f03a','f022','f0cb','f0ca','f124','f023','f3c1','f309','f30a','f30b','f30c','f2a8','f59d','f604','e067','f0d0','f076','f674','f183','f279','f59f','f5a0','f041','f3c5','f276','f277','f5a1','f222','f227','f229','f22b','f22a','f6fa','f5a2','f0fa','f11a','f5a4','f5a5','f538','f676','f223','f753','f2db','f130','f3c9','f539','f131','f610','f068','f056','f146','f7b5','f10b','f3cd','f0d6','f3d1','f53a','f53b','f53c','f53d','f5a6','f186','f5a7','f678','f21c','f6fc','f8cc','f245','f7b6','f001','f6ff','f22c','f1ea','f53e','f481','f247','f248','f613','f679','f700','f03b','f815','f1fc','f5aa','f53f','f482','f1d8','f0c6','f4cd','f1dd','f540','f5ab','f67b','f0ea','f04c','f28b','f1b0','f67c','f304','f305','f5ac','f5ad','f14b','f303','f5ae','e068','f4ce','f816','f295','f541','f756','f095','f879','f3dd','f098','f87b','f2a0','f87c','f4d3','f484','f818','f67f','f072','f5af','f5b0','e069','f04b','f144','f1e6','f067','f055','f0fe','f2ce','f681','f682','f2fe','f75a','f619','f3e0','f154','f011','f683','f684','f5b1','f485','f486','f02f','f487','f542','e06a','e06b','f12e','f029','f128','f059','f458','f10d','f10e','f687','f7b9','f7ba','f75b','f074','f543','f8d9','f1b8','f01e','f2f9','f25d','f87d','f3e5','f122','f75e','f7bd','f079','f4d6','f70b','f018','f544','f135','f4d7','f09e','f143','f158','f545','f546','f547','f548','f70c','f156','f5b3','f5b4','f7bf','f7c0','f0c7','f549','f54a','f70e','f7c2','f002','f688','f689','f010','f00e','f4d8','f233','f61f','f064','f1e0','f1e1','f14d','f20b','f3ed','e06c','f21a','f48b','f54b','f290','f291','f07a','f2cc','f5b6','f4d9','f2f6','f2a7','f2f5','f012','f5b7','f7c4','e06d','f0e8','f7c5','f7c9','f7ca','f54c','f714','f715','f7cc','f1de','f118','f5b8','f4da','f75f','f48d','f54d','f7cd','f7ce','f2dc','f7d0','f7d2','e06e','f696','f5ba','f0dc','f15d','f881','f15e','f882','f160','f884','f161','f885','f0dd','f162','f886','f163','f887','f0de','f5bb','f197','f891','f717','f110','f5bc','f5bd','f0c8','f45c','f698','f5bf','f005','f699','f089','f5c0','f69a','f621','f048','f051','f0f1','f249','f04d','f28d','f2f2','e06f','f54e','f54f','e070','e071','f550','f21d','f0cc','f551','f12c','f239','f0f2','f5c1','f185','f12b','f5c2','f5c3','f5c4','f5c5','f69b','f021','f2f1','f48e','f0ce','f45d','f10a','f3fa','f490','f3fd','f02b','f02c','f4db','f0ae','f1ba','f62e','f62f','f769','f76b','f7d7','f120','f034','f035','f00a','f009','f00b','f630','f491','f2cb','f2c7','f2c9','f2ca','f2c8','f165','f164','f08d','f3ff','f00d','f057','f043','f5c7','f5c8','f204','f205','f7d8','f71e','e072','f552','f7d9','f5c9','f6a0','f6a1','f722','f25c','f637','e041','f238','f7da','f224','f225','f1f8','f2ed','f829','f82a','f1bb','f091','f0d1','f4de','f63b','f4df','f63c','f553','f1e4','f26c','f0e9','f5ca','f0cd','f0e2','f2ea','f29a','f19c','f127','f09c','f13e','f093','f007','f406','f4fa','f4fb','f4fc','f2bd','f4fd','f4fe','f4ff','f500','f501','f728','f502','f0f0','f503','f504','f82f','f234','f21b','f505','f506','f507','f508','f235','f0c0','f509','e073','f2e5','f2e7','f5cb','f221','f226','f228','e085','e086','f492','f493','f03d','f4e2','f6a7','e074','e075','e076','f897','f45f','f027','f6a9','f026','f028','f772','f729','f554','f555','f494','f773','f83e','f496','f5cd','f193','f1eb','f72e','f410','f2d0','f2d1','f2d2','f72f','f4e3','f5ce','f159','f0ad','f497','f157','f6ad'];
                    let fontAwesomeIconeHtml = '';
                    for(let i=0;i<allIcons.length;i++) fontAwesomeIconeHtml+='<option style="font-weight:900" value="'+allIcons[i]+'">'+"&#x"+allIcons[i]+'</option>'
                    $('#new-category-icon').html(fontAwesomeIconeHtml);
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
                createTag(JSON.stringify({
                    "name":""+name,
                    "color":"#44545"
                })).then((data)=>{
                    allTagsId.push(data.data.id);
                    formSelectedTags.push(data.data.id);
                    util.handleApiResponse(data,"Tag Created ✅");
                })
                return true;
            }

            // Setting tag creation max length as 14
            $('.selectize-control input').attr('maxlength','14')
            console.log(formSelectedTags);

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
            let newCategoryIcon = $('#new-category-icon').val();
            let categoryId = null;

            let raw = {
                "name": newCategoryName,
                "imagePath": newCategoryIcon
            }
            raw = JSON.stringify(raw)

            await createCategory(raw).then((data)=>{
                util.toastResponse(data, "Category Creation Success","Category Creation Failed");
                util.handleApiResponse(data,"Category Created ✅ ");
                categoryId = data.data.id;
            })
            return categoryId;
        },

        validateExpenseInfo : function validateExpenseInfo(expenseInfo){ 

            let spendOn = expenseInfo.transactionInfo.spendOn;
            
            // console.log(<=);

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

    await findCategories().then((data)=> {
        userCategories= (data.data)
        for(let k=0; k<userCategories.length; k++){
            userCategoriesMap[userCategories[k].id] = userCategories[k];
        }
    });

    await findTags().then((data)=> {
        userTags = data.data;
        for(let k=0; k<userTags.length; k++){
            userTagsMap[userTags[k].id] = userTags[k];
        }
    });

    await findWallets().then((data)=> {
        data = data.data;
        for(const category in data){
            if(category =='Credit Card') userCardWallets.push(...data[category]);
            else userNonCardWallets.push(...data[category]);
            userWallets.push(...data[category]);
        }
        for(let wallet in userWallets) totalBalance += userWallets[wallet].balance;
    });

    for(let key in userWallets) userWalletsMap[userWallets[key].id] = userWallets[key];
    
    let template = document.getElementById('tt-balance-header').content.cloneNode(true);
    $(template).find('#total-acct-count').text(userWallets.length);
    $(template).find('#mi-bal-amount').text(util.moneyFormat(totalBalance));
    $('#balance-header').html('');
    $('#balance-header').append(template);
    

    mountExpenseSection();

    $('#create-expense-btn').click(()=>{ mountCreateExpenseForm() });


    function mountExpenseSection(){

        // TEMPLATE MOUNT ---- added date range selector to the section
        let dateRangeContainer = document.getElementById("date-range-selector");
        let dateRangeElement = document.getElementById("date-range-template");
        let clone = dateRangeElement.content.cloneNode(true);
        let pageNumber = 1;
        let pageSize = 15;
        $(dateRangeContainer).html('');
        dateRangeContainer.appendChild(clone);  

        // Hide monthly view section by default
        $('.monthly-view').hide();

        
        let listingExpenseDate = null;
        let daysTotalExpense = 0;
        let daysExpenseCount = 0
        let calendarMounted = false;

        initiateDateSelectorPlugin();
        updateHeader();
        


        // Fetch expense info or the selected date range  -- [TRIGGER = Any date range change in date selector plugin called at initiateDateSelectorPlugin()] 
        async function findAllExpenseDetails(expenseFrom,expenseTo,timeSpan,refreshExpenseContainer){   

            // Clearing up old expense section data
            listingExpenseDate = null;
            daysTotalExpense = 0;
            let rangeExpense = 0;
            let expenseData = null;
            $('#expense-card-container').show();
            $('.timespan').text(timeSpan)



            // Find all expense info from selected date range
            if(timeSpan!='Recent'){
                $("#expense-card-container").html("");
                await findTransactions(expenseFrom,expenseTo,'expenses').then((data)=>{
                    expenseData = data
                    if(expenseData.data.expenses.length == 0) zeroExpensesHandler();
                });
            }

            // Mount Expense Container Section for non month view
            if(timeSpan!='Monthly')  unmountCalendar();

            // Change layout according to view selected
            if(timeSpan=='Recent'){
                if(refreshExpenseContainer==true) $("#expense-card-container").html(""); // Remove old expense data
                await findTransactionsPaginated(pageNumber,pageSize,'expenses').then((data)=>expenseData = data);
            }else if(timeSpan=='Monthly'){
                if(!isMonthlyViewOverriden){
                    monthlyViewOverride();
                    isMonthlyViewOverriden = true;
                    $('#mycalendar').monthly({});
                }
                $('#expense-card-container').hide(); // Hide normal card view container
                mountCalendar();
            }


            // Add loading indicator at end of container
            if(refreshExpenseContainer==false && expenses.length==15){
                $('#expense-card-container').append('<div id="espinner" style="display: flex;align-items: center;justify-content: center;height:200px"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>')

                // Load more expenses when reached expense container end
                $('#expense-card-container').scroll(function(e){
    
                    // grab the scroll amount and the window height
                    var scrollAmount   = $('#expense-card-container').scrollTop();
                    var documentHeight = $('#expense-card-container').height();
                
                    // calculate the percentage the user has scrolled down the page
                    var scrollPercent = (scrollAmount / documentHeight) * 100;
                
                    if(scrollPercent > 90) {
                        $('#expense-card-container').off();
                        pageNumber++;
                        setTimeout( ()=>findAllExpenseDetails(null,null,'expenses',false),1500 )
                    }
                
                });
            }else $('#expense-card-container').find('#espinner').remove();


            let expenses = expenseData.data.expenses;
            for(let i=0; i<expenses.length; i++){ 
                
                // Find all wallets (search in already fetched wallets if not found get from server)
                let wallets = new Array();
                for (const [key, value] of Object.entries(expenses[i].walletSplits)){
                    let searched = null;
                    searched = (userWalletsMap[key])
                    if(searched!=null) wallets.push({data:searched});
                    else                await findWalletById(`${key}`).then((resp)=> wallets.push(resp.data));
                }
                
                // Find Category info
                let categoryInfo = {};
                (expenses[i].transactionInfo.categoryId==0) ? categoryInfo.name='General Expense' : categoryInfo= userCategoriesMap[expenses[i].transactionInfo.categoryId];
                
                // Add expense amount to currentRangeTotal and Populate
                rangeExpense+=expenses[i].amount;
                populateExpense(wallets,expenses[i],categoryInfo);

            }


        }

        // Fetch Wallet Split and tag info then populateExpense [Trigger = findAllExpenseDetails()]
        async function populateExpense(walletInfo,expense,categoryInfo){

            let allTagsInfo = [];

            let tagsIds = expense.transactionInfo.tagId;

            // Get all tags information
            for(let i=0;i<tagsIds.length;i++) allTagsInfo.push({data:userTagsMap[tagsIds[i]]});
            

            let expenseTemplate = $("#expense-card-template")[0];
            let expenseContainer = $("#expense-card-container")[0];
            let expenseTemplateClone = expenseTemplate.content.cloneNode(true);

            $(expenseTemplateClone).find('#editExpenseForm').attr('id','editExpenseForm'+expense.id);
            $(expenseTemplateClone).find('#inExpEditForm').attr('data-bs-target','#'+'editExpenseForm'+expense.id)

            // Grouping multiple days expense with dates and calculating per days's expense 
            if(expense.transactionInfo.spendOn.split(" ")[0]!=listingExpenseDate){
                daysExpenseCount = 1;
                daysTotalExpense = expense.amount;
                newDateSection(expense.transactionInfo.spendOn.split(" ")[0]); 
                listingExpenseDate = expense.transactionInfo.spendOn.split(" ")[0];
            }else{
                daysExpenseCount+=1;
                daysTotalExpense+=expense.amount;
                $('.days-expense'+listingExpenseDate).text(util.moneyFormat(daysTotalExpense)); 
                $('.dtb'+listingExpenseDate).find('.expenses-count').text(daysExpenseCount); 
            }

            expenseContainer.appendChild(expenseTemplateClone);
            let currentElement = document.getElementsByClassName("card")[document.getElementsByClassName("card").length-1];


            // Findign wallet Split;
            let walletArchiveIndicator =  null;
            for(let i=0; i<walletInfo.length;i++){
                // if(walletInfo[i].statusCode != 200){
                //     continue;
                // }
                walletArchiveIndicator = walletInfo[i].data.archiveWallet;
                let id = walletInfo[i].data.id;
                let newWalletSplit = $('<div class="wallet-split d-flex card-field"> <div class="w-50 account-name label"> Indian Bank </div> <div class="w-50 account-spend value"> 500 ₹ </div> </div>');
                $(newWalletSplit).find('.account-name').text(walletInfo[i].data.name);
                $(newWalletSplit).find('.account-spend').text(expense.walletSplits[id]+" ₹");
                $(currentElement).find(".wallet-splits").append(newWalletSplit);
            }

            // Finding wallet name
            let walletName = null;
            if(walletInfo.length == 1){
                walletName = (walletInfo[0]?.data?.name);
            }else{
                let accounts = walletInfo.length;
                walletName = +accounts+" Accounts "+'<i class="fa-solid fa-arrows-split-up-and-left"></i> '
            }


            // Format expense time
            let expenseTime = expense.transactionInfo.spendOn;
            expenseTime = formatExpenseTime(expenseTime);
            let fullExpenseTime = formatExpenseTime(expense.transactionInfo.spendOn,'sdfsd')
                    
            // Setting expense data to the dom
            if(categoryInfo.imagePath == undefined) categoryInfo.imagePath = 'f543';


            // find wallet type
            let walletType = walletInfo.length > 1 ? 'Multiple Wallet Split' : walletInfo[0]?.data?.type ;


            // Populate info into card
            let color = '#'+colorOne[expense.id%9];
            let colorTw = '#'+colorTwo[expense.id%9];

            // Populating information to the card
            $(currentElement).find('.expense-view-btn').attr('data-bs-target','#expense'+expense.id);
            $(currentElement).find(".title").text(expense.transactionInfo.reason+" ");
            $(currentElement).find(".spend-amount").text("-"+expense.amount+" ₹");
            $(currentElement).find(".expense-note").text(expense.transactionInfo.note);
            $(currentElement).find(".timestamp").text(expense.timestamp);
            $(currentElement).find(".category").text(categoryInfo.name);
            $(currentElement).find(".wallet-name").html(walletName);
            $(currentElement).find(".wallet-type").text(walletType);
            $(currentElement).find(".spend-on").text(fullExpenseTime);
            $(currentElement).find(".category-ico").html('&#x'+categoryInfo.imagePath)


            // Setting dynamic attributes
            $(currentElement).find('#exampleModal').attr('id','expense'+expense.id)
            $(currentElement).find(".expense-delete-btn").attr('expense-id',''+expense.id);
            $(currentElement).find(".edit-expense-btn").attr('expense-id',expense.id);
            $(currentElement).find(".expense-edit-btn").attr('expense-id',expense.id);

            // Adding Dynamic Styling
            $(currentElement).find('.card-body').css('background-color',colorTw);
            $(currentElement).find('.category-ico').css('background-color','#43cead');
            $(currentElement).find('.category-ico').css('color','#'+colorOne[categoryInfo.id%9]);
            $(currentElement).find(".view-expense-modal .category").css('background-color', '#ace9db');  
            $(currentElement).find(".view-expense-modal .category").css('color', '#000');  


            // Detection of isDeleted Wallets Expense
            if(walletArchiveIndicator === true) $(currentElement).find('.edit-expense-btn').remove();
            if(walletArchiveIndicator === true) $(currentElement).find('.expense-edit-btn').remove();
            if(walletArchiveIndicator === true) $(currentElement).find('.wallet-splits').before('<div class="text-danger">Some wallets has been deleted.(editing disabled)</div>');
            $(currentElement).find('.expense-edit-btn').click((event)=>{
                let walletId = $(event.target).attr('expense-id');
                mountEditExpenseForm(walletId);
            })
            if(walletArchiveIndicator === true) $(currentElement).find('.expense-edit-btn').off()
            if(walletArchiveIndicator === true) $(currentElement).find(".title").append('<i class="fas expired-expense-ico fa-ban"></i>'); 
            


            // Delete Button Listener
            $(currentElement).find('.expense-delete-btn').click((event)=>{ 
                let expenseId =$(event.target).attr('expense-id');
                $('#spinner').css('display','block');

                deleteTransactionsById(+expenseId).then((data)=> {
                    util.handleApiResponse(data,"Expense Deleted 🗑️ ");
                    $('#spinner').css('display','none');
                    $('.btn-close').click();
                    refreshDashboard();
                });
            
            })

            // Open edit on clicking title
            $(currentElement).find('.modal-title').click((event)=>{
                $(currentElement).find('.expense-edit-btn').click();
            });

            // Populating Tags
            let newTag =$('<div class="tag d-flex align-items-center justify-content-between"> <span>&nbsp;</span> <span class="tag-text">upi</span> </div>')
            let allTagsSection = $(currentElement).find('.all-tags-section');
            let modelAllTagsSection = $(currentElement).find('.all-tags-msection');
            if(allTagsInfo.length>0){
                let newElement = newTag.clone();
                newElement.find('.tag-text').text(allTagsInfo[0].data.name.toLowerCase());
                allTagsSection.append(newElement.clone());
                modelAllTagsSection.append(newElement.clone());
            }
            if(allTagsInfo.length>1){
                let newElement = $('<div class="d-flex align-items-center justify-content-between" style=""> <span>&nbsp;</span> <span class="tty">upi</span> </div>')
                newElement.find('.tty').text('+ '+ (allTagsInfo.length -1) + ' more');
                allTagsSection.append(newElement);
            }
            for(let i=1;i<allTagsInfo.length;i++){
                let newTagClone = newTag.clone();
                newTagClone.find('.tag-text').text(allTagsInfo[i].data.name.toLowerCase());
                modelAllTagsSection.append(newTagClone);
            }

            // Edit button inside expense view
            $(currentElement).find('.edit-expense-btn').click(()=>{ $(currentElement).find('#inExpEditForm').click(); })

            $(currentElement).hover(()=>{
                $(currentElement).find('.expense-view-btn').css('display', 'flex');
            },()=>{
                $(currentElement).find('.expense-view-btn').css('display', 'none');
            }
            )
            


            function newDateSection(newDate){
                let dateSection = document.createElement("div");

                // Monthly view calendar update
                let calander = $('.dt'+newDate);
                let calendarBoxContent = $('<div class="calendar-dtb dtb'+newDate+'"></div>');
                $(calendarBoxContent).append('<span> <span class="expenses-count">1 </span> Expenses</span>'); // Expense Count will be updated by newDateSection() in populateExpense();
                $(calendarBoxContent).append('<h4 class="dte-amount days-expense'+newDate+'">'+util.moneyFormat(daysTotalExpense)+'</h4>');
                $(calander).find('.monthly-indicator-wrap').html(calendarBoxContent);

                let date = newDate.split("-").reverse();
                date[1] = months[date[1]-1];
                date = date.join(' ')

                let daysExpenseTemplate = "<span class='days-expense"+newDate+"'>"+daysTotalExpense+'</span></small></div>';                
                dateSection.innerHTML = '<div class="date-grouping" style="margin-top:30px"><b>'+date+'</b> | <small>Total Expense: ₹'+ daysExpenseTemplate;
                dateSection.style.color = '#385170';
                expenseContainer.appendChild(dateSection);

            }

            function formatExpenseTime(expenseTime,groupBy){
                let timeOnly = expenseTime.split(" ")[1].split(":");
                return (util.to12Format(timeOnly[0]+":"+timeOnly[1]));
            }

        }     

        // Initiate the date range selector plugin
        function initiateDateSelectorPlugin(){

            function cb(start, end, timeSpan) {

                // No date in expense list for today and yesterday's expense
                let expenseFrom = start;
                let expenseTo = end;
                let refreshExpenseContainer = true;

                if(timeSpan=='Recent') refreshExpenseContainer = false;
                else{
                    expenseFrom = start.format('YYYYMMDD').split('-').join('');
                    expenseTo = end.format('YYYYMMDD').split('-').join('');
                }

                findAllExpenseDetails(expenseFrom,expenseTo,timeSpan,true); // true = refreshExpenseContainer

                $('#date-range-type').html(timeSpan);
                currTimeSpan = timeSpan;
            }

            let allDateRanges =  {
                'Recent' : [moment(),moment()], // "Works based on count the keys has no usage",
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'Monthly': [moment().startOf('month'), moment().endOf('month')],
            };

            let start = allDateRanges['Recent'][0];
            let end = allDateRanges['Recent'][1];

            let now = moment().format('MM/DD/YYYY');

            $('#reportrange').daterangepicker({ startDate: start, endDate: end,maxDate: now, ranges: allDateRanges }, cb);
            cb(start, end, currTimeSpan);

        }  
        
        // Called if no expenses for the user [Trigger = findAllExpenseDetails]
        function zeroExpensesHandler(){
            $("#expense-card-container").html('<center class="card"><h1 class="card-body">No expense data found</h1></center>')
        }

        async function updateHeader(){
            
            // Show current set range total expense in header container
            let st = moment().startOf('month').format('YYYYMMDD');
            let end = moment().endOf('month').format('YYYYMMDD');
            let expenseData = null;
            await findTransactions(st,end,'expenses').then((data)=>expenseData = data.data.expenses);

            let rangeExpense = 0;
            for(let i=0; i<expenseData.length; i++){ 
                rangeExpense+=expenseData[i].amount;
            }

            $('.reporting-days-total').text(rangeExpense);
            $('#mi-bal-amount').text(util.moneyFormat(rangeExpense));
            $('.main-balance .timespan').text("("+"This Month"+")");
        }


        function mountCalendar() {
            $('.monthly-view').show();
            calendarMounted = true;
        }

        function unmountCalendar() {
            $('.monthly-view').hide();
            calendarMounted = false;
        }

        function calendarMonthExpensesChange(month,year){
            let start = year+""+month+"01";
            let end = year+""+month+(32 - new Date(year, month-1, 32).getDate());
            
            findAllExpenseDetails(start, end,'Monthly',true);
        }

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
                            var isInPast = options.stylePast && (
                                year < currentYear
                                || (year === currentYear && (
                                    month < currentMonth
                                    || (month === currentMonth && dayNumber < currentDay)
                                ))),
                                innerMarkup = '<div class="monthly-day-number">' + (dayNumber) + '</div><div class="monthly-indicator-wrap"></div>';
                            if(options.mode === "event") {
                                var thisDate = new Date(year, mZeroed, dayNumber, 0, 0, 0, 0);
                                $(parent + " .monthly-day-wrap").append("<div"
                                    + attr("class", "m-d monthly-day monthly-day-event"
                                        + (isInPast ? " monthly-past-day" : "")
                                        // + " dt" + year+"-"+mZeroed+"-"+dayNumber
                                        + " dt" + thisDate.getFullYear()+"-"+(thisDate.getMonth()+1)+"-"+ ( (thisDate.getDate()+"").length == 1 ? "0"+thisDate.getDate() : thisDate.getDate())
                                        )
                                    + attr("data-number", dayNumber)
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
                        if (options.mode === "event") {
                            addEvents(month, year);
                        }
                        var divs = $(parent + " .m-d");
                        for(index = 0; index < divs.length; index += 7) {
                            divs.slice(index, index + 7).wrapAll('<div class="monthly-week"></div>');
                        }
                    }

                    function addEvent(event, setMonth, setYear) {
                        // Year [0]   Month [1]   Day [2]
                        var fullStartDate = _getEventDetail(event, "startdate"),
                            fullEndDate = _getEventDetail(event, "enddate"),
                            startArr = fullStartDate.split("-"),
                            startYear = parseInt(startArr[0], 10),
                            startMonth = parseInt(startArr[1], 10),
                            startDay = parseInt(startArr[2], 10),
                            startDayNumber = startDay,
                            endDayNumber = startDay,
                            showEventTitleOnDay = startDay,
                            startsThisMonth = startMonth === setMonth && startYear === setYear,
                            happensThisMonth = startsThisMonth;

                        if(fullEndDate) {
                            // If event has an end date, determine if the range overlaps this month
                            var	endArr = fullEndDate.split("-"),
                                endYear = parseInt(endArr[0], 10),
                                endMonth = parseInt(endArr[1], 10),
                                endDay = parseInt(endArr[2], 10),
                                startsInPastMonth = startYear < setYear || (startMonth < setMonth && startYear === setYear),
                                endsThisMonth = endMonth === setMonth && endYear === setYear,
                                endsInFutureMonth = endYear > setYear || (endMonth > setMonth && endYear === setYear);
                            if(startsThisMonth || endsThisMonth || (startsInPastMonth && endsInFutureMonth)) {
                                happensThisMonth = true;
                                startDayNumber = startsThisMonth ? startDay : 1;
                                endDayNumber = endsThisMonth ? endDay : daysInMonth(setMonth, setYear);
                                showEventTitleOnDay = startsThisMonth ? startDayNumber : 1;
                            }
                        }
                        if(!happensThisMonth) {
                            return;
                        }

                        var startTime = _getEventDetail(event, "starttime"),
                            timeHtml = "",
                            eventURL = _getEventDetail(event, "url"),
                            eventTitle = _getEventDetail(event, "name"),
                            eventClass = _getEventDetail(event, "class"),
                            eventColor = _getEventDetail(event, "color"),
                            eventId = _getEventDetail(event, "id"),
                            customClass = eventClass ? " " + eventClass : "",
                            dayStartTag = "<div",
                            dayEndTags = "</span></div>";

                        if(startTime) {
                            var endTime = _getEventDetail(event, "endtime");
                            timeHtml = '<div><div class="monthly-list-time-start">' + formatTime(startTime) + "</div>"
                                + (endTime ? '<div class="monthly-list-time-end">' + formatTime(endTime) + "</div>" : "")
                                + "</div>";
                        }

                        if(options.linkCalendarToEventUrl && eventURL) {
                            dayStartTag = "<a" + attr("href", eventURL);
                            dayEndTags = "</span></a>";
                        }

                        var	markupDayStart = dayStartTag
                                + attr("data-eventid", eventId)
                                + attr("title", eventTitle)
                                // BG and FG colors must match for left box shadow to create seamless link between dates
                                + (eventColor ? attr("style", "background:" + eventColor + ";color:" + eventColor) : ""),
                            markupListEvent = "<a"
                                + attr("href", eventURL)
                                + attr("class", "listed-event" + customClass)
                                + attr("data-eventid", eventId)
                                + (eventColor ? attr("style", "background:" + eventColor) : "")
                                + attr("title", eventTitle)
                                + ">" + eventTitle + " " + timeHtml + "</a>";
                        for(var index = startDayNumber; index <= endDayNumber; index++) {
                            var doShowTitle = index === showEventTitleOnDay;
                            // Add to calendar view
                            $(parent + ' *[data-number="' + index + '"] .monthly-indicator-wrap').append(
                                    markupDayStart
                                    + attr("class", "monthly-event-indicator" + customClass
                                        // Include a class marking if this event continues from the previous day
                                        + (doShowTitle ? "" : " monthly-event-continued")
                                        )
                                    + "><span>" + (doShowTitle ? eventTitle : "") + dayEndTags);
                            // Add to event list
                            $(parent + ' .monthly-list-item[data-number="' + index + '"]')
                                .addClass("item-has-event")
                                .append(markupListEvent);
                        }
                    }

                    function addEvents(month, year) {
                        if(options.events) {
                            // Prefer local events if provided
                            addEventsFromString(options.events, month, year);
                        } else {
                            var remoteUrl = options.dataType === "xml" ? options.xmlUrl : options.jsonUrl;
                            if(remoteUrl) {
                                // Replace variables for month and year to load from dynamic sources
                                var url = String(remoteUrl).replace("{month}", month).replace("{year}", year);
                                $.get(url, {now: $.now()}, function(data) {
                                    addEventsFromString(data, month, year);
                                }, options.dataType).fail(function() {
                                    console.error("Monthly.js failed to import " + remoteUrl + ". Please check for the correct path and " + options.dataType + " syntax.");
                                });
                            }
                        }
                    }

                    function addEventsFromString(events, setMonth, setYear) {
                        if (options.dataType === "xml") {
                            $(events).find("event").each(function(index, event) {
                                addEvent(event, setMonth, setYear);
                            });
                        } else if (options.dataType === "json") {
                            $.each(events.monthly, function(index, event) {
                                addEvent(event, setMonth, setYear);
                            });
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

                    function _getEventDetail(event, nodeName) {
                        return options.dataType === "xml" ? $(event).find(nodeName).text() : event[nodeName];
                    }

                    // Returns a 12-hour format hour/minute with period. Opportunity for future localization.
                    function formatTime(value) {
                        var timeSplit = value.split(":");
                        var hour = parseInt(timeSplit[0], 10);
                        var period = "AM";
                        if(hour > 12) {
                            hour -= 12;
                            period = "PM";
                        } else if (hour == 12) {
                            period = "PM";
                        } else if(hour === 0) {
                            hour = 12;
                        }
                        return hour + ":" + String(timeSplit[1]) + " " + period;
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
                    refreshDashboard();
                    util.handleApiResponse(data,"Expense Created ✅ ");
                    // util.toastResponse(data.statusCode,"Process Sucess","Expense Creation Failed");
                })

            }

        }

        function extendForm(){
            $('.more-expense-info').css('display', 'block');
            $('#expense-more').css('display', 'none');
        }

        
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
        

        expenseFormUtil.listWalletsInForm();
        expenseFormUtil.listCategoriesInForm()
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
                        $(initialWalletSplit).find('.form-wallet-list').val(walletId);
                        $(initialWalletSplit).find('#expense-amount').val(walletSplits[walletId]);
                    }else{
                        let newWalletSplit = $(initialWalletSplit).clone();
                        newWalletSplit.removeClass('wallet-split1');
                        $(newWalletSplit).find('.form-wallet-list').val(walletId);
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
                $(form).find('#save-expense-btn').click(()=>{ updateExpenseDetails(); })

            }

        }

        // Submit the form to the api
        async function updateExpenseDetails(){
            console.log(usingNewCategory)

            let form =  $('#editExpenseForm'+expenseId+' .modal-content');

            let totalAmount = 0;
            let reason =  $(form).find('#expense-name').val();
            
            let spendOn = null;
            let userSpendOn = $(form).find('#expense-time').val();
            // console.log(userSpendOn);
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
                console.log(userSpendOn);
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
                    refreshDashboard();
                });
                $('body').css('overflow', 'scroll');
            }

    
    
        }

    }



}


