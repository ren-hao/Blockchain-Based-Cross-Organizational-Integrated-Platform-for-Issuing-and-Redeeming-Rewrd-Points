/*
 * send argv[2] to test server 
 * receive the json response
 * response:
 * [
 *	start:time
 *	end:time
 *	spend:second(?)
 *	balance:number
 * ]
 */
var request = require("request");
var ip = process.argv[2];
var port = process.argv[3]; 
request.post('http://140.113.207.54:8888/evaluate', {form:{ip:ip, port:port}}, function(err,httpResponse,body){
	console.log(body);
});
