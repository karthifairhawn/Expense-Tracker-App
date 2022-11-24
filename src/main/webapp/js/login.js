import { server,orgin } from '../config/apiConfig.js';




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
        fetch(server+"/api/v1/login", postRequestOptions).then((data)=> data.json()).then((data)=>{
            processLogin(data);
        })

        function processLogin(data){
            console.log(data);
            if(data.statusCode==400) alert("Invalid Request")
            else if(data.statusCode == 404) alert("Invalid Credentials")
            else if(data.statusCode==200){
                localStorage.setItem('authToken',data.data.authToken);
                localStorage.setItem('userId',data.data.userId);
                localStorage.setItem('location','dashboard');

                console.log(localStorage);
                window.location.href = "Expense_Manager/index.html"
            }
        }
  
        

    })


});



$(function() {

    $("form[name='registration']").validate({
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
        }
        },
        
        messages: {
        firstname: "Please enter your firstname",
        lastname: "Please enter your lastname",
        password: {
            required: "Please provide a password",
            minlength: "Your password must be at least 5 characters long"
        },
        email: "Please enter a valid email address"
        }
    });

    $("form[name='registration']").submit(async (e)=>{
        e.preventDefault();
        let raw = ({
            "email" : $('#new-email').val(),
            "password" : $('#new-password').val(),
            "name": $('#new-name').val(),
            "phoneNumber": $('#new-phone').val()
        });
        raw = JSON.stringify(raw);
        var myHeaders = new Headers();
        myHeaders.append("Access-Control-Allow-Origin", orgin);
        // myHeaders.append("")

        var postRequestOptions = {method: 'POST',body: raw,headers: myHeaders,redirect: 'follow'};
        fetch(server+"/api/v1/users", postRequestOptions).then((data)=> data.json()).then((data)=>{
            processLogin(data);
        })

        function processLogin(data){
            console.log(data);
            if(data.statusCode==400) alert(data.data);
            else if(data.statusCode == 404) alert("Invalid Credentials")
            else if(data.statusCode==200){
                console.log(data);
                localStorage.setItem('authToken',data.data.authToken);
                localStorage.setItem('userId',data.data.userId);
                localStorage.setItem('location','dashboard');

                console.log(localStorage);
                window.location.href = "/Expense_Manager/index.html"                
            }
        }
  
        

    })

});
