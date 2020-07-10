var express = require('express');
var app = express();
var bodyParser = require('body-parser'); //
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const Web3 = require('web3');
var crypto = require('crypto');
var formidable = require('formidable');
var fs = require('fs');
var cookie = require('cookie');

var system = "0xD5Aa382468C895B78eD99718AeD1686dF9337a56";

let Database = require('./lib/database.js');
users_database = new Database();
goods_database = new Database();
//var multer = require('multer');


let GetContract = require('./lib/contract_bundle');
var point_contract = GetContract('Points.json');

point_contract.balanceOf(system).then(function(tokenBalance){
	console.log("balance: " + tokenBalance[0].toString());
});

app.use(express.static('public')); //get the html, css and js
app.use(bodyParser.json()); //
app.use(bodyParser.urlencoded({ extended: false }));
init();


if (typeof web3 !== 'undefined') {
	web3 = new Web3(web3.currentProvider);
	console.log("use current provider");
} else {
	// web3 = new Web3(new Web3.providers.HttpProvider("http://140.113.207.54:7545"));
	web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
	web3.eth.getAccounts().then(data => {
		acc = data[0];
		console.log("first account: " + acc);
	});
}

async function init() {
	//console.log(Object.getOwnPropertyNames(cookie));
    users_db = await users_database.connect("mongodb://localhost:27017/", 'points', 'test');
    //users_db = await users_database.connect("mongodb://localhost:27017/", 'points', 'users');
    console.log('connect to users db.');
    goods_db = await goods_database.connect("mongodb://localhost:27017/", 'points', 'goods');
    console.log('connect to goods db.');
    app.listen(7000, function () { 
		console.log("listening on port 7000");
	});
}

function MD5(str){
	var md5 = crypto.createHash('md5');
	return md5.update(str).digest('hex');
}

app.post('/registering', function (req, res) {
	//Check if the account has been used, if not add new user, or return the current page
	var users_data = req.body;
	console.log(users_data);
	users_data.password = MD5(users_data.password);
	var err = false;
	users_db.contain({account:users_data.account}).then(function(result){
		if(result){
			console.log("This account has been used!");
			err = true;
		}
		else{
			point_contract.setIdentity(users_data.ethacc, users_data.identity, {from: system}).then(function(result){
				if (result) {
					console.log('success');
					users_data.address = users_data.ethacc;
					users_db.insert(users_data);
					res.cookie("identity", users_data.identity);
					res.cookie("username", users_data.username);
					res.cookie("address", users_data.address);
					res.cookie("account", users_data.account);

					switch (Number(users_data.identity)) {
						case 1:
							res.redirect('/userpage.html');
							break;
						case 2:
							res.redirect('/point-provider-page.html');
							break;
						case 3:
							res.redirect('/goods-provider-page.html');
							break;
						default:
							res.redirect("/index.html");
							break;
					}
				}
				else {
					console.log('fail');
				}
			}).catch(function(err){
				console.log(err);
			});

			// var start = Date.now();
			// web3.eth.personal.newAccount('', (err, result) => {
			// 	var end = Date.now();
			// 	var spend = end - start;
			// 	console.log("spend: " + spend);
			// 	if (err) throw err;
			// 	users_data.address = result;
			// 	console.log(users_data);
			// 	console.log("Register OK!");
			// 	users_db.insert(users_data);
			// 	res.cookie("identity", users_data.identity);
			// 	res.cookie("username", users_data.username);
			// 	res.cookie("address", users_data.address);
			// 	res.cookie("account", users_data.account);
			// 	if(err){
			// 		res.redirect("/register.html");
			// 	}
			// 	else{
			// 		//check the identity to redirect to the pages
			// 		var identity = req.body.identity;
			// 		if(identity == 1){
			// 			res.redirect("/userpage.html");
			// 		}
			// 		else if(identity == 2){
			// 			res.redirect("/point-provider-page.html");
			// 		}
			// 		else if(identity == 3){
			// 			res.redirect("/goods-provider-page.html");
			// 		}
			// 		else{
			// 			res.redirect("/index.html");
			// 		}
			// 	}
			// });	
		}		
	});			
});

app.post('/login', function (req, res) {
	console.log(req.body);
	//connect to database to check who it is
	var account = req.body.account;
	var password = req.body.password;
	var hashPassword = MD5(password);
	var identity = -1;
	users_db.find({account:account, password:hashPassword}).then(function(result){
		if(result != null){
			identity = result.identity;
			res.cookie("identity", identity);
			res.cookie("username", result.username);
			res.cookie("address", result.address);
			res.cookie("account", result.account);
		}
		else{
			console.log("This user doesn't exist!");
		}
		if(identity == 1){
			res.redirect("/userpage.html");
		}
		else if(identity == 2){
			res.redirect("/point-provider-page.html");
		}
		else if(identity == 3){
			res.redirect("/goods-provider-page.html");
		}
		else{
			res.redirect("/index.html");
		}
	});
});

app.post('/check', function (req, res){
	console.log(req.body);
   	console.log('req received');
   	var user = req.body.receiver;
   	var answer;
   	users_db.find({account:user}).then(function(result){
   		if(result != null){
   			answer = {isExisted : true, address : result.address};
   			answer = JSON.stringify(answer);
   		}
   		else{
   			answer = {isExisted : false};
   			answer = JSON.stringify(answer);
   		}
   	}).then(function(){
   		res.contentType('json');
  		res.send(answer);
   	});
   	
});

app.post('/increaseGoods', function(req, res){
	var form = new formidable.IncomingForm();
	form.encoding = 'utf-8';        //设置编辑
  	form.uploadDir = 'public/file/' ;     //设置上传目录
  	form.keepExtensions = true;     //保留后缀
  	form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小
	form.parse(req, function(err, fields, files) {
		var answer;
		if(err) {
			answer = {Done: false};
   			answer = JSON.stringify(answer);
		    return res.send(answer);
		}
		console.log('received fields: ');
		console.log(fields);
		var goodsInfo = fields;
		var owner = fields.owner;
		console.log('received files: ');
		console.log(files);
		//insert file to db
		//gfs? mongo?
		var extName = 'jpg';  //后缀名
        switch (files.inputfile.type) {
            case 'image/pjpeg':
                extName = 'jpg';
                break;
            case 'image/jpeg':
                extName = 'jpg';
                break;         
            case 'image/png':
                extName = 'png';
                break;
            case 'image/x-png':
                extName = 'png';
                break;         
        }
        var date = new Date();
        var fileName = owner + '_' + date.getTime() + '.' + extName;
        var newPath = form.uploadDir + fileName;

        console.log(newPath);
        fs.renameSync(files.inputfile.path, newPath);  //重命名
        goodsInfo.filename = fileName;
        console.log(goodsInfo);

        goods_db.insert(goodsInfo).then(function(){
        	answer = {Done: true};
			answer = JSON.stringify(answer);
	    	return res.send(answer);
        });
	});
});

app.post('/getImg', function(req, res){
	console.log(req.body);
	var owner = req.body.owner;
	//{owner:owner}
	goods_db.list(req.body).then(function(result){
		res.send(result);
	});
});

app.post('/deleteGoods', function(req, res){
	console.log(req.body);
	var id = req.body._id;
	var filename = req.body.filename;
	var data = {_id:ObjectID(id), filename:filename};
	
	/*goods_db.find(data).then(function(result){
		console.log(result);
		res.send(result);
	});*/
	fs.unlinkSync("public/file/"+ filename);
	goods_db.delete(data).then(function(result){
		//console.log(result);
		res.send(result);
	});
});



