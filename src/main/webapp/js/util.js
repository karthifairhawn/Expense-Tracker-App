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
