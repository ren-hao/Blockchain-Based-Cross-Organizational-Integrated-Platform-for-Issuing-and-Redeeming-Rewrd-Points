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
        console.log(address);
        pointsContract = eth.contract(abi).at('0xC31EAEFF1192fc86522CC0bcEF1E13364Af0054d');
        pointsContract.balanceOf(address).then(function(tokenBalance){
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
	$.ajax({
        type: 'POST',
        url: '/getImg',
        data: {},
        dataType: 'json',
        success: function(data){
            var goodsRow = $('#goodsRow');
            var goodsTemplate = $('#goodsTemplate');
            for(var i = 0; i < data.length; i++){
                goodsTemplate.find('img').attr('src', "file/" + data[i].filename);
                goodsTemplate.find('.name').text(data[i].name);
                goodsTemplate.find('.price').text(data[i].price);
                //goodsTemplate.find('.companyName').text(data[i].owner);
                goodsTemplate.find('.btn-redeem').attr('goodsPrice', data[i].price);
                goodsTemplate.find('.btn-redeem').attr('goodsOwnerAddress', data[i].ownerAddress);
                //console.log(data[i]._id.toString(10));
                goodsRow.append(goodsTemplate.html());
            }  
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log('error');
        }
    });
    function redeemGoods(){
        event.preventDefault();
        var price = $(event.target).attr("goodsPrice");
        price = Number(price);
        var OwnerAddress = $(event.target).attr("goodsOwnerAddress");
        console.log(price);
        console.log(OwnerAddress);
        pointsContract.redeem(address, OwnerAddress, price, {from: address}).then(function(txHash){
        	pointsContract.balanceOf(address).then(function(tokenBalance){
	            $("#pointNum").html(tokenBalance[0].toString());
	        });
        })
	        
    }
    $(document).on('click', '.btn-redeem', redeemGoods);
});
