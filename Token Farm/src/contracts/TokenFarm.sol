pragma solidity ^0.5.0;

import "./DaiToken.sol";
import "./WalterWhiteToken.sol";

contract TokenFarm {
    string public name = "Dapp Token Farm";
    WalterWhiteToken public walterWhiteToken; // state variable
    DaiToken public daiToken; // state variable
    address public owner;

    address[] public stakers;

    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor (WalterWhiteToken _walterWhiteToken, DaiToken _daiToken) public {
        walterWhiteToken = _walterWhiteToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    // Stake Tokens
    function stakeToken(uint _amount) public {
        require(_amount > 0, "Amount cannot be 0");

        // Transfer Mock Dais to this contract for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);

        // Update Staking Balance
        stakingBalance[msg.sender] += _amount;

        if(!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    // Unstake Tokens
    function unstakeToken() public {
        uint balance = stakingBalance[msg.sender]; 
        require(balance > 0, "Staking balance can't be 0");
        daiToken.transfer(msg.sender, balance);
        stakingBalance[msg.sender] = 0;
        isStaking[msg.sender] = false;
    }

    // Issuing Tokens
    function issueToken() public {
        require(msg.sender == owner, "Only owner can call this function");

        for(uint i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if(balance > 0) {
                walterWhiteToken.transfer(recipient, balance);
            }
        }
    }
}
 