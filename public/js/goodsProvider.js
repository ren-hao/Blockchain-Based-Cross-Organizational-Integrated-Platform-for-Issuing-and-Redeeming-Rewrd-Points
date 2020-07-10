$(document).ready(function() {
    // var eth = new Eth(new Eth.HttpProvider('http://127.0.0.1:7545'));
    if (typeof web3 !== 'undefined' && window.ethereum) {
        const ethereum = window.ethereum;
        ethereum.enable();
        var eth = new Eth(ethereum);
    }
    else {
        console.log('please install metamask');
        var eth = new Eth(new Eth.HttpProvider('http://127.0.0.1:7545'));
    }

    var abi;
    var instance;
    var identity;
    var username;
    var address;
    var account;
    var pointsContract;
    const system = '0xd5aa382468c895b78ed99718aed1686df9337a56';
    account = document.cookie.split(';')[3];
    account = account.split('=')[1];
    console.log(account);
    $.getJSON('Points.json', function(data) {
        abi = data.abi;
        console.log(document.cookie);
        identity = document.cookie.split(';')[0];
        identity = identity.split('=')[1];
        console.log(identity);
        username = document.cookie.split(';')[1];
        username = username.split('=')[1];
        console.log(username);
        var greet = 'Hi, ' + username;
        $("#greet").html(greet);
        address = document.cookie.split(';')[2];
        address = address.split('=')[1];
        console.log(address);
        
        pointsContract = eth.contract(abi).at('0xC31EAEFF1192fc86522CC0bcEF1E13364Af0054d');
        pointsContract.balanceOf(address).then(function(tokenBalance){
            $("#pointNum").html(tokenBalance[0].toString());
        });
    });
    $.ajax({
        type: 'POST',
        url: '/getImg',
        data: {owner:account},
        dataType: 'json',
        success: function(data){
            var goodsRow = $('#goodsRow');
            var goodsTemplate = $('#goodsTemplate');
            for(var i = 0; i < data.length; i++){
                goodsTemplate.find('img').attr('src', "file/" + data[i].filename);
                goodsTemplate.find('.name').text(data[i].name);
                goodsTemplate.find('.price').text(data[i].price);
                //goodsTemplate.find('.btn-update').attr('data-id', data[i]._id);
                goodsTemplate.find('.btn-delete').attr('goodsId', data[i]._id);
                goodsTemplate.find('.btn-delete').attr('goodsName', data[i].filename);
                //console.log(data[i]._id.toString(10));
                goodsRow.append(goodsTemplate.html());
            }  
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log('error');
        }
    });
    //$("#goodsImg").attr("src", "file/gper_1560764344491.jpg");
    $("#logout").click(function(e){
    	console.log(document.cookie);
	    document.cookie = "identity=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    	document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    	document.cookie = "address=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "account=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    	location.href = "/index.html";
	});
    $("#sellConfirm").click(function(e){
     	var receiver = $("#receiver").val();
    	var amount = $("#sellAmount").val();
    	if(isNaN(amount)){
            alert("Please enter a number!");
            $("#receiver").val('');
            $("#sellAmount").val('');
            $('#sellConfirm').removeAttr('data-dismiss');
        }
        else{
            amount = Number(amount);
            //takeover
            if(receiver == "system"){
                //console.log(receiver);
                pointsContract.takeover(address, amount, {from: address}).then(function(txHash){
                    $('#sellConfirm').attr('data-dismiss', 'modal');
                    pointsContract.balanceOf(address).then(function(tokenBalance){
                        $("#pointNum").html(tokenBalance[0].toString(10));
                        $("#receiver").val('');
                        $("#sellAmount").val('');
                        //$('#issue_confirm').attr('data-dismiss', 'modal');
                    });
                });
            }
            else{
                //transfer
                var user;
                $.ajax({
                    type: 'POST',
                    url: '/check',
                    data: {receiver:receiver},
                    dataType: 'json',
                    success: function(data){
                        //console.log(data);
                        user = data;
                        //$('#issue_confirm').attr('data-dismiss', 'modal');
                    },
                    error: function(jqXHR, textStatus, errorThrown){
                        console.log('error');
                    }
                }).done(function(){
                    console.log(user.isExisted);
                    if(user.isExisted){
                        //issue
                        pointsContract.transfer(address, user.address, amount, {from: address}).then(function(txHash){
                            $('#sellConfirm').attr('data-dismiss', 'modal');
                            pointsContract.balanceOf(address).then(function(tokenBalance){
                                $("#pointNum").html(tokenBalance[0].toString(10));
                                $("#receiver").val('');
                                $("#sellAmount").val('');
                                //$('#issue_confirm').attr('data-dismiss', 'modal');
                            });
                        });
                    }
                    else{
                        alert("This user doesn't exist!");
                        $("#receiver").val('');
                        $("#issueAmount").val('');
                        $('#sellConfirm').removeAttr('data-dismiss'); 
                    }
                });
            }       
        }
    	//$('#sellConfirm').attr('data-dismiss', 'modal');
	});
    $("#goods_form").submit(function(e) {
        var price = $('#inputprice').val();
        if(isNaN(price)){
            alert("Please enter a number!");
            $('#inputprice').val('');
            $('#goods_form').removeAttr('data-dismiss');
        }
        else{
            $('#goods_form').attr('data-dismiss', 'modal');
            let myForm = document.getElementById('goods_form');
            let formData = new FormData();
            var pic = $('#inputfile')[0].files[0];
            formData.append('inputfile', pic);
            formData.append('name', $('#inputname').val());
            formData.append('price', $('#inputprice').val());
            formData.append('owner', account);
            formData.append('ownerAddress', address);
            $.ajax({
                url:"/increaseGoods",
                type:"POST",
                data:formData,
                processData:false,
                contentType:false,
                success:function(res){
                    if(res){
                        console.log('Success!');
                    }
                    console.log(res);
                    $('#goods_form').attr('data-dismiss', 'modal');
                    $('#inputprice').val('');
                    $('#inputname').val('');
                    alert("Success!");
                    location.reload();
                },
                error:function(err){
                    alert("Please try again");
                    console.log('Error: ' + err);
                }
            });
        }
        return false;
    });
    
	/*$(".btn-delete").click(function(e){
     	//mongodb delete 
        event.preventDefault();

        console.log($(event.target).attr("goodsId"));
	});*/
    function deleteGoods(){
        event.preventDefault();
        var id = $(event.target).attr("goodsId");
        var name = $(event.target).attr("goodsName");
        console.log(id);
        $.ajax({
            type: 'POST',
            url: '/deleteGoods',
            data: {_id:id, filename:name},
            dataType: 'json',
            success: function(data){ 
                console.log(data);
                $('#goodsRow').empty();
                location.reload();
            },
            error: function(jqXHR, textStatus, errorThrown){
                alert("Please try again");
                console.log('Error: ' + errorThrown);
            }
        });
    }
    $(document).on('click', '.btn-delete', deleteGoods);
    $("#updateConfirm").click(function(e){
        //mongodb update 
    });
    $("#inputfile").change(function(event){
        var input = event.target;
        var reader = new FileReader();
        reader.onload = function(){
            var dataURL = reader.result;
            var output = document.getElementById('output');
            output.src = dataURL;
        };
        reader.readAsDataURL(input.files[0]);
    });
});