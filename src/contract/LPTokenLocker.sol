// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title LPTokenLocker
 * @notice 锁定 LP token,到期由受益人提取(deposit 模式)
 * @dev 部署流程:
 *      1. 部署合约(不扣款,只存元数据)
 *      2. Owner 调 LP token 的 Approve 给本合约地址(locker 地址)
 *      3. Owner 调 deposit() 完成锁仓
 *      4. 到解锁时间,受益人调 withdraw() 提取
 */
contract LPTokenLocker is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public lpToken;
    address public beneficiary;
    uint256 public unlockTime;
    uint256 public lockedAmount;
    bool public deposited;
    bool public withdrawn;

    event Deposited(uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);
    event BeneficiaryChanged(address indexed from, address indexed to);

    constructor(
        IERC20 _lpToken,
        address _beneficiary,
        uint256 _unlockTime,
        uint256 _amount
    ) Ownable(msg.sender) {
        require(address(_lpToken) != address(0), "Invalid LP token");
        require(_beneficiary != address(0), "Invalid beneficiary");
        require(_unlockTime > block.timestamp, "Unlock time must be future");
        require(_amount > 0, "Amount must > 0");

        lpToken = _lpToken;
        beneficiary = _beneficiary;
        unlockTime = _unlockTime;
        lockedAmount = _amount;
    }

    /// @notice Owner 调 deposit 锁仓
    /// @dev 调用前需先 Approve LP token 给本合约地址
    function deposit() external onlyOwner nonReentrant {
        require(!deposited, "Already deposited");
        uint256 balance = lpToken.balanceOf(address(this));
        require(balance >= lockedAmount, "Need approve first: balance < expected");
        deposited = true;
        lockedAmount = balance;
        emit Deposited(balance);
    }

    /// @notice 受益人提取锁仓 LP
    function withdraw() external nonReentrant {
        require(msg.sender == beneficiary, "Not beneficiary");
        require(deposited, "Not deposited yet");
        require(block.timestamp >= unlockTime, "Still locked");
        require(!withdrawn, "Already withdrawn");

        withdrawn = true;
        uint256 amount = lpToken.balanceOf(address(this));
        lpToken.safeTransfer(beneficiary, amount);
        emit Withdrawn(beneficiary, amount);
    }

    /// @notice Owner 更换受益人
    function setBeneficiary(address _newBeneficiary) external onlyOwner {
        require(_newBeneficiary != address(0), "Invalid address");
        emit BeneficiaryChanged(beneficiary, _newBeneficiary);
        beneficiary = _newBeneficiary;
    }

    /// @notice Owner 延长解锁时间
    function extendLock(uint256 _newUnlockTime) external onlyOwner {
        require(_newUnlockTime > unlockTime, "New time must > current");
        unlockTime = _newUnlockTime;
    }

    /// @notice 紧急情况下 Owner 取回 LP(仅当未 deposit 时)
    function emergencyWithdraw() external onlyOwner nonReentrant {
        require(!deposited, "Already deposited");
        uint256 balance = lpToken.balanceOf(address(this));
        if (balance > 0) {
            lpToken.safeTransfer(owner(), balance);
        }
    }

    /// @notice 查询锁仓详情
    function getInfo() external view returns (
        address token,
        address _beneficiary,
        uint256 unlockTimestamp,
        uint256 amount,
        bool isDeposited,
        bool isWithdrawn,
        bool isUnlockable,
        uint256 secondsRemaining
    ) {
        uint256 remaining = block.timestamp < unlockTime ? unlockTime - block.timestamp : 0;
        bool unlockable = deposited && !withdrawn && block.timestamp >= unlockTime;
        return (
            address(lpToken),
            beneficiary,
            unlockTime,
            lockedAmount,
            deposited,
            withdrawn,
            unlockable,
            remaining
        );
    }
}
