$(document).ready(function() {
    $("#register_form").submit(function(e) {
        var form = $(this);
        //var url = form.attr('action');
        //alert(form.serialize());
        $.ajax({
            type: "POST",
            url: "http://140.113.207.54:7000/registering",
            data: form.serialize(), // serializes the form's elements.
        });

        e.preventDefault(); // avoid to execute the actual submit of the form.
        console.log(e);
    });
});