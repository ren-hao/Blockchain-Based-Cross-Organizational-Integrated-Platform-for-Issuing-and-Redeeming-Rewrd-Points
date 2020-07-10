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
    var pointsContract;
    const system = '0xD5Aa382468C895B78eD99718AeD1686dF9337a56';
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
        //console.log(greet);
        $("#greet").html(greet);
        address = document.cookie.split(';')[2];
        address = address.split('=')[1];
        console.log("full: "+document.cookie)
        console.log(address);
        pointsContract = eth.contract(abi).at('0xC31EAEFF1192fc86522CC0bcEF1E13364Af0054d');
        var start = Date.now();
        var end;
        pointsContract.balanceOf(address).then(function(tokenBalance){
            end = Date.now();
            console.log("spend:");
            console.log(end-start);
            $("#pointNum").html(tokenBalance[0].toString());
        });
    });   
    $("#logout").click(function(e){
    	console.log(document.cookie);
	    document.cookie = "identity=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    	document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    	document.cookie = "address=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    	document.cookie = "account=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        location.href = "/index.html";
	});
	$("#gain_confirm").click(function(e){
    	var amount = $("#gainAmount").val();
    	//console.log(amount);
        if(isNaN(amount)){
            alert("Please enter a number!");
            $("#gainAmount").val('');
            $('#gain_confirm').removeAttr('data-dismiss');
        } 
        else{
            amount = Number(amount);
            //console.log(amount);
            //mint
            pointsContract.mint(amount, {from: address})
            .then(function(txHash){
                //deliver
                console.log("amount: " + amount);
                console.log("address: " + address);
                console.log("result: " + txHash);
                var start = Date.now();
                var end;
                pointsContract.deliver(address, amount, {from: address}).then(function(txHash){
                    end = Date.now();
                    console.log("spend:");
                    console.log(end-start);
                    pointsContract.balanceOf(address).then(function(tokenBalance){
                        $("#pointNum").html(tokenBalance[0].toString());
                    });
                });
            })
            .catch(function(mintError){
                console.log(mintError);
            });
            
            $("#gainAmount").val('');
            $('#gain_confirm').attr('data-dismiss', 'modal');
        }
    		
	});
    $("#issue_confirm").click(function(e){
    	var receiver = $("#receiver").val();
    	var amount = $("#issueAmount").val();
        if(isNaN(amount)){
            alert("Please enter a number!");
            $("#receiver").val('');
            $("#issueAmount").val('');
            $('#issue_confirm').removeAttr('data-dismiss');
        } 
        else{
            amount = Number(amount);
            //$('#issue_confirm').attr('data-dismiss', 'modal');
            var user;
            $.ajax({
                type: 'POST',
                url: '/check',
                data: {receiver:receiver},
                dataType: 'json',
                success: function(data){
                    console.log(data);
                    user = data;
                    //$('#issue_confirm').attr('data-dismiss', 'modal');
                },
                error: function(jqXHR, textStatus, errorThrown){
                    console.log('error');
                }
            }).done(function() {
                console.log(user.isExisted);
                if(user.isExisted){
                    //issue
                    pointsContract.issue(address, user.address, amount, {from: address}).then(function(txHash){
                        $('#issue_confirm').attr('data-dismiss', 'modal');
                        pointsContract.balanceOf(address).then(function(tokenBalance){
                            $("#pointNum").html(tokenBalance[0].toString());
                            $("#receiver").val('');
                            $("#issueAmount").val('');
                            // $('#issue_confirm').attr('data-dismiss', 'modal');
                        });
                    });
                }
                else{
                    alert("This user doesn't exist!");
                    $("#receiver").val('');
                    $("#issueAmount").val('');
                    $('#issue_confirm').removeAttr('data-dismiss'); 
                }
            });
        }	
	});
});