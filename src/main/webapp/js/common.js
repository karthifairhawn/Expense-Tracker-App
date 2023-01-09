import {findWallets} from '../apis/wallets.js';
import * as util from './util.js';
import * as userService from '../apis/users.js'
import * as notificationService from '../apis/notifications.js'


// Redirect to login if no authToken
var userData = null;
let authToken = localStorage.getItem('authToken');
if(authToken == null || authToken.length == 0 || typeof authToken === undefined){
    if(window.location.href.split('/')[3]!='login.html'){
        window.location.href = 'login.html';
    }
}else{
    await userService.findUserById(localStorage.getItem('userId')).then((val)=>{
        userData  = val.data;
        if(window.location.href.split('/')[3]!='login.html' && val.statusCode!=200){
            window.location.href = 'login.html';
        }
    });
}

var totalNonReadNotifications = 0;
var totalNotifications = 0;

export function fetchNotifications(){

    notificationService.findAll().then((data)=>{
        populateNotifications(data.data,"notificaitons-container");

        $('.notifications-body').off();
        $('.notifications-body').click((e)=>{
            let notificationId = $(e.target).closest('.notifications-body').find('.not-del-btn').attr('notification-id');
            $(e.target).closest('.notifications-body').find('.unread-not-ico').remove();
            $(e.target).closest('.notifications-body').removeClass('unread-not');
            let raw = {
                readed: true
            }
            notificationService.updateById(notificationId,JSON.stringify(raw)).then((data)=>{
                totalNonReadNotifications--;
                $(e.target).closest('.notifications-body').css('opacity','0.7');
                notificationIndicator(totalNonReadNotifications);
            })
        });

        $('.not-del-btn').off();
        $('.not-del-btn').click((e)=>{
            let notificationId = $(e.target).closest('.not-del-btn').attr('notification-id');
            notificationService.deleteById(notificationId).then(()=>{
                $(e.target).closest('.notifications-body').remove();
            })
            totalNotifications--;
            zeroNotificationsHandler(totalNotifications);
        })

        $('.nav-notification').off();
        $('.nav-notification').click(()=>{
            $('#notifications').toggle();
            $('body').off();
           
    
            if($('#notifications').css('display')=='block'){
                $('body').off();
                $('body').click((evt)=>{    
                    if(evt.target.id == "notifications")
                       return;
                    //For descendants of menu_content being clicked, remove this check if you do not want to put constraint on descendants.
                    if($(evt.target).closest('#notifications').length)
                       return;             
        
                       if(!($(evt.target).hasClass('nav-notification') || $(evt.target).hasClass('fa-bell'))){
                           $('#notifications').toggle();
                           $('body').off();
                       }
                });
            }
    
        });

        $('#clear-not').off();
        $('#clear-not').click(()=>{
            notificationService.deleteAll().then((data)=>{
                if(data.statusCode!=200) return;
                $("#notificaitons-container").html("");
                $("#notificaitons-container").append($("<h2 class='mt-3'><center>No Notifications</center></h2>"))
            })
        })

    });


    function populateNotifications(notifications,containerId){
        let notificationIcons ={
            remainder : '<i class="fa-solid fa-clock-rotate-left"></i>',
            payment : '<i class="fa-solid fa-file-invoice-dollar"></i>'
        }
        let container = $("#"+containerId)[0];
        $(container).html("");

        for(let i=notifications.length-1;i>=0;i--){
            
            let notificationElement = $('<div class="notifications-body d-flex align-items-center">'+
                                        '<div class="not-ico d-flex align-items-center justify-content-center">'+
                                            '<i class="fa-sharp fa-solid fa-money-bill"></i>'+
                                        '</div>'+
                                
                                        '<div class="not-right">'+
                                            '<h5 class="not-title">Credit card bill.</h5>'+
                                            '<span class="not-body">HDFC Card bill payment due in 2 days.</span>'+
                                        '</div>'+
                                
                                        '<div class="not-time">5 min ago</div>'+
                                
                                        '<div class="not-del-btn"><i class="fa-regular fa-circle-xmark"></i></div>'+
                                    '</div>');

            $(notificationElement).find('.not-title').text(notifications[i].title);
            let secondsAgo = notifications[i].createdOn;
            secondsAgo = moment(new Date(secondsAgo)).minutesFromNow();
            $(notificationElement).find('.not-time').text(secondsAgo=='0 mins ago'? 'few seconds ago' : secondsAgo);
            $(notificationElement).find('.not-body').text(notifications[i].info);
            $(notificationElement).find('.not-ico').html(notificationIcons[notifications[i].type]);
            $(notificationElement).find('.not-del-btn').attr('notification-id',notifications[i].id);
            if(notifications[i].readed==0){
                totalNonReadNotifications++;
                $(notificationElement).find('.not-title').prepend('<i class="fa-solid fa-circle-info unread-not-ico"></i> ')
                $(notificationElement).find('.notifications-body').addClass('unread-not');
                $(notificationElement).css('opacity','1');
            }else{

            }
            $(container).append(notificationElement);

        }
        
        
        zeroNotificationsHandler(notifications.length);
        notificationIndicator(totalNonReadNotifications);
        totalNotifications=notifications.length;

    }

    function notificationIndicator(totalNonReadNotifications){
        if(totalNonReadNotifications>0){
            $('.nav-notification').append('<i class="fa-solid notification-present-inc fa-circle"></i>')
        }else{
            $('.nav-notification').find('.notification-present-inc').remove();
        }
    }

    function zeroNotificationsHandler(count){
        if(count==0){
            $('#notificaitons-container').append($("<h2 class='mt-3 zero-notification'><center>No Notifications</center></h2>"))
        }else{
            $('.zero-notification').remove();
        }
    }



}

function initiateListeners(){

    // HTML componenet injector
    $(function () {
        var includes = $('[data-include]')
        $.each(includes, function () {
          var file = $(this).data('include')
          $(this).load(file)
        })
    })

    
    // Overriding moment
    moment.fn.minutesFromNow = function() {
        return Math.floor((+new Date() - (+this))/60000) + ' mins ago';
    }


    fetchNotifications();
}

$(document).ready(()=>{
    if(window.location.href.split('/')[3]!='login.html'){

        initiateListeners();
    }
});

export function getUserData(){
    return userData;
}

