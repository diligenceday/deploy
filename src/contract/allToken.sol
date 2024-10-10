// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AllToken {

    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    uint256 public maxSupply;
    address public owner;

    bool private _paused;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Paused(address account);
    event Unpaused(address account);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    modifier whenNotPaused() {
        require(!_paused, "Token transfer while paused");
        _;
    }

    constructor(string memory _name, string memory _symbol, uint256 initialSupply, uint256 _maxSupply) {
        name = _name;
        symbol = _symbol;
        decimals = 18;
        maxSupply = _maxSupply;
        owner = msg.sender;
        _mint(msg.sender, initialSupply);
    }

    // 查看余额
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    // 查看授权额度
    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }

    // 转账代币
    function transfer(address to, uint256 amount) public whenNotPaused returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    // 授权转账
    function approve(address spender, uint256 amount) public returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    // 从其他账户转账
    function transferFrom(address from, address to, uint256 amount) public whenNotPaused returns (bool) {
        require(_allowances[from][msg.sender] >= amount, "Transfer amount exceeds allowance");
        _approve(from, msg.sender, _allowances[from][msg.sender] - amount);
        _transfer(from, to, amount);
        return true;
    }

    // 铸造代币（仅限拥有者）
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply + amount <= maxSupply, "Total supply exceeds max supply");
        _mint(to, amount);
    }

    // 销毁代币
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    // 从特定账户销毁代币（仅限拥有者）
    function burnFrom(address account, uint256 amount) public onlyOwner {
        require(_allowances[account][msg.sender] >= amount, "Burn amount exceeds allowance");
        _approve(account, msg.sender, _allowances[account][msg.sender] - amount);
        _burn(account, amount);
    }

    // 暂停合约
    function pause() public onlyOwner {
        _paused = true;
        emit Paused(msg.sender);
    }

    // 取消暂停
    function unpause() public onlyOwner {
        _paused = false;
        emit Unpaused(msg.sender);
    }

    // 内部转账函数
    function _transfer(address from, address to, uint256 amount) internal whenNotPaused {
        require(from != address(0), "Transfer from the zero address");
        require(to != address(0), "Transfer to the zero address");
        require(_balances[from] >= amount, "Transfer amount exceeds balance");

        _balances[from] -= amount;
        _balances[to] += amount;
        emit Transfer(from, to, amount);
    }

    // 内部铸造函数
    function _mint(address to, uint256 amount) internal {
        require(to != address(0
