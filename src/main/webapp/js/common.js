import {findWallets} from '../apis/wallets.js';
import * as util from './util.js';
import * as notificationService from '../apis/notifications.js'

// Logout user on clicking logout button on navbar
$('.logout').click(()=>{
    localStorage.clear();
    window.location.href= 'login.html';
})

// Redirect to login if no authToken
let authToken = localStorage.getItem('authToken');
if(authToken == null || authToken.length == 0 || typeof authToken === undefined){
    window.location.href = 'login.html';
} 

var totalNonReadNotifications = 0;
var totalNotifications = 0;
export function fetchNotifications(){

    $('.nav-notification').off()
    $('.nav-notification').click(()=>{
        $('#notifications').toggle();
    });

    $('#clear-not').click(()=>{
        notificationService.deleteAll().then((data)=>{
            if(data.statusCode!=200) return;
            $("#notificaitons-container").html("");
            $("#notificaitons-container").append($("<h2 class='mt-3'><center>No Notifications</center></h2>"))
        })
    })

    notificationService.findAll().then((data)=>{

        populateNotifications(data.data,"notificaitons-container");
        $('.notifications-body').click((e)=>{
            let notificationId = $(e.target).closest('.notifications-body').find('.not-del-btn').attr('notification-id');
            $(e.target).closest('.notifications-body').find('.unread-not-ico').remove();
            $(e.target).closest('.notifications-body').removeClass('unread-not');
            let raw = {
                readed: true
            }
            notificationService.updateById(notificationId,JSON.stringify(raw)).then((data)=>{
                totalNonReadNotifications--;

                notificationIndicator(totalNonReadNotifications);
            })
        });

        $('.not-del-btn').click((e)=>{
            let notificationId = $(e.target).closest('.not-del-btn').attr('notification-id');
            notificationService.deleteById(notificationId).then(()=>{
                $(e.target).closest('.notifications-body').remove();
            })
            totalNotifications--;
            zeroNotificationsHandler(totalNotifications);
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
            let notificationElement = document.getElementById("tt-notification").content.cloneNode(true);

            $(notificationElement).find('.not-title').text(notifications[i].title);
            $(notificationElement).find('.not-body').text(notifications[i].info);
            $(notificationElement).find('.not-ico').html(notificationIcons[notifications[i].type]);
            $(notificationElement).find('.not-del-btn').attr('notification-id',notifications[i].id);

            if(notifications[i].readed==0){
                totalNonReadNotifications++;
                $(notificationElement).find('.not-title').prepend('<i class="fa-solid fa-circle-info unread-not-ico"></i> ')
                $(notificationElement).find('.notifications-body').addClass('unread-not');
            }
            container.appendChild(notificationElement);

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


$(document).ready(()=>{
    fetchNotifications();
});



