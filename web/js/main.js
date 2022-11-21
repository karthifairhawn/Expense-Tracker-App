import {findTransactions,findTransactionsById,createTransactions,deleteTransactionsById,updateTransactionsById} from '../apis/transactions.js';
import {findWalletById, findWallets,createWallet,deleteWalletById,updateWalletById} from '../apis/wallets.js';
import {findTagById,findTags,createTag} from '../apis/tags.js';
import {findCategoryById,findCategories,createCategory} from '../apis/categories.js';


let walletInfo = await findWallets();
if(walletInfo.statusCode == 404){
    localStorage.clear();
    window.location.href = './login.html';
}

// Navigation Handler
$('.nav-item').click(function(){
    $('.navbar .active').removeClass('active');
    $(this).addClass('active');
    utilFunctions.navigator(($(this).attr('tabs')));
    $('.modal-backdrop').remove();
    $('body').css('overflow','scroll');
});

$('.logout').click(()=>{
    localStorage.clear();
    window.location.href= '/login.html';
})

// Mount Dashboard by default
var currTimeSpan = 'Today';
let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
// mountTemplate();
balanceHeaderUpdate();
let colorOne = ['d6eb70','cc7aa3','85cc70','99ff66','a3f5f5','9999f5','ada399','ffd6ff','f5b87a','fadbbd','99b8cc'];
let colorTwo = ['ebf5b8','e6bdd1','c2e6b8','ccffb3','d1fafa','ccccfa','d6d1cc','ffebff','fadbbd','c2c2d1','ccdbe6'];



var utilFunctions = {

    navigator: (activeTemplate) =>{ 

        $('#dashboard #date-range-selector').html('');
        $('#dashboard #expense-card-container').html('');
        $('#wallets').html('')
        $('.navbar .nav-item').removeClass('active');
        
        if(activeTemplate == 'wallets' || (localStorage.getItem('location') == 'wallets' && activeTemplate == undefined)){
            mountWallets();
            localStorage.setItem('location','wallets');
            $('.navbar [tabs=wallets]').addClass('active');
        }
        else if(activeTemplate == 'dashboard' || (localStorage.getItem('location') == 'dashboard' && activeTemplate == undefined)){
            mountDashboard();
            balanceHeaderUpdate();
            localStorage.setItem('location','dashboard');
            $('.navbar [tabs=dashboard]').addClass('active');
    
        }else{
            // alert('Still working at it')
        }
    },

    timeCovertor : (time) => {
        // Check correct time format and split into components
        time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
    
        if (time.length > 1) { // If time format correct
        time = time.slice (1);  // Remove full string match value
        time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
        time[0] = +time[0] % 12 || 12; // Adjust hours
        }
        return time.join (''); // return adjusted time or original string
    },

    railTimeConverter : (time) => {
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
    },

    validators: {
        IsNullOrNumber : (element,value)=>{

            if(value==null || value==undefined || value==0 || value=='null'){
                $(element).css('border', '1px solid red');
        
                return 1;
            }else{
                $(element).css('border', '1px solid #ced4da');
                return 0;
            }
        },
        
        isNumber : (element,value)=> {
            // var reg = ;
            // var reg = new RegExp('/^\d+$/');
            
            if(/\d/.test(value)){
                $(element).css('border', '1px solid #ced4da');
                // return 0;
                if(value==0){
                    $(element).css('border', '1px solid red');
                    return 1
                }
                return 0;
            }else{
                $(element).css('border', '1px solid red');
                return 1;
            }
        
        
        },
        
        isNullorNumber : (element,value)=> {
        
            console.log(value)
            if(value.length==0 || value == null || value==undefined || value==0){
                return 0;
            }
        
            if(typeof value === 'number' && isFinite(value)){
                $(element).css('border', '1px solid #ced4da');
                // return 0;
                if(value==0){
                    $(element).css('border', '1px solid red');
                    return 1
                }
                return 0;
            }else{
                $(element).css('border', '1px solid red');
                return 1;
            }
        
        
        },
        
        isNullOrIfsc : (element,value)=> {
            if(value.length==0 || value == null || value==undefined){
                return 0;
            }
            var reg = /[A-Z|a-z]{4}[0][a-zA-Z0-9]{6}$/;    
            if (value.match(reg)) {    
                $(element).css('border', '1px solid #ced4da');
                return 0;    
            }    
            else {    
                $(element).css('border', '1px solid red'); 
                return 1;    
            }    
        },
        
        isPositiveNumber : (element,value)=> {
            // var reg = ;
            // var reg = new RegExp('/^\d+$/');
            
            if(/\d/.test(value)){
                $(element).css('border', '1px solid #ced4da');
                // return 0;
                if(value<=0){
                    $(element).css('border', '1px solid red');
                    return 1
                }
                return 0;
            }else{
                $(element).css('border', '1px solid red');
                return 1;
            }
        
        
        }
    }
    
}

utilFunctions.navigator();


function mountDashboard(){ 
    balanceHeaderUpdate();
    mountDateRangeSelector();
    mountExpensesInDashboard();

    // Making new expense form default in reopen
    $('#create-expense-btn').click(()=>{ 
        let newExpenseFormClone = document.getElementById('tt-new-expense-form').content.cloneNode(true);
        $('#newRecord .modal-content').html($(newExpenseFormClone));
        mountCreateExpenseForm(); 
    });

    function mountExpensesInDashboard(){

        
        let listingExpenseDate = null;
        let daysTotalExpense = 0;
      
        let groupBy= 'Time';
        dateRangeChangeHandler();
        
        $(".daterangepicker ul").find(`[data-range-key='${currTimeSpan}']`).click();

        // Fetch category info of each expense and populateExpense()
        async function findAllExpenseDetails(expenseFrom,expenseTo){ 
            
            daysTotalExpense = 0;
            let expenseData = null;
            await findTransactions(expenseFrom,expenseTo,'expenses').then((data)=>expenseData = data);

            // Delete old expense data from dom
            $("#expense-card-container").html("");

            let expenses = expenseData.data.expenses;

          
            if(expenses.length ==0 )[
                // console.log("no expense data found")
                $("#expense-card-container").html('<center class="card"><h1 class="card-body">No expense data found</h1></center>')
            ]

            for(let i=0; i<expenses.length; i++){ 
                
                let wallets = new Array();

                for (const [key, value] of Object.entries(expenses[i].walletSplits)) {
                    await  findWalletById(`${key}`).then((resp)=> wallets.push(resp));
                }

                let categoryInfo = {};
                if(expenses[i].transactionInfo.categoryId==0){
                    categoryInfo.name='General Expense'
                }else{
                    await findCategoryById(expenses[i].transactionInfo.categoryId)
                    .then((data)=> categoryInfo = data.data);
                }

                populateExpense(wallets,expenses[i],categoryInfo);

            }

            $('.reporting-days-total').text(daysTotalExpense);
        }

        // Fetch Wallet Split and tag info then populateExpense
        async function populateExpense(walletInfo,expense,categoryInfo){

            let allTagsInfo = [];

            let tagsIds = expense.transactionInfo.tagId;

            for(let i=0;i<tagsIds.length;i++){
                await findTagById(tagsIds[i]).then((data) =>{
                    allTagsInfo.push(data);
                })
            }

            let expenseTemplate = $("#expense-card-template")[0];
            let expenseContainer = $("#expense-card-container")[0];
            let expenseTemplateClone = expenseTemplate.content.cloneNode(true);
            
            // Grouping multiple dasys expense with dates and calculating days's expense 
            if(expense.transactionInfo.spendOn.split(" ")[0]!=listingExpenseDate && !(currTimeSpan=='Today' || currTimeSpan=='Yesterday')){
                daysTotalExpense = expense.amount;
                newDateSection(expense.transactionInfo.spendOn.split(" ")[0]); 
                listingExpenseDate = expense.transactionInfo.spendOn.split(" ")[0];

            }else{
                daysTotalExpense+=expense.amount;
                $('#days-total-expense').text(daysTotalExpense); 
            }

            expenseContainer.appendChild(expenseTemplateClone);
            let currentElement = document.getElementsByClassName("card")[document.getElementsByClassName("card").length-1];


            // Findign wallet Split
            let walletSplitHtml = '';
            for(let i=0; i<walletInfo.length;i++){
                let id = walletInfo[i].data.id;
                walletSplitHtml+=''+walletInfo[i].data.name+'';
                walletSplitHtml+=" - "+expense.walletSplits[id]+" ₹ <br>";
            }


            // Finding wallet name
            let walletName = null;
            if(walletInfo.length == 1){
                walletName = (walletInfo[0].data.name);
            }else{
                // console.log(walletInfo.length-1+"pp-")
                let accounts = walletInfo.length;
                let html = "<a></a>";
                walletName = +accounts+" Accounts "+'<i class="fa-solid fa-arrows-split-up-and-left"></i> '
            }


            // Format expense time
            let expenseTime = expense.transactionInfo.spendOn;
            expenseTime = formatExpenseTime(expenseTime);
            let fullExpenseTime = formatExpenseTime(expense.transactionInfo.spendOn,'sdfsd')
                    
            // Setting expense data to the dom
            if(categoryInfo.imagePath == undefined) categoryInfo.imagePath = 'f543';


            // find wallet type
            let walletType = walletInfo.length == 1 ? walletInfo[0].data.type : 'Multiple Wallet Split';


            let color = '#'+colorOne[expense.id%9];
            let colorTw = '#'+colorTwo[expense.id%9];
            $(currentElement).find('.card-body').css('background-color',colorTw);
            $(currentElement).find('.category-ico').css('background-color',color)
            $(currentElement).find('.expense-view-btn').attr('data-bs-target','#expense'+expense.id);
            $(currentElement).find('#exampleModal').attr('id','expense'+expense.id)
            $(currentElement).find(".title").text(expense.transactionInfo.reason);
            $(currentElement).find(".spend-amount").text("-"+expense.amount+" ₹");
            $(currentElement).find(".expense-note").text(expense.transactionInfo.note);
            $(currentElement).find(".timestamp").text(expense.timestamp);
            $(currentElement).find(".category").text(categoryInfo.name);
            $(currentElement).find(".wallet-splits").html(walletSplitHtml);
            $(currentElement).find(".wallet-name").html(walletName);
            $(currentElement).find(".wallet-type").text(walletType);
            $(currentElement).find(".spend-on").text(fullExpenseTime);
            $(currentElement).find(".category-ico").html('&#x'+categoryInfo.imagePath)
            $(currentElement).find(".expense-delete-btn").attr('expense-id',''+expense.id);
            $(currentElement).find(".edit-expense-btn").attr('expense-id',expense.id);
            $(currentElement).find(".expense-edit-btn").attr('expense-id',expense.id);
            


            // Delete Button Listener
            $(currentElement).find('.expense-delete-btn').click((event)=>{ 
                let expenseId =$(event.target).attr('expense-id');
                $('#spinner').css('display','block');

                deleteTransactionsById(+expenseId).then((data)=> {

                    $('#spinner').css('display','none');
                    $('.btn-close').click();


                    mountExpensesInDashboard();
                });
           
            })


            // Edit button inside expense lisiting
            $(currentElement).find('.expense-edit-btn').click((event)=>{
                // setTimeout(()=>{})
                let walletId = $(event.target).attr('expense-id');
                mountEditExpenseForm(walletId);
            })

            $(currentElement).find('.modal-title').click((event)=>{
                $(currentElement).find('.expense-edit-btn').click();
            });

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
                let newElement = $('<div class="d-flex align-items-center justify-content-between" style="color:white;font-weight:600"> <span>&nbsp;</span> <span class="tty">upi</span> </div>')
                newElement.find('.tty').text('+ '+ (allTagsInfo.length -1) + ' more');
                allTagsSection.append(newElement);
            }
            for(let i=1;i<allTagsInfo.length;i++){
                let newTagClone = newTag.clone();
                newTagClone.find('.tag-text').text(", "+allTagsInfo[i].data.name.toLowerCase());
                modelAllTagsSection.append(newTagClone);
            }

            // $(currentElement).find('.tags-section').append($(allTagsSection));
            // console.log(allTagsSection)
            // console.log($(currentElement).find('.tags-section').append());

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
                
                // let date = timeOnly[0];
                let date = newDate.split("-").reverse();
                date[1] = months[date[1]-1];
                date = date.join(' ')
                // let dateSimplified = date[0]+" "+months[date[1]];
             

                let daysExpenseTemplate = "<span id='days-total-expense'>"+daysTotalExpense+'</span></small></div>';

                
                dateSection.innerHTML = '<div class="date-grouping" style="margin-top:30px"><b>'+date+'</b> | <small>Total Expense: ₹'+ daysExpenseTemplate;
                dateSection.style.color = '#385170';
                expenseContainer.appendChild(dateSection);
            }

            function formatExpenseTime(expenseTime,groupBy){
                if(groupBy=='Time' && (currTimeSpan=='Today' || currTimeSpan=='Yesterday')){
                    // console.log(groupBy+"   "+timeSpan);
                    let timeOnly = expenseTime.split(" ")[1].split(":");
                    return (utilFunctions.timeCovertor(timeOnly[0]+":"+timeOnly[1]));
                }else{
    
                    let timeOnly = expenseTime.split(" ");
                    let date = timeOnly[0].split("-").reverse();
                    let dateSimplified = date[0]+" "+months[date[1]];
                    let time = timeOnly[1].split(":")[0] + ":"+timeOnly[1].split(":")[1];
                    date = (dateSimplified +", "+ time);
    
                    return (dateSimplified+", "+time);
    
                }
            }

        }     

        // For any change in date range and pass it to findAllExpenseDetails
        function dateRangeChangeHandler(){
            // Date Range Selector
            let start = moment();
            let end = moment();
            

            function cb(start, end, timeSpan) {
                // No date in expense list for today and yesterday's expense
                if(timeSpan=="Today" || timeSpan=="Yesterday"){
                    $('#reportrange .date').text(start.format('MMMM D, YYYY')); 
                    $('#reportrange .date').css('padding','10px');
                }else{
                    $('#reportrange .date').css('padding','10px');
                    $('#reportrange .date').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY')); 
                }

                let expenseFrom = start.format('YYYYMMDD').split('-').join('');
                let expenseTo = end.format('YYYYMMDD').split('-').join('');

                findAllExpenseDetails(expenseFrom,expenseTo);


                $('#date-range-type').html(timeSpan);
                currTimeSpan = timeSpan;
            }

            let allDateRanges =  {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                };

            start = allDateRanges[currTimeSpan][0];
            end = allDateRanges[currTimeSpan][1];

            $('#reportrange').daterangepicker({ startDate: start, endDate: end, ranges: allDateRanges }, cb);

            
            cb(start, end, currTimeSpan);

        }   

    }  

    function mountDateRangeSelector(){

        let dateRangeContainer = document.getElementById("date-range-selector");
        let dateRangeElement = document.getElementById("date-range-template");
        let clone = dateRangeElement.content.cloneNode(true);
        dateRangeContainer.appendChild(clone);  

    }

    function mountEditExpenseForm(walletId){

        $('#editExpenseForm  #split-wallet').click((event)=>{
            // console.log(123);
            // console.log($(event.target).closest('#editExpenseForm'));
            splitWalletHandler($(event.target).closest('#editExpenseForm'))
        })

        function splitWalletHandler(activeForm){

            
            if(!IsAllWalletSplitFilled()) return;

            let formClone = $(activeForm).find('.wallet-split1').clone().removeClass('wallet-split1')
            formClone.find('.message-text').remove();
            formClone.find('#split-wallet').remove();
            formClone.find('#expense-amount').val(0);
            formClone.append('<i class="far fa-times-circle"></i>');
            formClone.find('.far').click((event)=>{
                $(event.target).closest('.w-split').remove();
            });
    
    
            formClone.appendTo($(activeForm).find('#all-wallet-splits'));


            $('.w-split').addClass('d-flex');
            $('.wallet-name-section').addClass('w90');
    
    
            function IsAllWalletSplitFilled(){
                let allWalletSplitValues = $(activeForm).find('.w-split');
                
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
        }

        let allTags=[];
        let formSelectedTags = [];
        
        listWalletsInForm();
        listCategoriesInForm()
        insertExpenseData(walletId);

        let usingNewCategory = false;

        async function listWalletsInForm(){


            let allWalletsInfo = [];

            let allWallets = null;
            await findWallets().then((data)=>allWallets = (data.data));
    
    
            for(const wallet in allWallets){
                for(let kgh=0;kgh<allWallets[wallet].length;kgh++){
                    allWalletsInfo.push(allWallets[wallet][kgh]);
                }

            }

            allWallets = allWalletsInfo;
            let allWalletsHTML = '';

            for(let i=0;i<allWallets.length;i++){
                allWalletsHTML+='<option value="'+allWallets[i].id+'">'+allWallets[i].name+'</option>'
            }

            // console.log(allWallets);
            
            $('#editExpenseForm #all-wallets-options').html(allWalletsHTML);
            // $("all-categories-options")
        }
    
        async function listTagsInForm(selectedTags){
            let allTagsInfo = null;
            await findTags().then((data)=> allTagsInfo= (data.data))
            
            let allTagsHTML = '';
            for(let i=0;i<allTagsInfo.length;i++){
                allTagsHTML+='<option value="'+allTagsInfo[i].id+'">'+allTagsInfo[i].name+'</option>'
                allTags.push(+(allTagsInfo[i].id));
            }


            $('#editExpenseForm #locationSets').html(allTagsHTML);
    
    
            var selector = $('#editExpenseForm #locationSets');
            // selector.selectize({
            //     plugins: ['remove_button']
            // });
            selector.selectize({
                delimiter: ",",
                persist: false,
                create: function (input) {
                  return {
                    value: input,
                    text: input,
                  };
                },
                items:selectedTags,
                plugins: ['remove_button'],
                selectOnTab : true,
                onItemAdd: (value,obj)=>{

                    if(allTags.includes(+value)){
                        formSelectedTags.push(value);
                    }else{
                                            // console.log(obj+' '+value)
                        if(value.length<=3 || value.length>14){
                            alert('pleas create tag in len between 3 and 14');
                            // console.log(obj)
                            $(obj).hide();
                            // $(obj).css('background-color', 'red !important');
                            return false;
                        }

                        createTag(JSON.stringify({
                            "name":""+value,
                            "color":"#44545"
                        })).then((data)=>{
                            allTags.push(data.data.id);
                            formSelectedTags.push(data.data.id);
                        })
                    }
                    return false;
                },
                onItemRemove : ((value)=>{
                    formSelectedTags = formSelectedTags.filter(e => e != value)
                    console.log(formSelectedTags)
                })
              });

            $('.selectize-control input').attr('maxlength','14')

        }

        async function listCategoriesInForm(){
            let allCategories = null;
            
            await findCategories().then((data)=> allCategories= (data.data))
            

            let allCategoriesHTML = '';
            allCategoriesHTML+='<option value="0"> General</option>'
            for(let i=0;i<allCategories.length;i++){
    
                allCategoriesHTML+='<option class="category-list-option" ico="'+allCategories[i].imagePath+'" value="'+allCategories[i].id+'">'+allCategories[i].name+'</option>'
            }
            allCategoriesHTML+='<option ico="create-cat" class="create-category-option">+ create new category</option>'
            $('#editExpenseForm  #all-categories-options').html(allCategoriesHTML);
    
            $('#editExpenseForm  #all-categories-options').change((event)=>{

                let icon = $('option:selected', event.target).attr('ico');
    
    
                if(icon=='create-cat'){
                    
                    usingNewCategory = true;
    
                    $('#editExpenseForm #category-label').text('Create Category');
                    $('#editExpenseForm #all-categories-options').hide();  
                    $('#editExpenseForm #create-category-btn').hide();
                    $('#editExpenseForm #new-category-input').css('display','block');
                    $('#editExpenseForm #new-category-icon').css('display','block');
                    $('#editExpenseForm #form-category-icon').hide();
    
                    let allIcons = ['f641','f2b9','f2bb','f042','f5d0','f037','f039','f036','f038','f461','f0f9','f2a3','f13d','f103','f100','f101','f102','f107','f104','f105','f106','f556','f644','f5d1','f187','f557','f358','f359','f35a','f35b','f0ab','f0a8','f0a9','f0aa','f063','f060','f061','f062','f0b2','f337','f338','f2a2','f069','f1fa','f558','f5d2','f29e','f559','f77c','f77d','f55a','f04a','f7e5','e059','e05a','f666','f24e','f515','f516','f05e','f462','f02a','f0c9','f433','f434','f2cd','f244','f240','f242','f243','f241','f236','f0fc','f0f3','f1f6','f55b','f647','f206','f84a','f1e5','f780','f1fd','f517','f6b6','f29d','f781','f032','f0e7','f1e2','f5d7','f55c','f02d','f6b7','f7e6','f518','f5da','f02e','f84c','f850','f853','f436','f466','f49e','e05b','f468','f2a1','f5dc','f7ec','f0b1','f469','f519','f51a','f55d','f188','f1ad','f0a1','f140','f46a','f207','f55e','f64a','f1ec','f133','f073','f274','f783','f272','f271','f273','f784','f030','f083','f6bb','f786','f55f','f46b','f1b9','f5de','f5df','f5e1','f5e4','f8ff','f0d7','f0d9','f0da','f150','f191','f152','f151','f0d8','f787','f218','f217','f788','f6be','f0a3','f6c0','f51b','f51c','f5e7','f1fe','f080','f201','f200','f00c','f058','f560','f14a','f7ef','f439','f43a','f43c','f43f','f441','f443','f445','f447','f13a','f137','f138','f139','f078','f053','f054','f077','f1ae','f51d','f111','f1ce','f64f','f7f2','f328','f46c','f46d','f017','f24d','f20a','f0c2','f381','f73b','f6c3','f73c','f73d','f740','f6c4','f743','f382','f561','f121','f126','f0f4','f013','f085','f51e','f0db','f075','f27a','f651','f4ad','f7f5','f4b3','f086','f653','f51f','f14e','f066','f422','f78c','f562','f563','f564','f0c5','f1f9','f4b8','f09d','f125','f565','f654','f05b','f520','f521','f7f7','f1b2','f1b3','f0c4','f1c0','f2a4','f747','f108','f655','f470','f522','f6cf','f6d1','f523','f524','f525','f526','f527','f528','f566','f5eb','f7fa','f529','f567','f471','f6d3','f155','f472','f474','f4b9','f52a','f52b','f192','f4ba','f019','f568','f6d5','f5ee','f569','f56a','f6d7','f44b','f793','f794','f6d9','f044','f7fb','f052','f141','f142','f0e0','f2b6','f658','f199','f52c','f12d','f796','f153','f362','f12a','f06a','f071','f065','f424','f31e','f35d','f360','f06e','f1fb','f070','f863','f049','f050','e005','f1ac','f52d','f56b','f182','f0fb','f15b','f15c','f1c6','f1c7','f1c9','f56c','f6dd','f56d','f1c3','f56e','f1c5','f56f','f570','f571','f477','f478','f1c1','f1c4','f572','f573','f574','f1c8','f1c2','f575','f576','f008','f0b0','f577','f06d','f7e4','f134','f479','f578','f6de','f024','f11e','f74d','f0c3','f579','f07b','f65d','f07c','f65e','f031','f44e','f04e','f52e','f119','f57a','f662','f1e3','f11b','f52f','f0e3','f3a5','f22d','f6e2','f06b','f79c','f79f','f000','f57b','f7a0','f530','f0ac','f57c','f57d','f57e','f7a2','f450','f664','f19d','f531','f532','f57f','f580','f581','f582','f583','f584','f585','f586','f587','f588','f589','f58a','f58b','f58c','f58d','f7a4','f7a5','f58e','f7a6','f0fd','f805','f6e3','f665','f4bd','f4be','e05c','f4c0','f4c1','f258','f806','f256','f25b','f0a7','f0a5','f0a4','f0a6','f25a','f255','f257','e05d','f259','f4c2','f4c4','e05e','f2b5','e05f','e060','f6e6','f807','f292','f8c0','f8c1','f6e8','f0a0','e061','e062','e063','e064','f1dc','f025','f58f','f590','f004','f7a9','f21e','f533','f591','f6ec','f6ed','f1da','f453','f7aa','f015','f6f0','f7ab','f0f8','f47d','f47e','f80d','f593','f80f','f594','f254','f253','f252','f251','f6f1','e065','f6f2','f246','f810','f7ad','f86d','f2c1','f2c2','f47f','f7ae','f03e','f302','f01c','f03c','f275','f534','f129','f05a','f033','f669','f595','f66a','f66b','f084','f11c','f66d','f596','f597','f598','f535','f66f','f1ab','f109','f5fc','e066','f812','f599','f59a','f59b','f59c','f5fd','f06c','f094','f536','f537','f3be','f3bf','f1cd','f0eb','f0c1','f195','f03a','f022','f0cb','f0ca','f124','f023','f3c1','f309','f30a','f30b','f30c','f2a8','f59d','f604','e067','f0d0','f076','f674','f183','f279','f59f','f5a0','f041','f3c5','f276','f277','f5a1','f222','f227','f229','f22b','f22a','f6fa','f5a2','f0fa','f11a','f5a4','f5a5','f538','f676','f223','f753','f2db','f130','f3c9','f539','f131','f610','f068','f056','f146','f7b5','f10b','f3cd','f0d6','f3d1','f53a','f53b','f53c','f53d','f5a6','f186','f5a7','f678','f21c','f6fc','f8cc','f245','f7b6','f001','f6ff','f22c','f1ea','f53e','f481','f247','f248','f613','f679','f700','f03b','f815','f1fc','f5aa','f53f','f482','f1d8','f0c6','f4cd','f1dd','f540','f5ab','f67b','f0ea','f04c','f28b','f1b0','f67c','f304','f305','f5ac','f5ad','f14b','f303','f5ae','e068','f4ce','f816','f295','f541','f756','f095','f879','f3dd','f098','f87b','f2a0','f87c','f4d3','f484','f818','f67f','f072','f5af','f5b0','e069','f04b','f144','f1e6','f067','f055','f0fe','f2ce','f681','f682','f2fe','f75a','f619','f3e0','f154','f011','f683','f684','f5b1','f485','f486','f02f','f487','f542','e06a','e06b','f12e','f029','f128','f059','f458','f10d','f10e','f687','f7b9','f7ba','f75b','f074','f543','f8d9','f1b8','f01e','f2f9','f25d','f87d','f3e5','f122','f75e','f7bd','f079','f4d6','f70b','f018','f544','f135','f4d7','f09e','f143','f158','f545','f546','f547','f548','f70c','f156','f5b3','f5b4','f7bf','f7c0','f0c7','f549','f54a','f70e','f7c2','f002','f688','f689','f010','f00e','f4d8','f233','f61f','f064','f1e0','f1e1','f14d','f20b','f3ed','e06c','f21a','f48b','f54b','f290','f291','f07a','f2cc','f5b6','f4d9','f2f6','f2a7','f2f5','f012','f5b7','f7c4','e06d','f0e8','f7c5','f7c9','f7ca','f54c','f714','f715','f7cc','f1de','f118','f5b8','f4da','f75f','f48d','f54d','f7cd','f7ce','f2dc','f7d0','f7d2','e06e','f696','f5ba','f0dc','f15d','f881','f15e','f882','f160','f884','f161','f885','f0dd','f162','f886','f163','f887','f0de','f5bb','f197','f891','f717','f110','f5bc','f5bd','f0c8','f45c','f698','f5bf','f005','f699','f089','f5c0','f69a','f621','f048','f051','f0f1','f249','f04d','f28d','f2f2','e06f','f54e','f54f','e070','e071','f550','f21d','f0cc','f551','f12c','f239','f0f2','f5c1','f185','f12b','f5c2','f5c3','f5c4','f5c5','f69b','f021','f2f1','f48e','f0ce','f45d','f10a','f3fa','f490','f3fd','f02b','f02c','f4db','f0ae','f1ba','f62e','f62f','f769','f76b','f7d7','f120','f034','f035','f00a','f009','f00b','f630','f491','f2cb','f2c7','f2c9','f2ca','f2c8','f165','f164','f08d','f3ff','f00d','f057','f043','f5c7','f5c8','f204','f205','f7d8','f71e','e072','f552','f7d9','f5c9','f6a0','f6a1','f722','f25c','f637','e041','f238','f7da','f224','f225','f1f8','f2ed','f829','f82a','f1bb','f091','f0d1','f4de','f63b','f4df','f63c','f553','f1e4','f26c','f0e9','f5ca','f0cd','f0e2','f2ea','f29a','f19c','f127','f09c','f13e','f093','f007','f406','f4fa','f4fb','f4fc','f2bd','f4fd','f4fe','f4ff','f500','f501','f728','f502','f0f0','f503','f504','f82f','f234','f21b','f505','f506','f507','f508','f235','f0c0','f509','e073','f2e5','f2e7','f5cb','f221','f226','f228','e085','e086','f492','f493','f03d','f4e2','f6a7','e074','e075','e076','f897','f45f','f027','f6a9','f026','f028','f772','f729','f554','f555','f494','f773','f83e','f496','f5cd','f193','f1eb','f72e','f410','f2d0','f2d1','f2d2','f72f','f4e3','f5ce','f159','f0ad','f497','f157','f6ad'];
    
                    let fontAwesomeIconeHtml = '';
                    for(let i=0;i<allIcons.length;i++){
                        fontAwesomeIconeHtml+='<option style="font-weight:900" value="'+allIcons[i]+'">'+"&#x"+allIcons[i]+'</option>'
                    }
                    $('#editExpenseForm  #new-category-icon').html(fontAwesomeIconeHtml);
                }else{
                    $('#editExpenseForm  #form-category-icon').html('<span class="create-category-ico" >&#x'+icon+'</span>')
                }
    
            })


        }

        async function insertExpenseData(walletId){

            await findTransactionsById(walletId).then((data)=>{
                insertExpenseDataToForm(data.data);
            })

            async function insertExpenseDataToForm(expenseData){


                let form = $('#editExpenseForm');
                let time = expenseData.transactionInfo.spendOn.split(" ")[1].split(":");
                time = time[0]+":"+time[1];
                time  = (expenseData.transactionInfo.spendOn.split(" ")[0]+"T"+time);


                $(form).find('#expense-time').val(time);
                $(form).find('#expense-name').val(expenseData.transactionInfo.reason);
                $(form).find('#all-categories-options').val(expenseData.transactionInfo.categoryId);
                $(form).find('#expense-note').val(expenseData.transactionInfo.note);


                await listTagsInForm(expenseData.transactionInfo.tagId);


                let walletSplits = expenseData.walletSplits;
                let  initialWalletSplit =  $(form).find('.wallet-split1');
                let filledFirstWalletSplit = false;
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
                        $(newWalletSplit).append('<i class="far fa-times-circle"></i>');
    
                        $(newWalletSplit).find('.far').click((event)=>{
                            $(event.target).closest('.w-split').remove();
                        });
                        
                        $(form).find('#all-wallet-splits').append(newWalletSplit);

                    }
                }

                $(form).find('#update-expense-btn').off();
                $(form).find('#update-expense-btn').click(()=>{ updateExpenseDetails(); })

            }

        }

        async function updateExpenseDetails(){

            let form = $('#editExpenseForm');

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
            let allWalletSplitValues =  $(form).find('.all-wallet-splits').find('.w-split');
    
            for(let k=0; k<allWalletSplitValues.length; k++){   
                let amount = $(allWalletSplitValues[k]).find('#expense-amount').val();
                let walletId = $(allWalletSplitValues[k]).find('.form-wallet-list').val();
                if(walletSplits[walletId]>0){
                    walletSplits[walletId]+= +amount;
                }else{
                    walletSplits[walletId]= +amount;
                    // totalAmount+=amount;
                }
                totalAmount+= (+amount);
            }



            spendOn = spendOn.split(" ");
            let time = spendOn[3].split(":");
            time = time[0]+":"+time[1]+":"+time[2];
            spendOn = spendOn[0]+" "+spendOn[1]+" "+spendOn[2]+" "+utilFunctions.timeCovertor(time);
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


            // Create new category if category not exist
            if(usingNewCategory==true) await createNewCategory();
            async function createNewCategory(){
                let newCategoryName = $(form).find('#new-category-input').val();
                let newCategoryIcon = $(form).find('#new-category-icon').val();

                let raw = {
                    "name": newCategoryName,
                    "imagePath": newCategoryIcon
                }
                raw = JSON.stringify(raw)

                await createCategory(raw).then((data)=>{
                    expenseInfo.transactionInfo.categoryId = data.data.id;
                    console.log(expenseInfo)
                })
            }

            // Validate the new expense json
            if(validateNewExpense(expenseInfo)) updateExpenseApiCall(expenseInfo);
            function validateNewExpense(expenseInfo){
                let error = 0;
                error+=validateValueIsPositive($('#expense-amount'),expenseInfo.amount);
                error+=validateValueNull($('#expense-name'),expenseInfo.transactionInfo.reason)
                return error>0 ? false :true;
            }

            
            // Create expense API call to the server
            function updateExpenseApiCall(expenseInfoo){

                expenseInfoo = JSON.stringify(expenseInfoo)
                $('#spinner').css('display','block');
                updateTransactionsById(walletId,expenseInfoo).then((data)=> {
                    $('#spinner').css('display','none');
                    $('.modal-backdrop').remove();
                    console.log(data);
                    mountExpensesInDashboard();
                });
                $('body').css('overflow', 'scroll');

            }

    
    
        }

    

    }
 
    function mountCreateExpenseForm(){  

        let splitWalletHandler = ()=>{

            let IsAllWalletSplitFilled = ()=> {

                let allWalletSplitValues = $('#create-new-expense-form .w-split');
    
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
   
            if(!IsAllWalletSplitFilled()) return;

            // console.log(123);

            let walletSplitAdditional = $('#newRecord .wallet-split1').clone().removeClass('wallet-split1')
            walletSplitAdditional.find('.message-text').remove();
            walletSplitAdditional.find('#expense-amount').val(0);
            walletSplitAdditional.append('<i class="far fa-times-circle"></i>');
    
            walletSplitAdditional.find('.far').click((event)=>{
                $(event.target).closest('.w-split').remove();
            });
    
            $('.wallet-split1').find('#split-wallet').remove();
    
            walletSplitAdditional.appendTo($('#all-wallet-splits'));
            $('.w-split').addClass('d-flex');
    
            $('.wallet-name-section').addClass('w90');
    
    

        }

        let formSelectedTags = [];
        let currDateTime = (moment().format('YYYY-MM-DD HH:mm').split(" ").join("T"));
        $('#expense-time').val(currDateTime);


        $('#save-expense-btn').click(()=>{ 
            createNewExpense();
        });   // Save Button Handler
        

        $('#expense-more').click(function(){
            $('.more-expense-info').css('display', 'block');
            $('#expense-more').css('display', 'none');
        })

        $('#split-wallet').click(splitWalletHandler)



        let allTags=[];
        if(!listWalletsInForm()){

        }
        listCategoriesInForm()
        listTagsInForm();
        let usingNewCategory = false;

        async function listWalletsInForm(){


            let allWalletsInfo = [];

            let allWallets = null;
            await findWallets().then((data)=>allWallets = (data.data));
    
    
            for(const wallet in allWallets){
                
                
                for(let kgh=0;kgh<allWallets[wallet].length;kgh++){
                    allWalletsInfo.push(allWallets[wallet][kgh]);
                }

            }

            allWallets = allWalletsInfo;
            let allWalletsHTML = '';

            if(allWallets.length==0){
                // alert("Please add wallet to create expense.");
                $('#newRecord .modal-body').html('<div class="h3">Please add wallet to create expense.<div> <br> <button onclick="$(\'.navbar [tabs=wallets]\').click()" class="btn btn-primary">Create Wallet</button>')
                return false;
            }

            for(let i=0;i<allWallets.length;i++){
                allWalletsHTML+='<option value="'+allWallets[i].id+'">'+allWallets[i].name+'</option>'
            }

            // console.log(allWallets);
            
            $('#all-wallets-options').html(allWalletsHTML);
            // $("all-categories-options")
        }
    
        async function listTagsInForm(){
            let allTagsInfo = null;
            await findTags().then((data)=> allTagsInfo= (data.data))
            
            let allTagsHTML = '';
            for(let i=0;i<allTagsInfo.length;i++){
                allTagsHTML+='<option value="'+allTagsInfo[i].id+'">'+allTagsInfo[i].name+'</option>'
                allTags.push(+(allTagsInfo[i].id));
            }

            // allTagsHTML+='<option class="text-warning" value="create-tag">create tag</option>'
    
            $('#locationSets').html(allTagsHTML);
    
    
            var selector = $('#locationSets');
            // selector.selectize({
            //     plugins: ['remove_button']
            // });
            selector.selectize({
                delimiter: ",",
                persist: false,
                create:true,
                plugins: ['remove_button'],
                selectOnTab : true,
                onItemAdd: (value,obj)=>{

                    if(allTags.includes(+value)){
                        formSelectedTags.push(value);
                    }else{
                                            // console.log(obj+' '+value)
                        if(value.length<=3 || value.length>14){
                            alert('pleas create tag in len between 3 and 14');
                            // console.log(obj)
                            $(obj).hide();
                            // $(obj).css('background-color', 'red !important');
                            return false;
                        }

                        createTag(JSON.stringify({
                            "name":""+value,
                            "color":"#44545"
                        })).then((data)=>{
                            allTags.push(data.data.id);
                            formSelectedTags.push(data.data.id);
                        })
                    }
                    return false;
                },
                onItemRemove : ((value)=>{
                    formSelectedTags = formSelectedTags.filter(e => e != value)
                    // console.log(formSelectedTags)
                })
              });

            $('.selectize-control input').attr('maxlength','14')

        }

        async function listCategoriesInForm(){
            let allCategories = null;
            
            await findCategories().then((data)=> allCategories= (data.data))
            

            let allCategoriesHTML = '';
            allCategoriesHTML+='<option value="0"> General</option>'
            for(let i=0;i<allCategories.length;i++){
    
                allCategoriesHTML+='<option class="category-list-option" ico="'+allCategories[i].imagePath+'" value="'+allCategories[i].id+'">'+allCategories[i].name+'</option>'
            }
            allCategoriesHTML+='<option ico="create-cat" class="create-category-option">+ create new category</option>'
            $('#all-categories-options').html(allCategoriesHTML);
    
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
                    for(let i=0;i<allIcons.length;i++){
                        fontAwesomeIconeHtml+='<option style="font-weight:900" value="'+allIcons[i]+'">'+"&#x"+allIcons[i]+'</option>'
                    }
                    $('#new-category-icon').html(fontAwesomeIconeHtml);
                }else{
                    $('#form-category-icon').html('<span class="create-category-ico" >&#x'+icon+'</span>')
                }
    
            })


        }

        async function createNewExpense(e){
            // e.preventDefault();
            let totalAmount = 0;
            let reason = $('#expense-name').val();
            let spendOn = moment().format('MMM D, YYYY, h:mm:ss a');
            let userSpendOn = $('#expense-time').val();
            let walletId = $('#all-wallets-options').val();
            let categoryId = $('#all-categories-options').val();
            let note = $('#expense-note').val();

            // if(!splitWalletHandler.IsAllWalletSplitFilled()) return; 

            let tagInfo = [];

            for(let i = 0; i < formSelectedTags.length; i++){
                tagInfo.push(+(formSelectedTags[i]));
            }

            
            // Setting todays date for spend on date
            if(userSpendOn.length>0){

                let time =  userSpendOn.split("T")[1];
                userSpendOn = new Date(userSpendOn);

                const year = userSpendOn.getFullYear(); // 2017
                const month = userSpendOn.getMonth(); // 11
                const dayOfMonth = userSpendOn.getDate(); // 7


                userSpendOn = months[month]+" "+dayOfMonth+", "+year+", "+utilFunctions.timeCovertor(time+":03");
                // console.log(userSpendOn);
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

            // console.log(expenseInfo)

            // Create new category if category not exist
            if(usingNewCategory==true){
                await createNewCategory();
            }
            async function createNewCategory(){
                let newCategoryName = $('#new-category-input').val();
                let newCategoryIcon = $('#new-category-icon').val();

                let raw = {
                    "name": newCategoryName,
                    "imagePath": newCategoryIcon
                }
                raw = JSON.stringify(raw)

                await createCategory(raw).then((data)=>{
                    expenseInfo.transactionInfo.categoryId = data.data.id;
                })
            }

            if(validateNewExpense(expenseInfo)) createExpenseApiCall(expenseInfo)

            // Validate the new expense json
            function validateNewExpense(expenseInfo){
                let error = 0;
                error+=validateValueIsPositive($('#expense-amount'),expenseInfo.amount);
                error+=isLessThanCrored($('#expense-amount'),expenseInfo.amount);
                error+=validateValueNull($('#expense-name'),expenseInfo.transactionInfo.reason)

                let allWalletSplitValues = $('#create-new-expense-form .w-split');
    
                for(let k=0; k<allWalletSplitValues.length; k++){
                    let amount = $(allWalletSplitValues[k]).find('#expense-amount').val();
                    if(amount == 0 || amount==undefined || amount==null){
                        $(allWalletSplitValues[k]).find('#expense-amount').css('border-color','red')
                        error+=1;
                        // return false;
                    }else{
                        $(allWalletSplitValues[k]).find('#expense-amount').css('border-color','#ced4da')
                    }
                }
                // return true;


                return error>0 ? false :true
            }

            // Create expense API call to the server
            async function createExpenseApiCall(expenseInfoo){
                expenseInfoo = JSON.stringify(expenseInfoo)
                $('#spinner').css('display','block');
                await createTransactions(expenseInfoo).then((data)=> {
                    $('#newRecord .btn-close').click();
                    $('#spinner').css('display','none');
                    mountExpensesInDashboard();
                    balanceHeaderUpdate();
                })
            }

        }



    
    }

}

function mountWallets(){
    balanceHeaderUpdate();

    $('#wallets').html('');


    let walletContainer = document.getElementById("wallets");
    // walletContainer.innerHTML = '';
    let walletContainerTemplate = document.getElementById("wallet-container-header");
    let clone = walletContainerTemplate.content.cloneNode(true);
    walletContainer.appendChild(clone);

    let allNonCardWallets = [];

    findAllWallets();

    $('#new-wallet-type').click((event)=>{
        mountWalletSubInforForm(event.target.value)
    })

    $('#create-wallet').click(()=> walletSubmissionHandler());


    $('.add-income-btn').click(()=>{
        // console.log(allNonCardWallets);

        let walletSelection = $('#incomeModal').find('.wallet-selection');

        for(let i=0;i<allNonCardWallets.length;i++){
            walletSelection.append('<option value='+allNonCardWallets[i].id+'>'+allNonCardWallets[i].name+'</option>');
        }

    })



    async  function findAllWallets(){

        let allWallets = null;
        await findWallets().then((data)=>allWallets = (data.data));

        // console.log(allWallets);
        let totalWalletCount = 0;
        for(const walletCat in allWallets){
            
            let category = walletCat;
            if(category =='Credit Card'){

                populateCreditCards(allWallets[walletCat]);
            }else populateWallets(allWallets[walletCat],category);

            totalWalletCount+=allWallets[walletCat].length;
        }
        if(totalWalletCount == 0 ){
            $('.no-wallet-available').show();
            $('.no-wallet-available .url').click(()=>{
                $('.add-wallet-btn').click();
            })
        }
        $('#total-acct-count').text(totalWalletCount);
    }

    async function populateCreditCards(allWallets){
        let creditCardTemplate = $('#credit-card-template').clone(); 
        let totalCardExpense = 0;

        let walletSymbol = {
        'Bank Account': 'fa-building-columns',
        'Credit Card': 'fa-credit-card',
        'Bonus Account':'fa-gift',
        'Other':'fa-piggy-bank'
        }

        if(allWallets.length==0) $('.cards-section').hide();
        for(let i = 0; i < allWallets.length; i++){

            // Appennd in new card clone to the current creating section
            let walletCardClone = $('#credit-card-template')[0].content.cloneNode(true);
            // walletCardClone.attr('id','sdgdg'+i);

             let subInfo =null;
             await findWalletById(allWallets[i].id).then((data) =>{
                subInfo = data.data.walletInfo;
             })


            
            
            let wallet = allWallets[i];            
            let creditCardUsagePercent = ((subInfo.limit- wallet.balance) / subInfo.limit) * 100;

            $(walletCardClone).find(".card-name").html('<i class="fa-solid '+walletSymbol[wallet.type]+'"></i>'+"  "+ wallet.name)


            $(walletCardClone).find('.amount').text(wallet.balance)

            // console.log();

            $(walletCardClone).find('#open-wallet-btn').attr('wallet-id',wallet.id)

            $(walletCardClone).find('.edit-wallet-btn').attr('wallet-id',wallet.id);

            $(walletCardClone).find('.delete-wallet-btn').attr('wallet-id',wallet.id);

            $(walletCardClone).find('.credit-card').attr('data-bs-toggle','modal');
            $(walletCardClone).find('.credit-card').attr('data-bs-target','#walletInfoModal'+wallet.id);
            $(walletCardClone).find('#walletInfoModal').attr('id','walletInfoModal'+wallet.id);
            $(walletCardClone).find('.wallet-exclude-stats').text(wallet.excludeFromStats);
            $(walletCardClone).find('.card-limit').text(subInfo.limit)

            $(walletCardClone).find('.pay-bill-btn').attr('wallet-id',wallet.id);
            $(walletCardClone).find('.pay-bill-btn').attr('payment',subInfo.limit- wallet.balance);


           
            // console.log(subInfo.limit)
            let currentDate = new Date().getDate();
            let repayDate =  subInfo.repayDate;



            const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

            let isDateTOne = false;
            if(subInfo.repayDate=='31'){
                isDateTOne = true;
            }

            i
            const d = new Date();
            let name = month[(d.getMonth()+1)%12];

            let diffDays = '';
            if((d.getMonth()%2==0 && isDateTOne) || !isDateTOne){
                diffDays= name+" "+subInfo.repayDate;
            }else if(isDateTOne){
                diffDays= month[(d.getMonth()+2)%12]+" 1";
                
            }


            $(walletCardClone).find('.days-left').text(diffDays);
            $(walletCardClone).find('.due-date').text(subInfo.repayDate);

            $(walletCardClone).find('.delete-wallet-btn').click(function(event) {
                let walletId = event.target.getAttribute('wallet-id');
                console.log(walletId)
                $('#spinner').show();
        
                deleteWalletById(walletId).then(()=>{
                    $('#spinner').hide();
                    mountWallets();
                })
            })


            $(walletCardClone).find('.pay-bill-btn').click((event)=>{




                if(event.target.getAttribute('payment')=='0'){
                    $('#creditBillModal').find('.modal-body').html('<h1>No Bills</h1>')
                console.log($('#creditBillModal'))

                }
                
                // console.log($('#creditBillModal'))
                // $('#creditBillModal').html('<h1>No Bills</h1>')


                $('#creditBillModal').find('.amount').val(event.target.getAttribute('payment'));
                $('#creditBillModal').find('#new-income-wallet').val(wallet.id);
                $('#total-bill').text(event.target.getAttribute('payment'));
                
    
                
            })

            totalCardExpense +=subInfo.limit- wallet.balance;
            $('.card-used-amount').text(totalCardExpense);

            
            $(walletCardClone).find('.credit-card-used').text(creditCardUsagePercent.toFixed(2));
            // console.log((wallet.balance +"-"+ subInfo.limit)+" percentage="+(wallet.balance / subInfo.limit) * 100)
        
            if(creditCardUsagePercent>100){
                $(walletCardClone).find('.overdraft-warning').css('display', 'block');
            }

              // show input box on click
            $(walletCardClone).find('.wallet-info-label').click((event)=>{
                inputOnClick(event.target);
                $('.edit-wallet-btn').show();
            });


            // $(walletCardClone).find('.wallet-info-label').append($('<i class="fas fa-edit m-1"></i>'))
            $(walletCardClone).find('.wallet-info-label').hover((event)=>{
                // console.log(23);
                $(event.target).after($('<i class="fas fa-edit m-1"></i>'));

            },(event)=>{
                $(event.target).siblings('.fas').remove();
            })


            $(walletCardClone).find('.edit-wallet-btn').click((event)=>{
                handleEditWallet(event);
             })

            
            let bg1 = colorOne[wallet.id%9+1];
            let bg2 = colorTwo[wallet.id%9];


           
            // $(walletCardClone).find('.credit-card').css('background-color','red')
             

            function inputOnClick(element){
                let textBox = $(element);
                let text = textBox.text();

                let input = '';
                if(textBox.hasClass('day-selection')){

                    input = '<select type="text" class="due-date" >'
                    for(let i=1;i<=31;i++){
                        input += '<option value="' + i + '">'+i+"</option>";
                    }
                    textBox.removeClass('wallet-info-label')
                    // textBox.parent().removeClass('')
                    textBox.replaceWith(($(input)));
                    // input.select();
                }else{

                    input = '<input id="attribute" class="" type="text" value="' + text + '" />';
                    input = $(input)
                    textBox.text('').append(input);
                    input.select();
                        
                    input.blur(function() {
                        var text = $('#attribute').val();
                        $('#attribute').parent().text(text);
                        $('#attribute').remove();
                    });


                }

    
            }


            function handleEditWallet(event) {
                let cardElement = $(event.target).parent().parent();
                

                let walletId =  $(event.target).attr('wallet-id');
                let walletInfo = {};
                walletInfo['name'] = $(cardElement).find('.card-name').text().trim();
                walletInfo['type'] = 'Credit Card'
                walletInfo['balance'] = $(cardElement).find('.amount').text();
                walletInfo['excludeFromStats'] = $(cardElement).find('.wallet-exclude-stats').text();
                // walletInfo['excludeFromStats'] = false;
                walletInfo['archiveWallet'] = false;
    
                walletInfo['walletInfo'] = {};
        
                let walletType = walletInfo['type'];
                if(walletType=='Bank Account'){
                    walletInfo['walletInfo']['accountNumber'] = +($(cardElement).find('.accountNumber').text());
                    walletInfo['walletInfo']['ifscCode'] = $(cardElement).find('.ifscCode').text();
        
                }else if(walletType == 'Credit Card'){
                    walletInfo['walletInfo']['repayDate'] = (($(cardElement).find('.due-date option:selected')).val());
                    walletInfo['walletInfo']['limit'] = + (($(cardElement).find('.card-limit')).text());
                
                }else if(walletType == 'Bonus Account'){
                    walletInfo['walletInfo']['note'] = $(cardElement).find('.note').text();
                }else if(walletType == 'Other'){
                    walletInfo['walletInfo']['note'] = $(cardElement).find('.note').text();
                }

    
                $('#spinner').show();

                console.log(walletInfo);

                updateWalletById(walletId,JSON.stringify(walletInfo)).then((data)=>{
                    console.log(data);
                    $('#spinner').hide();
                    $(event.target).hide();
                })
            }

          

            $('#credit-cards').append($(walletCardClone));
             
        }

        $(".card-sc-right").click( function() {

            $('.credit-cards').animate({scrollLeft:  ($('.credit-cards').scrollLeft() + 400) }, 300);
            
            
            let totalWidth =  $('.credit-cards')[0].scrollWidth - $('.credit-cards').width() ;
            let occuredWidth =  $('.credit-cards').scrollLeft();

            console.log(totalWidth + " " + occuredWidth);

            if(totalWidth==occuredWidth){
                $(".card-sc-right").hide();
            }

        })

        $(".card-sc-left").click(function() {

            $('.card-sc-right').css('display', 'flex');
            
            $('.credit-cards').animate({scrollLeft:  ($('.credit-cards').scrollLeft() - 400) }, 300);
           
            if($('.credit-cards').scrollLeft()==0){
                $('.card-sc-left').css('display', 'none');
            }
        })

        let totalWidth = $('.credit-cards')[0].scrollWidth;
        let containerWidth = $('.credit-cards').width();
        if(totalWidth==containerWidth) $(".card-sc-right").hide();

        $('.add-income-submit').click((event)=>{

            let form = $(event.target).closest('.create-expense-form');
    
    
            let paymentAmount = +($(form).find('.amount').val());
            let note = $(form).find('.note').val();
            let walletId =  +($(form).find('.wallet-selection').val());
    
            let isValid = 0;
            isValid += validateValueIsNumber($(form).find('.amount'),paymentAmount);
            isValid +=validateValueIsNumber($(form).find('.wallet-selection'),walletId);
            // validateValue();
    
            if(isValid>0) return;
    
            let income = {
                "type" : "income",
                "amount" : paymentAmount,
                "transactionInfo" : {
                    "note" : note,
                    "walletId" : walletId
                }
            }
    
            $('#spinner').show();
            createTransactions(JSON.stringify(income)).then((data)=>{
                $('#spinner').hide();   
                // findAllWallets();
                mountWallets();
            })
    
            $('.credit-bill-close-btn').click();
            $('.income-model-close-btn').click();
            // mountWallets();
        })
    

    }

    async function populateWallets(allWallets,category){

        let walletSymbol = {
            'Bank Account': 'fa-building-columns',
            'Credit Card': 'fa-credit-card',
            'Bonus Account':'fa-gift',
            'Other':'fa-piggy-bank'
        }

        if(allWallets.length==0) return;
        let categoryAsClass = category.split(' ').join('_');
        let newWalletSection = $('<span class="card-body '+categoryAsClass+'">'+''+'</span>');
        let selectinClassName = "."+categoryAsClass;

        // console.log(category)

        for(let i = 0; i < allWallets.length; i++){

            allNonCardWallets.push(allWallets[i]);

            // Appennd in new card clone to the current creating section
            let walletCardClone =  $('#wallet-card-template')[0].content.cloneNode(true);
            let currentWalletSection = $(newWalletSection);
            

            let wallet = allWallets[i];       
            let icon = ('<i class="fa-solid '+walletSymbol[wallet.type]+'"></i>')     
            $(walletCardClone).find(".acct-type-ico").html(icon);
            $(walletCardClone).find(".bank-name").text(wallet.name)
            $(walletCardClone).find('.balance').text( wallet.balance)
            $(walletCardClone).find('.acct-type').text(wallet.type)   
            $(walletCardClone).find('#open-wallet-btn').attr('wallet-id',wallet.id)
            $(walletCardClone).find('#open-wallet-btn').attr('data-bs-target','#walletInfoModal'+wallet.id);
            $(walletCardClone).find('#walletInfoModal').attr('id','walletInfoModal'+wallet.id);
            $(walletCardClone).find('.wallet-exclude-stats').text(wallet.excludeFromStats);
            $(walletCardClone).find('.edit-wallet-btn').attr('wallet-id',wallet.id);
            $(walletCardClone).find('.delete-wallet-btn').attr('wallet-id',wallet.id);


            // Populate sub wallet info
            await findWalletById(+(wallet.id)).then((data)=>{
                
                console.log(data);
                data = data.data.walletInfo;
                let subWalletInfoHtml = '';
                // allObjects[obj] = data[obj]

                for(const obj in data) {
                    let key = obj;
                    var text = obj;
                    var result = text.replace( /([A-Z])/g, " $1" );
                    key =  result;

                    let className = obj;
                    if(obj=='id') continue;
                    if(obj=='accountNumber'){
                        key = 'Account';
                        if(data[obj]=='0') data[obj] = "not specified";
                    }
                    if(obj=='ifscCode'){
                        key = 'IFSC';
                        if(data[obj]=='') data[obj] = "not specified";

                    }
                        
                    subWalletInfoHtml += ' <div class="uncommon-wallet-field mb-2"><div class="ucf-key">'+key+' :</div><div class="ucf-value '+obj+'">'+data[obj]+'</div></div>';

                }

                $(walletCardClone).find('#walletInfoModal'+wallet.id+' .modal-body').append(subWalletInfoHtml);
                $(walletCardClone).find('.uncommon-wallet-fields').append(subWalletInfoHtml);
                
            })
            
            // show input box on click
            $(walletCardClone).find('.wallet-info-label').click((event)=>{
                inputOnClick(event.target);
                $('.edit-wallet-btn').show();
            });

            $(walletCardClone).find('.ucf-value').click((event)=>{
                inputOnClick(event.target);
                $('.edit-wallet-btn').show();
            });
            // SHow edit button on hover
            $(walletCardClone).find('.wallet-info-label').hover((event)=>{
                // console.log(23);
                $(event.target).after($('<i class="fas fa-edit m-1"></i>'));

            },(event)=>{
                $(event.target).siblings('.fas').remove();
            })

            $(walletCardClone).find('.delete-wallet-btn').click(function(event) {
                let walletId = event.target.getAttribute('wallet-id');
                $('#spinner').show();
        
                deleteWalletById(walletId).then(()=>{
                    $('#spinner').hide();
                    mountWallets();
                })
            })

            $(walletCardClone).find('.edit-wallet-btn').click((event)=>{
               handleEditWallet(event);
            })

            $('#all-wallets-container').append(walletCardClone);


        }

        function inputOnClick(element){
            // console.log(element)
            let textBox = $(element);
            var text = textBox.text();
            var input = $('<input id="attribute" type="text" value="' + text + '" />')
            textBox.text('').append(input);
            input.select();

            input.blur(function() {
                var text = $('#attribute').val();
                $('#attribute').parent().text(text);
                $('#attribute').remove();
            });


        }

        function handleEditWallet(event) {
            let cardElement = $(event.target).parent().parent();

            let walletId =  $(event.target).attr('wallet-id');
            let walletInfo = {};
            walletInfo['name'] = $(cardElement).find('.bank-name').text();
            walletInfo['type'] = $(cardElement).find('.acct-type').text();
            walletInfo['balance'] = $(cardElement).find('.balance').text();
            walletInfo['excludeFromStats'] = $(cardElement).find('.wallet-exclude-stats').text();
            walletInfo['archiveWallet'] = false;
            walletInfo['walletInfo'] = {};
    
            let walletType = walletInfo['type'];
            if(walletType=='Bank Account'){
                walletInfo['walletInfo']['accountNumber'] = +($(cardElement).find('.accountNumber').text());
                walletInfo['walletInfo']['ifscCode'] = $(cardElement).find('.ifscCode').text();
    
            }else if(walletType == 'Credit Card'){
                walletInfo['walletInfo']['repayDate'] = $(cardElement).find('.repayDate').text();
                walletInfo['walletInfo']['limit'] = $(cardElement).find('.limit').text();
            
            }else if(walletType == 'Bonus Account'){
                walletInfo['walletInfo']['note'] = $(cardElement).find('.note').text();
            }else if(walletType == 'Other'){
                walletInfo['walletInfo']['note'] = $(cardElement).find('.note').text();
            }
    

            $('#spinner').show();

            updateWalletById(walletId,JSON.stringify(walletInfo)).then((data)=>{
                $('#spinner').hide();
                $('.modal-backdrop').remove();
                $('body').css('overflow','scroll');
                mountWallets();

            })
        }
        
        walletContainer.appendChild(newWalletSection[0]); 

    }

    function mountWalletSubInforForm(walletType){

        $('#wallet-info-form').html('');

        

        if(walletType=='Bank Account'){
            let bankWalletForm = $('#create-wallet-bank-account')[0];
            let w1c = bankWalletForm.content.cloneNode(true);
            $('#wallet-info-form').append(w1c);

        }else if(walletType =='Credit Card'){

            let creditCardForm = $('#create-wallet-credit-card')[0];
            let w2c = creditCardForm.content.cloneNode(true);
            // $(w2c).find('#new-wallet-limit').val($('#new-wallet-balance').val());


            console.log($('#new-wallet-balance'));


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
    }

    function walletSubmissionHandler(){

        
        
        let walletName = $('#new-wallet-name').val();
        let acctBalance = ($('#new-wallet-balance').val());
        let walletType = $('#new-wallet-type').val();
        let walletExludeFromStats = $('#new-wallet-exclude').val();

        let newWalletObject = {
            "name": walletName,
            "type": walletType,
            "archiveWallet": false,
            "balance": +acctBalance,
            "excludeFromStats": walletExludeFromStats,
        }

        let isValid = 0;
        if(newWalletObject.type=='Bank Account'){
            newWalletObject['walletInfo'] = {
                "accountNumber": +($('#new-wallet-accno').val()),
                "ifscCode": $('#new-wallet-ifsc').val(),
            }
            // if($('#new-wallet-accno').val().length>0)
            isValid += IsNullOrNumber( $('#new-wallet-accno'),Number($('#new-wallet-accno').val()));
            isValid += isNullOrIfsc(  $('#new-wallet-ifsc'), $('#new-wallet-ifsc').val());

        }else if(newWalletObject.type=='Credit Card'){
            // console.log($('#new-wallet-repay').val())
            newWalletObject['walletInfo'] = {
                "repayDate" : $('#new-wallet-repay').val(),
                "limit": +($('#new-wallet-limit').val())
             }
             isValid += validateValueIsNumber( $('#new-wallet-repay'),acctBalance);
             isValid += validateValueIsPositive( $('#new-wallet-repay'),acctBalance);
             isValid += isLessThanCrored( $('#new-wallet-repay'),acctBalance);
             isValid += validateValueNull( $('#new-wallet-limit'),+($('#new-wallet-limit').val()));

        }else if(newWalletObject.type=='Bonus Account'){
            newWalletObject['walletInfo'] = {
                "note" : $('#new-wallet-bnote').val()
            }
        }else if(newWalletObject.type=='Other'){
            newWalletObject['walletInfo'] = {
                "note" : $('#new-wallet-onote').val()
            }
        }

        
        isValid += validateValueIsPositive( $('#new-wallet-balance'),acctBalance);
        isValid += isLessThanCrored( $('#new-wallet-balance'),acctBalance);
        isValid += validateValueNull( $('#new-wallet-name'),walletName);
        isValid += validateValueNull( $('#new-wallet-type'),walletType);

        if(isValid>0) return;
        

        $('#spinner').css('display', 'block');

        createWallet(JSON.stringify(newWalletObject)).then((data) =>{
            // console.log(data);  

            $('#spinner').css('display', 'none');
            $('#wallets .btn-close').click();

            mountWallets();


        })
        
    }

    $('.card-sc-right').click(()=>{
        $('.card-sc-left').css('display', 'flex');
    })

    $('.add-wallet-btn').click( async ()=>{

        let allWalletsInfo = [];
        let allWallets = null;
        await findWallets().then((data)=>allWallets = (data.data));


        for(const wallet in allWallets){
            
            
            for(let kgh=0;kgh<allWallets[wallet].length;kgh++){
                allWalletsInfo.push(allWallets[wallet][kgh]);
            }

        }

        allWallets = allWalletsInfo;
        let allWalletsHTML = '';

        // console.log(allWallets)


        for(let i=0;i<allWallets.length;i++){
            if(allWallets[i].type=='Credit Card') continue;
            allWalletsHTML+='<option value="'+allWallets[i].id+'">'+allWallets[i].name+'</option>'
        }

        $('#incomeModal .wallet-selection').html(allWalletsHTML);

    });

}

function validateValueNull(element,value){

    if(value==null || value==undefined || value==0 || value=='null'){
        $(element).css('border', '1px solid red');

        return 1;
    }else{
        $(element).css('border', '1px solid #ced4da');
        return 0;
    }
}

function validateValueIsNumber(element,value){
    // var reg = ;
    // var reg = new RegExp('/^\d+$/');
    
    if(/\d/.test(value)){
        $(element).css('border', '1px solid #ced4da');
        // return 0;
        if(value==0){
            $(element).css('border', '1px solid red');
            return 1
        }
        return 0;
    }else{
        $(element).css('border', '1px solid red');
        return 1;
    }


}

function IsNullOrNumber(element,value){

    console.log(value)
    if(value.length==0 || value == null || value==undefined || value==0){
        return 0;
    }

    if(typeof value === 'number' && isFinite(value)){
        $(element).css('border', '1px solid #ced4da');
        // return 0;
        if(value==0){
            $(element).css('border', '1px solid red');
            return 1
        }
        return 0;
    }else{
        $(element).css('border', '1px solid red');
        return 1;
    }


}

function isNullOrIfsc(element,value){
    if(value.length==0 || value == null || value==undefined){
        return 0;
    }
    var reg = /[A-Z|a-z]{4}[0][a-zA-Z0-9]{6}$/;    
    if (value.match(reg)) {    
        $(element).css('border', '1px solid #ced4da');
        return 0;    
    }    
    else {    
        $(element).css('border', '1px solid red'); 
        return 1;    
    }    
}

function validateValueIsPositive(element,value){
    // var reg = ;
    // var reg = new RegExp('/^\d+$/');
    
    if(/\d/.test(value)){
        $(element).css('border', '1px solid #ced4da');
        // return 0;
        if(value<=0){
            $(element).css('border', '1px solid red');
            return 1
        }
        return 0;
    }else{
        $(element).css('border', '1px solid red');
        return 1;
    }


}

function isLessThanCrored(element,value){
    if(/\d/.test(value)){
        $(element).css('border', '1px solid #ced4da');
        // return 0;
        if(value<=0 || value>=10000000){
            $(element).css('border', '1px solid red');
            return 1
        }
        return 0;
    }else{
        $(element).css('border', '1px solid red');
        return 1;
    }

}

// Set balance in header container
async function balanceHeaderUpdate(){     

    let allWallets =[];
    await findWallets().then((data)=>allWallets = (data.data));


    let totalWalletCount = 0;
    let totalBalance = 0;
    for(const walletCat in allWallets){
        totalWalletCount+=allWallets[walletCat].length;

        for(const wallet in allWallets[walletCat]){
            totalBalance+= (+allWallets[walletCat][wallet].balance);
        }
    }
    $('#total-acct-count').text(totalWalletCount);
    // $('#mi-bal-amount').text(totalBalance +" ₹");
    $('#mi-bal-amount').text(new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(totalBalance) +" ₹");
}


