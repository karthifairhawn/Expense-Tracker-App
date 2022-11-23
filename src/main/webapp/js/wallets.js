import {findTransactions,createTransactions} from '../apis/transactions.js';
import {findWalletById, findWallets,createWallet,deleteWalletById,updateWalletById} from '../apis/wallets.js';


$('.nav-item[tabs=wallets]').addClass('active')


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


// Mount Dashboard by default
var currTimeSpan = 'Today';
let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
let colorOne = ['d6eb70','cc7aa3','85cc70','99ff66','a3f5f5','9999f5','ada399','ffd6ff','f5b87a','fadbbd','99b8cc'];
let colorTwo = ['ebf5b8','e6bdd1','c2e6b8','ccffb3','d1fafa','ccccfa','d6d1cc','ffebff','fadbbd','c2c2d1','ccdbe6'];

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
    $('#mi-bal-amount').text(new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(totalBalance) +" ₹");
}


mountWallets();
function mountWallets(){
    balanceHeaderUpdate();

    $('#wallets').html('');
    let walletContainer = document.getElementById("wallets");
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

        let walletSelection = $('#incomeModal').find('.wallet-selection');

        for(let i=0;i<allNonCardWallets.length;i++){
            walletSelection.append('<option value='+allNonCardWallets[i].id+'>'+allNonCardWallets[i].name+'</option>');
        }

    })

    let allWallets = null;
    $('.view-income-btn').click(async ()=>{

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
        end = end.format('YYYYMMDD').split('-').join('');

        let incomeData = null;
        await findTransactions(start,end,'incomes').then((data)=>incomeData = data.data.incomes);

        $('#allIncomes .income-table-view .tbody').html('');

        for(let i = 0; i < incomeData.length; i++){
            let newRow = $('<tr> <th scope="row" class="note">1</th> <td class="time">Mark</td> <td class="wallet">Otto</td> <td class="amount">@mdo</td> </tr>');

            let walletInfo = null;
            await findWalletById(incomeData[i]['transactionInfo']['walletId']).then((wallet)=>{
                walletInfo = wallet;
            });

            walletInfo.data[incomeData[i]['transactionInfo']['walletId']]

            newRow.find('.note').text(incomeData[i]['transactionInfo']['note']);
            newRow.find('.time').text(incomeData[i]['timestamp']);
            newRow.find('.wallet').text((walletInfo.data.name));
            newRow.find('.amount').text(incomeData[i]['amount']+" ₹");

            $('.income-table-view .tbody').append(newRow);
        }

        if(incomeData.length==0){
            $('.income-table-view .tbody').append('<h3>No Income Transactions</h3>');
        }
    })


    async  function findAllWallets(){

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

        for(let i = 0; i < allWallets.length; i++){

            allNonCardWallets.push(allWallets[i]);

            // Appennd in new card clone to the current creating section
            let walletCardClone =  $('#wallet-card-template')[0].content.cloneNode(true);
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
                
                data = data.data.walletInfo;
                let subWalletInfoHtml = '';
                let formWalletInfo = $('<div></div>');
                // allObjects[obj] = data[obj]

                for(const obj in data) {
                    let newWalletInfo = $('<div class="mb-2 d-flex align-items-center card-field"> <div class="label"></div><div class="spend-on value wallet-info-label '+obj+'"></div> </div>');
                    if(obj=='note'){
                        newWalletInfo = $('<div class="mb-2 d-flex align-items-center flex-column w-100 card-field"> <div class="label w-100"></div><span class="w-100 d-flex align-items-center"><div class="w-100 spend-on value wallet-info-label '+obj+'" type="textarea"></div></span> </div>');
                    }
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

                    $(newWalletInfo).find('.label').text(key);   
                    $(newWalletInfo).find('.value').text(data[obj]);   
                    
                    subWalletInfoHtml +='<div class="uncommon-wallet-field mb-2"><div class="ucf-key">'+key+' :</div><div class="ucf-value">'+data[obj]+'</div></div>';
                    $(formWalletInfo).append(newWalletInfo);
                }

                $(walletCardClone).find('#walletInfoModal'+wallet.id+' .modal-body').append(formWalletInfo);
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

            let type = $(element).attr('type');
            if(type=='textarea'){
                input = $('<textarea id="attribute" style="width:100%" type="text" value="' + text + '" />');
                input.val(text)
            }
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


// Validator Functions
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


