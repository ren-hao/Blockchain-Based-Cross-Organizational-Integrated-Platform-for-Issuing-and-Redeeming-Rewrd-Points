var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const Web3 = require('web3');
var fs = require('fs');
var spending_time = [];
app.use(bodyParser.json()); //
app.use(bodyParser.urlencoded({ extended: false }));
app.listen(8888, function () { 
	console.log("listening on port 8888");
});

app.post('/evaluate', function (req, res){
	//console.log(req.body);
   	//console.log('req received');
   	var ip = req.body.ip;
   	var port = req.body.port;
   	var answer;
   	var start = Date.now();
   	var end;
   	var spend;
   	var balance;
   	var address = "http://140.113.207." + ip + ":" + port;
   	var web3 = new Web3(new Web3.providers.HttpProvider(address));
   	let rawdata = fs.readFileSync('./Points.json');  
	let abi = JSON.parse(rawdata);
	abi = abi.abi; 
	var myContract = new web3.eth.Contract(abi,'0x70168Be6bF1D2f467c7C54769c6872dafD36c20E');
	var system = '0x9a8c7a13f26136c0714290f37edb53b6cd9bb7d0';
	var account = "0xd17645933f73f3c5fb5ec81537e1105a9a91d9c0";
	var receiver = "0x45ff013a8a517bc5b6a504e192b6af52368f615d";
	myContract.methods.balanceOf(receiver).call({from: system},function(error, result){
		end = Date.now();
		spend = end - start;
  		console.log(result);
  		answer = {start : start, end:end, spend:spend, balance:result.toString()};
  		spending_time.push(spend);
  		//console.log(spending_time);
		answer = JSON.stringify(answer);
		res.contentType('json');
		res.send(answer);

    });
});

app.post('/evaluate_send', function (req, res){
	//console.log(req.body);
   	//console.log('req received');
   	var ip = req.body.ip;
   	var port = req.body.port;
   	var answer;
   	var start = Date.now();
   	var end;
   	var spend;
   	//var balance;
   	var address = "http://140.113.207." + ip + ":" + port;
   	var web3 = new Web3(new Web3.providers.HttpProvider(address));
   	let rawdata = fs.readFileSync('./Points.json');  
	let abi = JSON.parse(rawdata);
	abi = abi.abi; 
	var myContract = new web3.eth.Contract(abi,'0x70168Be6bF1D2f467c7C54769c6872dafD36c20E');
	var system = '0x9a8c7a13f26136c0714290f37edb53b6cd9bb7d0';
	var account = "0xd17645933f73f3c5fb5ec81537e1105a9a91d9c0";
	var receiver = "0x45ff013a8a517bc5b6a504e192b6af52368f615d";
	myContract.methods.issue(account, receiver, 1).send({from: system},function(error, result){
		end = Date.now();
		spend = end - start;
		spending_time.push(spend);
  		console.log(result);
  		answer = {start : start, end:end, spend:spend, result:result};
		answer = JSON.stringify(answer);
		res.contentType('json');
		res.send(answer);
    });

});

app.post('/spending_time', function (req, res){
	var answer;
	var max, min;
	max = Math.max(...spending_time);
	min = Math.min(...spending_time);
	var sum = 0;
	for( var i = 0; i < spending_time.length; i++ ){
	    sum += spending_time[i]; //don't forget to add the base
	}

	var avg = sum/spending_time.length;
	answer = {max : max, min:min, avg:avg};
	answer = JSON.stringify(answer);
	res.contentType('json');
	res.send(answer);
})