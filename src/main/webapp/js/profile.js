import * as userService from '../apis/users.js'
import * as util from './util.js'

$('.nav-item[tabs=profile]').addClass('active')

$(window).load(()=>{
    pupulateUserData();
    activateListers();
})


async function pupulateUserData(){
    let userData = null;
    await userService.findUserById(localStorage.getItem('userId')).then((val)=>{
        userData  = val.data;
    });

    let userDateForm = $('form[name="profile-form"]');

    console.log(userData)
    $(userDateForm).find('#userName').val(userData.name);
    $(userDateForm).find('#userEmail').val(userData.email);
    $(userDateForm).find('#userPhone').val(userData.phoneNumber);
}

function activateListers(){
    $('#profile-update-btn').hide();

    $('form[name="profile-form"] input').change(()=>{
        $('#profile-update-btn').click();
    })

    $('#profile-update-btn').click((event)=>{
        event.preventDefault();
        util.handleApiResponse({},"Profile Updated","Edit Failed try Again..");
    })
}