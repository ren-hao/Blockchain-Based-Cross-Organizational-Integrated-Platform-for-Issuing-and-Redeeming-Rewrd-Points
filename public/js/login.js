$(document).ready(function() {
    console.log(document.cookie);
    var identity = document.cookie.split(';')[0];
    identity = identity.split('=')[1];
    console.log(identity);
    if(identity != undefined){
        if(identity == 1){
            //alert("This user doesn't exist!");
            location.href = "/userpage.html";
        }
        else if(identity == 2){
            location.href = "/point-provider-page.html";
        }
        else if(identity == 3){
            location.href = "/goods-provider-page.html";
        }
        else{
            location.href = "/index.html";
        }
    }

    $("#login_form").submit(function(e) {
        var form = $(this);
        //var url = form.attr('action');
        //alert(form.serialize());
        $.ajax({
            type: "POST",
            url: "http://140.113.207.54:7000/login",
            data: form.serialize(), // serializes the form's elements.
        });

        e.preventDefault(); // avoid to execute the actual submit of the form.
        console.log(e);
    });
});