// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BaseDAO {
    struct Proposal {
        string description;
        uint256 deadline;
        uint256 yesVotes;
        uint256 noVotes;
        bool executed;
    }

    enum DepositStatus {
        Pending,
        Approved,
        Rejected
    }

    address public owner;
    uint256 public membershipFee;
    mapping(address => bool) public members;
    Proposal[] public proposals;
    mapping(address => mapping(uint256 => bool)) public votes;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyMember() {
        require(members[msg.sender], "Only members can call this function");
        _;
    }

    event MembershipPurchased(address member);
    event ProposalCreated(uint256 proposalId, string description, uint256 deadline);
    event VoteCast(uint256 proposalId, address voter, bool vote);
    event ProposalExecuted(uint256 proposalId, bool approved);

    constructor(uint256 _membershipFee) {
        owner = msg.sender;
        membershipFee = _membershipFee;
    }

    function joinDAO() external payable {
        require(msg.value >= membershipFee, "Incorrect membership fee");
        require(!members[msg.sender], "Already a member");
        members[msg.sender] = true;
        emit MembershipPurchased(msg.sender);
    }

    function createProposal(string memory _description, uint256 _votingPeriod) external onlyMember {
        uint256 deadline = block.timestamp + _votingPeriod;
        proposals.push(Proposal({
            description: _description,
            deadline: deadline,
            yesVotes: 0,
            noVotes: 0,
            executed: false
        }));
        emit ProposalCreated(proposals.length - 1, _description, deadline);
    }

    function vote(uint256 proposalId, bool support) external onlyMember {
        require(proposalId < proposals.length, "Proposal does not exist");
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp < proposal.deadline, "Voting period has ended");
        require(!votes[msg.sender][proposalId], "Already voted");

        votes[msg.sender][proposalId] = true;

        if (support) {
            proposal.yesVotes += 1;
        } else {
            proposal.noVotes += 1;
        }

        emit VoteCast(proposalId, msg.sender, support);
    }

    function executeProposal(uint256 proposalId) external onlyMember {
        require(proposalId < proposals.length, "Proposal does not exist");
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.deadline, "Voting period has not ended");
        require(!proposal.executed, "Proposal already executed");

        proposal.executed = true;
        bool approved = proposal.yesVotes > proposal.noVotes;

        emit ProposalExecuted(proposalId, approved);
    }

    function getProposals() external view returns (Proposal[] memory) {
        return proposals;
    }
}