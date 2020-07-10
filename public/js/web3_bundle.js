if (typeof web3 !== 'undefined' && window.ethereum) {
    const ethereum = window.ethereum;
    ethereum.enable();
    var eth = new Eth(ethereum);
}
else {
    console.log('please install metamask');
    var eth = new Eth(new Eth.HttpProvider('http://127.0.0.1:7545'));
}