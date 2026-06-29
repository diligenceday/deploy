// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title LPTokenLocker
 * @notice 锁定 LP token 到指定时间,锁仓期间 LP 不可提取
 * @dev MVP 版本: 单锁仓,时间锁,Owner 可续期/提前解锁 (项目方需要主动 lock 才能解锁)
 *
 * 部署参数:
 *   _token       LP token 合约地址
 *   _beneficiary 受益人地址 (LP 释放时打给谁)
 *   _unlockTime  解锁时间 (unix timestamp)
 *   _amount      锁仓数量
 *
 * 使用流程:
 *   1. deploy(_lpToken, beneficiary, unlockTime, amount) - 部署时锁仓
 *   2. extendLock(newUnlockTime) - 续期
 *   3. release() - 到期后受益人调用释放
 */
contract LPTokenLocker is Ownable, ReentrancyGuard {
    IERC20 public immutable token;
    address public beneficiary;
    uint256 public unlockTime;
    uint256 public amount;

    event Locked(address indexed beneficiary, uint256 amount, uint256 unlockTime);
    event Released(address indexed beneficiary, uint256 amount);
    event Extended(uint256 newUnlockTime);

    constructor(
        IERC20 _token,
        address _beneficiary,
        uint256 _unlockTime,
        uint256 _amount
    ) Ownable(msg.sender) {
        require(_beneficiary != address(0), "invalid beneficiary");
        require(_unlockTime > block.timestamp, "unlock time must be future");
        require(_amount > 0, "amount must > 0");

        token = _token;
        beneficiary = _beneficiary;
        unlockTime = _unlockTime;
        amount = _amount;

        // 部署时直接从 owner 转入 LP token
        require(_token.transferFrom(msg.sender, address(this), _amount), "transferFrom failed");

        emit Locked(_beneficiary, _amount, _unlockTime);
    }

    /**
     * @notice 受益人在解锁时间后提取 LP token
     */
    function release() external nonReentrant {
        require(block.timestamp >= unlockTime, "still locked");
        require(msg.sender == beneficiary || msg.sender == owner(), "not authorized");

        uint256 released = amount;
        amount = 0;
        require(token.transfer(beneficiary, released), "transfer failed");

        emit Released(beneficiary, released);
    }

    /**
     * @notice Owner 续期 (只能往后延,不能提前)
     */
    function extendLock(uint256 newUnlockTime) external onlyOwner {
        require(newUnlockTime > unlockTime, "new time must be later");
        unlockTime = newUnlockTime;
        emit Extended(newUnlockTime);
    }

    /**
     * @notice Owner 修改受益人 (极端情况,谨慎使用)
     */
    function changeBeneficiary(address newBeneficiary) external onlyOwner {
        require(newBeneficiary != address(0), "invalid beneficiary");
        beneficiary = newBeneficiary;
    }

    /**
     * @notice 查询锁仓详情
     */
    function lockInfo() external view returns (
        IERC20 _token,
        address _beneficiary,
        uint256 _unlockTime,
        uint256 _amount,
        uint256 _secondsRemaining
    ) {
        uint256 remaining = block.timestamp < unlockTime ? unlockTime - block.timestamp : 0;
        return (token, beneficiary, unlockTime, amount, remaining);
    }
}
