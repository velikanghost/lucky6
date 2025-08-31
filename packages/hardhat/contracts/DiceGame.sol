pragma solidity >=0.8.0 <0.9.0; //Do not change the solidity version as it negatively impacts submission grading
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";

contract DiceGame {
    uint256 public nonce = 0;
    uint256 public prize = 0;

    // New state variables for hackathon features
    mapping(address => uint256) public currentStreak;
    mapping(address => uint256) public cardsOwned;
    mapping(address => uint256) public prizesOwned;

    // Constants
    uint256 public constant STREAK_REQUIRED_FOR_CARD = 1; //to be updated
    uint256 public constant CARDS_REQUIRED_FOR_PRIZE = 5;

    error NotEnoughEther();
    error NotEnoughCards();

    event Roll(address indexed player, uint256 amount, uint256 roll);
    event Winner(address winner, uint256 amount);
    event CardAwarded(address indexed player, uint256 streak);
    event PrizeRedeemed(address indexed player, uint256 cardsSpent);

    constructor() payable {
        resetPrize();
    }

    function resetPrize() private {
        prize = ((address(this).balance * 10) / 100);
    }

    function rollTheDice() public payable {
        if (msg.value < 0.002 ether) {
            revert NotEnoughEther();
        }

        bytes32 prevHash = blockhash(block.number - 1);
        bytes32 hash = keccak256(abi.encodePacked(prevHash, address(this), nonce));
        uint256 roll = uint256(hash) % 16;

        console.log("\t", "   Dice Game Roll:", roll);

        nonce++;
        prize += ((msg.value * 40) / 100);

        emit Roll(msg.sender, msg.value, roll);

        // Check if roll is a win (roll > 6 for hackathon)
        bool isWin = roll > 6;

        if (isWin) {
            // Increment streak
            currentStreak[msg.sender]++;

            // Check if streak reaches card requirement
            if (currentStreak[msg.sender] >= STREAK_REQUIRED_FOR_CARD) {
                cardsOwned[msg.sender]++;
                emit CardAwarded(msg.sender, currentStreak[msg.sender]);

                // Reset streak after awarding card
                currentStreak[msg.sender] = 0;
            }

            // Award prize (existing logic)
            uint256 amount = prize;
            (bool sent, ) = msg.sender.call{ value: amount }("");
            require(sent, "Failed to send Ether");

            resetPrize();
            emit Winner(msg.sender, amount);
        } else {
            // Reset streak on loss
            currentStreak[msg.sender] = 0;
        }
    }

    function redeemCards() public {
        if (cardsOwned[msg.sender] < CARDS_REQUIRED_FOR_PRIZE) {
            revert NotEnoughCards();
        }

        // Deduct cards and award prize
        cardsOwned[msg.sender] -= CARDS_REQUIRED_FOR_PRIZE;
        prizesOwned[msg.sender]++;

        emit PrizeRedeemed(msg.sender, CARDS_REQUIRED_FOR_PRIZE);
    }

    // View functions for frontend
    function getPlayerStats(address player) public view returns (uint256 streak, uint256 cards, uint256 prizes) {
        return (currentStreak[player], cardsOwned[player], prizesOwned[player]);
    }

    function getPlayerStreak(address player) public view returns (uint256) {
        return currentStreak[player];
    }

    function getPlayerCards(address player) public view returns (uint256) {
        return cardsOwned[player];
    }

    function getPlayerPrizes(address player) public view returns (uint256) {
        return prizesOwned[player];
    }

    receive() external payable {}
}
