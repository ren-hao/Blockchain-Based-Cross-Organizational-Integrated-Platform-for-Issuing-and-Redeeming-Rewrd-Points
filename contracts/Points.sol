pragma solidity >=0.4.22 <0.7.0;

import "./SafeMath.sol";

contract Points {
    using SafeMath for uint256;
    
    address private owner; // the owner of the contract, system account
    string public name = "Reward Point"; 
    string public symbol = "RP"; 
    uint8 public decimals = 18;
    mapping (address => uint256) private _quota; // the quota of every company
    mapping (address => uint256) private _balances; 
    //mapping (address => uint256) private _identity; // the identity of the account, 1 for users, 2 for point company and 3 for goods company
    mapping (address => uint256) private _transactions; // the number of transactions a company do
    uint256 private _totalSupply;
    
    
    constructor() public {
        owner = msg.sender;
        _balances[owner] = 0; //balance of the system account 
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Permission denied.");
        _;
    }
    
    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function quotaOf(address who) external view returns (uint256) {
        return _quota[who];
    }
    
    function balanceOf(address who) public view returns (uint256) {
        return _balances[who];
    }
    
    /*function identityOf(address who) external view returns (uint256) {
        return _identity[who];
    }*/
    
    function numberOf(address who) external view returns (uint256) {
        return _transactions[who];
    }
    
    // New user register to the system
    /*function register(address who, uint256 identity) external onlyOwner returns (bool){
        require(who != address(0));
        _balances[who] = 0;
        _quota[who] = 0;
        _identity[who] = identity;
        _transactions[who] = 0;
        return true;
    }*/
    
    // when there is a company give real money to the system
    // system account will mint new points
    function mint(uint256 value) external onlyOwner returns (bool){
        require(value > 0);
        _balances[owner] = _balances[owner].add(value);
        _totalSupply = _totalSupply.add(value);
        emit Mint(value);
        return true;
    }
    
    // system -> company
    function deliver(address to, uint256 value) external onlyOwner returns (bool){
        //require(_identity[to] == 2);
        require(value > 0);
        _transfer(owner, to, value);
        _quota[to] = _quota[to].add(value);
        emit Deliver(to, value);
        return true;
    }
    
    // point provider -> user
    function issue(address from, address to, uint256 value) external onlyOwner returns (bool){
        //require(_identity[from] == 2 && _identity[to] == 1);
        require(value > 0);
        _transfer(from, to, value);
        _transactions[from] = _transactions[from] + 1;
        emit Issue(from, to, value);
        return true;
    }
    
    // goods provider -> point provider
    function transfer(address from, address to, uint256 value) external onlyOwner returns (bool){
        //require(_identity[from] == 3 && _identity[to] == 2);
        require(value > 0);
        _transfer(from, to, value);
        emit Transfer(from, to, value);
        return true;
    }
    
    // user --points--> goods provider
    function redeem(address from, address to, uint256 value) external onlyOwner returns (bool){
        //require(_identity[from] == 1 && _identity[to] == 3);
        require(value > 0);
        _transfer(from, to, value);
        emit Redeem(from, to, value);
        return true;
    }
    
    // company -> system
    function takeover(address from, uint256 value) external onlyOwner returns (bool){
        //require(_identity[from] == 3);
        require(value > 0);
        _transfer(from, owner, value);
        emit Takeover(from, value);
        return true;
    }
    
    // system set the quota of the company
    /*
    function setQuota(address who, uint256 value) external onlyOwner returns (bool){
        if(value > _quota[who]){
            uint256 temp = value - _quota[who];
            _balances[who] = _balances[who].add(temp);
            _totalSupply = _totalSupply.add(temp);
        }
        else{
            if(_balances[who] > value){
                uint256 temp = _balances[who] - value;
                _totalSupply = _totalSupply.sub(temp);
                _balances[who] = value;
            }
        }
        _quota[who] = value;
        return true;
    }*/
    
    function _transfer(address from, address to, uint256 value) internal {
        require(to != address(0));
        _balances[from] = _balances[from].sub(value);
        if(_quota[to] == 0) _balances[to] = _balances[to].add(value);
        else{
            uint256 temp = _balances[to].add(value);
            if(temp > _quota[to]){
                uint256 temp1 = temp - _quota[to];
                _totalSupply = _totalSupply.sub(temp1);
                _balances[to] = _quota[to];
            }
            else{
                _balances[to] = _balances[to].add(value);
            }
        }        
    }
    
    //mint: system +
    event Mint(uint256 value);
    //deliver: system -> company
    event Deliver(address indexed to, uint256 value);
    //takeover: company -> system
    event Takeover(address indexed from, uint256 value);
    //redeem: user -> goods provider
    event Redeem(address indexed from, address indexed to, uint256 value);
    //issue: point provider -> user
    event Issue(address indexed from, address indexed to, uint256 value);
    //transfer: company -> company
    event Transfer(address indexed from, address indexed to, uint256 value);
}