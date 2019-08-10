var request = require("request");
//var output = process.argv[3];
request.post('http://140.113.207.54:8888/spending_time', function(err,httpResponse,body){
	console.log(body);
});