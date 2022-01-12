pragma solidity 0.5.2;

import "./ERC721Full.sol";
import "../ERC20/ERC20.sol";

contract Color is ERC721Full {
    struct TokenValue {
        address tokenOwner;
        uint256 token_id;
        uint256 value;
        string name;
    }

    TokenValue tokn;

    struct NFTDetails {
        address tokenOwner;
        uint256 tokenID;
        uint256 nftMintTime;
        bool isNFTBiddingDone;
    }

    struct NFTOwnerDetails {
        address tokenOwner;
        uint256 tokenID;
        string ownerName;
        uint256 totalTokensMinted;
    }

    address owner;

    string[] public colors;

    mapping(string => bool) _colorExists;

    mapping(uint256 => NFTDetails) public NFTInfo;

    mapping(uint256 => NFTOwnerDetails) public NFTOwnerInfo;

    mapping(address => mapping(uint256 => NFTDetails)) public nftListByNFTOwner;

    mapping(uint256 => uint256) public tokenBiddingEndTime;

    event Details(address, uint256, uint256, string);

    event NFTMinted(address tokenOwner, uint256 tokenID, uint256 tokenMintTime);

    NFTDetails[][] nfts;

    NFTDetails[] public nftListOfOwner;

    address payable public beneficiary;

    uint256 public auctionEndTime;

    uint256 biddingTime;

    address payable public highestBidder;

    uint256 public highestBid;

    mapping(address => uint256) public pendingReturns;

    bool bidEnded = false;

    bool paymetTransferred = false;

    event HighestBidIncrease(address bidder, uint256 amount);

    event AuctionEnded(address winner, uint256 amount);

    constructor(address payable _beneficiary)
        public
        ERC721Full("Color", "COLOR")
    {
        beneficiary = _beneficiary;
    }

    modifier onlyOwner() {
        owner = msg.sender;

        _;
    }

    NFTDetails nftDetails;

    NFTOwnerDetails nftOwnerDetails;

    function mint(
        string memory _color,
        uint256 _value,
        string memory ownerName
    ) public {
        require(!_colorExists[_color], "This string already exists");

        uint256 _id = colors.push(_color);

        _mint(msg.sender, _id);

        uint256 mintTime = block.timestamp;

        _colorExists[_color] = true;

        nftDetails = NFTDetails(msg.sender, _id, mintTime, false);

        nftListOfOwner.push(nftDetails);

        NFTInfo[_id] = nftDetails;

        NFTOwnerInfo[_id] = nftOwnerDetails;

        uint256 totalTokensMinted = nftListOfOwner.length;

        nftOwnerDetails = NFTOwnerDetails(
            msg.sender,
            _id,
            ownerName,
            totalTokensMinted
        );

        nftListByNFTOwner[msg.sender][_id] = nftDetails;

        tokn = TokenValue(msg.sender, _id, _value, _color);

        emit NFTMinted(msg.sender, _id, mintTime);
    }

    function getTokenDetails()
        public
        view
        returns (
            address,
            uint256,
            uint256,
            string memory
        )
    {
        return (tokn.tokenOwner, tokn.token_id, tokn.value, tokn.name);
    }

    function transferPayment(address payable _from, address payable _to)
        public
        payable
    {
        require(
            msg.value != 0,
            "Must send ethers to the seller. You are sending 0 amount as payment to seller."
        );

        require(_from != address(0) && _to != address(0), "address is Empty.");

        uint256 amount = msg.value;

        _from = msg.sender;

        _to.call.value(amount).gas(53000)(" ");

        paymetTransferred = true;
    }

    function transferNFT(
        address seller,
        address payable buyer,
        uint256 tokenid
    ) public returns (bool) {
        require(
            paymetTransferred == true,
            "Payment has not yet been transferred to the NFT Owner. Please Send Payment in time."
        );

        require(
            ownerOf(tokenid) != buyer,
            "Buyer can not be the owner of NFT at this stage."
        );

        safeTransferFrom(seller, buyer, tokenid);

        beneficiary = buyer;

        paymetTransferred = false;

        return true;
    }

    function bidNFT() internal {
        require(block.timestamp < auctionEndTime, "auction already ended.");

        require(
            msg.value >= highestBid,
            "Equal or higher than this bid is already present"
        );

        highestBid = msg.value;

        highestBidder = msg.sender;

        require(highestBid != 0, "Bidding value is zero, can not be entered!");

        pendingReturns[highestBidder] = highestBid;

        emit HighestBidIncrease(msg.sender, msg.value);
    }

    function setAuctionPeriod(uint256 _biddingTime, uint256 tokenID)
        public
        onlyOwner
        returns (uint256, uint256)
    {
        require(
            ownerOf(tokenID) ==
                nftListByNFTOwner[msg.sender][tokenID].tokenOwner,
            "Token is not owned by you!"
        );

        biddingTime = _biddingTime;

        auctionEndTime = block.timestamp + biddingTime;

        return (biddingTime, auctionEndTime);
    }

    function getAuctionPeriod() public view returns (uint256) {
        return auctionEndTime;
    }

    function conductBid(
        address bidder,
        address participatory,
        uint256 tokenID
    ) public payable returns (bool) {
        getAuctionPeriod();

        require(
            nftListByNFTOwner[participatory][tokenID].tokenOwner != bidder,
            "bidder is not the owner of this NFT."
        );

        require(
            nftListByNFTOwner[bidder][tokenID].tokenID == tokenID,
            "token ID is wrong. Perhaps this token is not minted yet."
        );

        bidNFT();

        return true;
    }

    function auctionEnd(uint256 tokenID)
        public
        returns (
            address,
            uint256,
            bool
        )
    {
        if (block.timestamp < auctionEndTime) {
            revert("Auction is still going on...Bid fast to win it...");
        } else {
            bidEnded = true;

            address bidder = nftListByNFTOwner[msg.sender][tokenID].tokenOwner;

            emit AuctionEnded(highestBidder, highestBid);

            beneficiary.transfer(highestBid);

            safeTransferFrom(bidder, highestBidder, tokenID);

            nftListByNFTOwner[highestBidder][tokenID]
                .tokenOwner = highestBidder;

            nftListByNFTOwner[highestBidder][tokenID].tokenID = tokenID;

            nftListByNFTOwner[highestBidder][tokenID].isNFTBiddingDone = true;

            beneficiary = highestBidder;

            return (
                nftListByNFTOwner[highestBidder][tokenID].tokenOwner,
                nftListByNFTOwner[highestBidder][tokenID].tokenID,
                nftListByNFTOwner[highestBidder][tokenID].isNFTBiddingDone
            );
        }
    }

    function getNFTOwner(uint256 tokenID) public view returns (address) {
        return nftListByNFTOwner[highestBidder][tokenID].tokenOwner;
    }

    function withdrawFunds() public returns (bool) {
        uint256 amount = pendingReturns[msg.sender];

        require(amount > 0, "amount must be geater than zero.");

        pendingReturns[msg.sender] = 0;

        if (!(msg.sender).send(amount)) {
            pendingReturns[msg.sender] = amount;

            return false;
        }

        return true;
    }
}
