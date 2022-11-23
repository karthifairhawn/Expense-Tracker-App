$('.logout').click(()=>{
    localStorage.clear();
    window.location.href= 'login.html';
})