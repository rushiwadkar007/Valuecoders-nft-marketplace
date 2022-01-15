pragma solidity 0.5.2;

pragma experimental ABIEncoderV2;

import "./ERC721Full.sol";

contract Color is ERC721Full {

    /**
    * @dev - STATE VARIABLES
    */
    address owner;

    string[] public colors;

    address payable public beneficiary;

    uint256 public auctionEndTime;

    uint256 biddingTime;

    address payable public highestBidder;

    uint256 public highestBid;

    bool bidEnded = false;

    bool paymetTransferred = false;


    /**
    * @dev - STRUCTS
    */
    struct TokenValue {

        address tokenOwner;

        uint256 token_id;

        uint256 value;

        string name;

    }

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

    struct BidParticipators{

        address[] participatories;

        uint256 tokenID;

        string participatoryName;

        uint256 bidAmount;
    }

    struct BidParticipator{

        address participatory;

        uint256 tokenID;

        string participatoryName;

        uint256 bidAmount;
    }


    /**
    * @dev - STATE INSTANCE
    */
    TokenValue tokn;

    BidParticipators bidParticipators;

    BidParticipator bidParticipator;

    NFTDetails nftDetails;

    NFTOwnerDetails nftOwnerDetails;

    /**
    * @dev - ARRAYS
    */
    NFTDetails[] public nftListOfOwner;

    BidParticipators[] public participatories;

    BidParticipators[]  public  allBidParticipators;

    BidParticipator[] public enterTokenBidWiseData;

    BidParticipator[] public enterTokenBidWiseData1;

    address[] bidParticipatories;


    /**
    * @dev - MAPPINGS
    */
    mapping(string => bool) _colorExists;

    mapping(uint256 => NFTDetails) public NFTInfo;

    mapping(uint256 => NFTOwnerDetails) public NFTOwnerInfo;

    mapping(address => mapping(uint256 => NFTDetails)) public nftListByNFTOwner;

    mapping(uint256 => uint256) public tokenAuctionEndTimeByTokenID;

    mapping(address => uint256) public pendingReturns;

    mapping(address => BidParticipator) public addressWiseParticipatory;

    mapping(uint256 => BidParticipators) public tokenWiseParticipatory;


    /**
    * @dev - EVENTS
    */
    event Details(address, uint256, uint256, string);

    event NFTMinted(address tokenOwner, uint256 tokenID, uint256 tokenMintTime);

    event HighestBidIncrease(address bidder, uint256 amount);

    event AuctionEnded(address winner, uint256 amount);

    event ParticipatoryDetails(address, uint256, string, uint256);

    /**
    * @dev - CONSTRUCTOR
    */
    constructor(address payable _beneficiary)
        public
        ERC721Full("", "")
    {
        beneficiary = _beneficiary;
    }


    /**
    * @dev - MODIFIER
    */
    modifier onlyOwner() {
        owner = msg.sender;

        _;
    }


    function mintNFT(
        string memory _name,
        uint256 _value,
        string memory ownerName
    ) public {
        require(!_colorExists[_name], "This string already exists");

        uint256 _id = colors.push(_name);

        _mint(msg.sender, _id);

        uint256 mintTime = block.timestamp;

        _colorExists[_name] = true;

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

        tokn = TokenValue(msg.sender, _id, _value, _name);

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
        uint256 tokenID
    ) public returns (bool) {
        require(
            paymetTransferred == true,
            "Payment has not yet been transferred to the NFT Owner. Please Send Payment in time."
        );

        require(
            ownerOf(tokenID) != buyer,
            "Buyer can not be the owner of NFT at this stage."
        );

        safeTransferFrom(seller, buyer, tokenID);

        beneficiary = buyer;

        paymetTransferred = false;

        return true;
    }

    function bidNFT(address _participatory, uint256 _tokenID, string memory _participatoryName, uint256 _bidAmount) internal {
       
        require(block.timestamp < auctionEndTime, "auction already ended.");

        require(
            msg.value >= highestBid,
            "Equal or higher than this bid is already present"
        );

        highestBid = msg.value;

        _bidAmount = highestBid;

        highestBidder = msg.sender;

        _participatory = highestBidder;

        bidParticipatories.push(_participatory);

        bidParticipators = BidParticipators(bidParticipatories, _tokenID, _participatoryName, _bidAmount);

        participatories.push(bidParticipators);

        for(uint256 i=0; i< tokenWiseParticipatory[_tokenID].participatories.length; i++){

            bidParticipator = BidParticipator(tokenWiseParticipatory[_tokenID].participatories[i], _tokenID, tokenWiseParticipatory[_tokenID].participatoryName, tokenWiseParticipatory[_tokenID].bidAmount);

            enterTokenBidWiseData.push(bidParticipator);
        }

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

        tokenAuctionEndTimeByTokenID[tokenID] = auctionEndTime;

        return (biddingTime, auctionEndTime);
    }

    function getTokenWiseParticipators(uint256 _tokenID) public returns(BidParticipator [] memory){
        if(block.timestamp < getAuctionPeriod(_tokenID)){

            for(uint256 i=0; i< enterTokenBidWiseData.length; i++){

                if(_tokenID == enterTokenBidWiseData[i].tokenID){

                enterTokenBidWiseData1.push(enterTokenBidWiseData[i]);

                return enterTokenBidWiseData1;

                }

            }
        
        }

        else{

                for(uint256 i=enterTokenBidWiseData1.length;i>=0;i--){

                delete enterTokenBidWiseData1[i-1];

                return enterTokenBidWiseData1;

            }

        }
           
    }

    function getAuctionPeriod(uint256 tokenID) public view returns (uint256) {
        return tokenAuctionEndTimeByTokenID[tokenID];
    }

    /**
struct BidParticipator{

        address participatory;

        uint256 tokenID;

        string participatoryName;

        uint256 bidAmount;
    }
NFTOwnerDetails nftOwnerDetails;
mapping(uint256 => BidParticipator) public tokenWiseParticipatory;
event ParticipatoryDetails(address, uint256, string, uint256);
BidParticipator[] public participatories;
    */

    function conductBid(
        address bidder,
        address _participatory,
        uint256 _tokenID,
        string memory _participatoryName,
        uint256 _bidAmount
    ) public payable returns (bool) {
        
        getAuctionPeriod(_tokenID);
 
        require(
            nftListByNFTOwner[_participatory][_tokenID].tokenOwner != bidder,
            "bidder is not the owner of this NFT."
        );

        require(
            nftListByNFTOwner[bidder][_tokenID].tokenID == _tokenID,
            "token ID is wrong. Perhaps this token is not minted yet."
        );

        bidNFT(_participatory, _tokenID, _participatoryName, _bidAmount);

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

    function getNFTBidWinner(uint256 tokenID) public view returns (address) {
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
