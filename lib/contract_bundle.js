var fs = require('fs');
var Eth = require('ethjs');

if (typeof web3 !== 'undefined' && window.ethereum) {
    const ethereum = window.ethereum;
    ethereum.enable();
    var eth = new Eth(ethereum);
}
else {
    console.log('please install metamask');
    var eth = new Eth(new Eth.HttpProvider('http://127.0.0.1:7545'));
}

function GetContract(name) {

    let rawdata = fs.readFileSync(name);
    let data = JSON.parse(rawdata);
    abi = data.abi;
    pointsContract = eth.contract(abi).at('0xC31EAEFF1192fc86522CC0bcEF1E13364Af0054d');
    return pointsContract;
}

module.exports = GetContract;