// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract Payments {
    struct Payment {
        uint256 amount;
        uint256 timestamp;
        address from;
        string message;
    }

    struct Balance {
        uint256 totalPayments;
        mapping(uint256 => Payment) payments;
    }

    address owner;

    mapping(address => Balance) public balances;

    constructor(){
      owner = msg.sender;
    }

    modifier onlyOwner(address _to) {
      require(msg.sender == owner, "You are not an owner!");
      require(_to != address(0), "Incorrect address!");
      _;
    }

    event Paid(address indexed _from, uint _amount, uint _timestamp);

    receive() external payable {
      emit Paid(msg.sender, msg.value, block.timestamp);
    }

    function getPayment(address _addr, uint _index) public view returns(Payment memory) {
        return balances[_addr].payments[_index];
    }

    function currentBalance() public view returns(uint) {
        return address(this).balance;
    }

    function pay(string memory message) public payable {
        uint paymentNum = balances[msg.sender].totalPayments;
        balances[msg.sender].totalPayments++;

        Payment memory newPayment = Payment(
            msg.value,
            block.timestamp,
            msg.sender,
            message
        );

        balances[msg.sender].payments[paymentNum] = newPayment;
    } 

    function withdraw (address payable _to) external onlyOwner(_to) {
      _to.transfer(address(this).balance);
    }
}