import { server,orgin } from '../config/apiConfig.js';
import * as util from './util.js'


$("#signup").click(function() {
    $("#first").fadeOut("fast", function() {
        $("#second").fadeIn("fast");
    });
});

$("#signin").click(function() {
    $("#second").fadeOut("fast", function() {
        $("#first").fadeIn("fast");
    });
});

// Login handling
$( function() {
    $("form[name='login']").validate({
        rules: {
        
        email: {
            required: true,
            email: true
        },
        password: {
            required: true,
            
        }
        },
        messages: {
        email: "Please enter a valid email address",
        
        password: { required: "Please enter password" }
        
        }

    });

    $("form[name='login']").submit(async (e)=>{
        e.preventDefault();
        let raw = ({
            "email" : $('#log-email').val(),
            "password" : $('#log-password').val()
        });
        raw = JSON.stringify(raw);
        var myHeaders = new Headers();
        myHeaders.append("Access-Control-Allow-Origin", orgin);
        // myHeaders.append("")

        var postRequestOptions = {method: 'POST',body: raw,headers: myHeaders,redirect: 'follow'};

        $('#spinner').show();
        fetch(server+"/api/v1/login", postRequestOptions).then((data)=> data.json()).then((data)=>{
            processLogin(data);
        }).catch((error)=>{
            util.handleApiResponse({data:400},"","Failed in server communication, Try again later.")
        })

        function processLogin(data){
            if(data.statusCode==400) util.handleApiResponse(data,"Invalid information.","Invalid information.");
            else if(data.statusCode == 404) util.handleApiResponse(data,"Invalid information.","Invalid email or password.");
            else if(data.statusCode==200){
                localStorage.setItem('authToken',data.data.authToken);
                localStorage.setItem('userId',data.data.userId);
                window.location.href = "index.html"
            }

            // To be removed - timeout
            setTimeout(() => {                
                $('#spinner').hide();
            }, 1200);
        }
  
        

    })


});


// New account registration
$(function() {

    let res = $("form[name='registration']").validate({
        rules: {
            firstname: "required",
            lastname: "required",
            email: {
                required: true,
                email: true
            },
            password: {
                required: true,
                minlength: 5
            },
            phonenumber:{
                required: true,
                minlength: 10
            }
        },
        
        messages: {
            firstname: "Please enter your firstname",
            lastname: "Please enter your lastname",
            password: {
                required: "Please provide a password",
                minlength: "Your password must be at least 5 characters long"
            },
            email: "Please enter a valid email address",
            phonenumber: {
                required: "Please enter your phone number",
                minlength: "Your phone number must be length 10."
            }
        },
        submitHandler: function(form) {
            submitForm();
        }
    });
    

    function submitForm(form){

        let raw = ({
            "email" : $('#new-email').val(),
            "password" : $('#new-password').val(),
            "name": $('#new-name').val(),
            "phoneNumber": $('#new-phone').val()
        });

        raw = JSON.stringify(raw);
        var myHeaders = new Headers();
        myHeaders.append("Access-Control-Allow-Origin", orgin);

        var postRequestOptions = {method: 'POST',body: raw,headers: myHeaders,redirect: 'follow'};
        $('#spinner').show();
        fetch(server+"/api/v1/users", postRequestOptions).then((data)=> data.json()).then((data)=>{
            processLogin(data);
        }).catch((error)=>{
            util.handleApiResponse({data:400},"","Failed in server communication, Try again later.")
        })

        function processLogin(data){
            if(data.statusCode==400) util.handleApiResponse(data,"Invalid information.","Invalid information.");
            else if(data.statusCode == 404) util.handleApiResponse(data,"Invalid information.","Invalid Credentials.");
            else if(data.statusCode==200){
                localStorage.setItem('authToken',data.data.authToken);
                localStorage.setItem('userId',data.data.userId);
                window.location.href = "index.html"       
            }
            $('#spinner').hide();                         
        }

    }

});
