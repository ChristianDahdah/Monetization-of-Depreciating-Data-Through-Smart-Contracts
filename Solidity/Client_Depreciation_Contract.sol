// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.5.0 <0.7.0;

import "./Depreciation_Contract.sol";

contract Client_Depreciation_Contract is Depreciation_Contract {

    /*
    ---------------------------------------------
                      Events
    ---------------------------------------------
    */

    event newClient(
        uint indexed referenceId,
        address indexed client,
        uint fund,
        uint time,
        bytes32 publicKeyDH1,
        bytes32 publicKeyDH2,
        bytes32 publicKeyDH3,
        bytes32 publicKeyDH4);

    event encodedKeyHash(
        uint indexed referenceId,
        address indexed client,
        bytes32 encodedKeyHash);

    event withdrawRefund(
        uint indexed referenceId,
        address indexed client,
        uint funds,
        uint time);


    /*
    ---------------------------------------------
                      Modifiers
    ---------------------------------------------
    */

    // Checks if the msg.sender bought the referenceId and did not withdrew funds
    modifier isClient(uint _referenceId) {
        require(dataReferences[_referenceId].clientFunds[msg.sender] > 0);
        _;
    }

    modifier isPayed(uint _referenceId) {
        // Checks that the provider did not publish the reference key already
        require(dataReferences[_referenceId].referenceKey == 0);
        // Checks that the contract time did not end
        require(now < dataReferences[_referenceId].endTime);

        uint _price = getReferenceCurrentPrice(_referenceId);
        // The ether sent must be bigger to the current price but not higher than the initial one to avoid paying more
        require(msg.value >= _price);
        require(msg.value <= dataReferences[_referenceId].initialPrice);
        _;
    }


    /*
    ---------------------------------------------
            Client buy mechanism functions
    ---------------------------------------------
    */


    function buyReference(
        uint _referenceId,
        bytes32 _publicKeyDH1,
        bytes32 _publicKeyDH2,
        bytes32 _publicKeyDH3,
        bytes32 _publicKeyDH4) isPayed(_referenceId) payable external {

        // Checks that client did not already buy the reference
        require(dataReferences[_referenceId].isClient[msg.sender] == false);

        // Adds clients to reference list
        dataReferences[_referenceId].clients.push(msg.sender);
        dataReferences[_referenceId].isClient[msg.sender] = true;

        dataReferences[_referenceId].clientFunds[msg.sender] = msg.value;
        dataReferences[_referenceId].withdrawableFunds += msg.value;

        emit newClient(_referenceId,
            msg.sender,
            msg.value,
            now,
            _publicKeyDH1,
            _publicKeyDH2,
            _publicKeyDH3,
            _publicKeyDH4);
    }


    function setEncodedHashedKey(uint _referenceId, bytes32 _encodedKeyHash) external isClient(_referenceId) {

        /*
        Condition to allow the client to provide once the hash of the encrypted key
        Necessary to avoid confusion for the provider or changing the value after the provider has posted the decoder
        */

        if (dataReferences[_referenceId].encodedKeyHash[msg.sender] == 0) {
            dataReferences[_referenceId].encodedKeyHash[msg.sender] = _encodedKeyHash;
        }

        emit encodedKeyHash(_referenceId, msg.sender, _encodedKeyHash);

    }

    function getKeyDecoder(uint _referenceKey) isClient(_referenceKey) view external returns (bytes32){
        return dataReferences[_referenceKey].keyDecoder[msg.sender];
    }

    /*
    ---------------------------------------------
              Client dispute functions
    ---------------------------------------------
    */

    function withdrawDisputeFunds(uint _referenceId, uint funds) internal {

        // Cannot withdraw more than the available funds
        require(dataReferences[_referenceId].withdrawableFunds >= funds);

        // Needed for the view getClientDisputes function
        dataReferences[_referenceId].numberOfDisputes ++;

        // Needed to prevent multiple raising disputes for one client
        dataReferences[_referenceId].clientFunds[msg.sender] = 0;

        // Provider cannot withdraw the disputed funds anymore
        dataReferences[_referenceId].withdrawableFunds -= funds;

        // Funds sent back to the client
        (msg.sender).transfer(funds);

        emit withdrawRefund(_referenceId, msg.sender, funds, now);
    }


    /*
    isClient modifier checks if a client hasn't already withdrew his funds.
    This is needed so he does not withdraw insuranceDeposit multiple times
    */

    function raiseDispute(uint _referenceId) isClient(_referenceId) external returns (bool) {

        uint funds = dataReferences[_referenceId].clientFunds[msg.sender];

        // Checks if provider hasn't already withdrew funds
        require(dataReferences[_referenceId].withdrawableFunds >= funds);

        // If provider hasn't send any decoder key the client can directly take back his funds
        if (dataReferences[_referenceId].keyDecoder[msg.sender] == 0) {
            withdrawDisputeFunds(_referenceId, funds);
            // Client withdrew funds
            return true;
        }

        else if (dataReferences[_referenceId].referenceKey != 0) {

            bytes32 _xor = dataReferences[_referenceId].referenceKey ^ dataReferences[_referenceId].keyDecoder[msg.sender];

            // Condition comparing the hashes of encoded keys to determine if the right key was given
            if (keccak256(abi.encode(_xor)) != dataReferences[_referenceId].encodedKeyHash[msg.sender]) {
                funds += (dataReferences[_referenceId].insuranceDeposit / dataReferences[_referenceId].completedClients);
                withdrawDisputeFunds(_referenceId, funds);
                // Client withdrew funds
                return true;
            }

            // Condition for number of data
            else if (dataReferences[_referenceId].numberOfData < dataReferences[_referenceId].minimumData) {
                funds += (dataReferences[_referenceId].insuranceDeposit / dataReferences[_referenceId].completedClients);
                withdrawDisputeFunds(_referenceId, funds);
                // Client withdrew funds
                return true;
            }

        }

        // Equivalent to: now > contract end time AND client received keyDecoder (hash is correct) AND referenceKey was never published
        else if (now > dataReferences[_referenceId].endTime) {
            withdrawDisputeFunds(_referenceId, funds);
            // Client withdrew funds
            return true;
        }

        // Client did not withdrew funds
        return false;
    }


}
