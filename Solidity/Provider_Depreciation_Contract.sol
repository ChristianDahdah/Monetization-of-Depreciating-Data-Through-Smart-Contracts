// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.5.0 <0.7.0;

import "./Client_Depreciation_Contract.sol";

contract Provider_Depreciation_Contract is Client_Depreciation_Contract {

    /*
    ---------------------------------------------
                      Events
    ---------------------------------------------
    */

    event newDataReference(
        uint indexed referenceId,
        address indexed provider,
        uint initialPrice,
        uint insuranceDeposit,
        uint64 minimumData,
        uint64 deployTime,
        uint64 endTime,
        uint8 depreciationType,
        string description,
        bytes32 publicKeyDH1,
        bytes32 publicKeyDH2,
        bytes32 publicKeyDH3,
        bytes32 publicKeyDH4
        );


    event encryptedEncodedKeyEvent(
        uint indexed referenceId,
        address indexed client,
        bytes32 encryptedEncodedKey
    );

    event referenceKey(uint indexed referenceId, bytes32 referenceKey);

    event keyDecoder(uint indexed referenceId, address indexed client, bytes32 keyDecoder);

    event withdrawFundsEvent(uint indexed _referenceId, uint funds);
    /*
    ---------------------------------------------
                      Modifiers
    ---------------------------------------------
    */

    // Give access to the provider only
    modifier onlyProvider(uint _referenceId) {
        require(msg.sender == dataReferences[_referenceId].provider);
        _;
    }


    // Create a new reference to insert data in later
    function createDataReference(uint _initialPrice,
        uint64 _minimumData,
        uint64 _referenceDuration,
        uint8 _depreciationType,
        string memory _description,
        bytes32 _publicKeyDH1,
        bytes32 _publicKeyDH2,
        bytes32 _publicKeyDH3,
        bytes32 _publicKeyDH4
    ) payable public {

        /*
            Creating data reference object and inserting data
        */

        DataReference memory newReference;

        // Sets price and depreciation. Provider won't be able to change it later.
        newReference.initialPrice = _initialPrice;
        newReference.insuranceDeposit = msg.value;
        newReference.withdrawableFunds = msg.value;
        newReference.minimumData = _minimumData;
        newReference.depreciationType = _depreciationType;
        newReference.deployTime = uint64(now);
        newReference.endTime = _referenceDuration + uint64(now);
        // To avoid overflow and any malicious attempts to withdraw money when not supposed
        require(newReference.endTime > uint64(now));

        newReference.provider = msg.sender;

        // Adding reference to the blockchain's storage
        dataReferences.push(newReference);

        emit newDataReference(
            dataReferences.length - 1,
            msg.sender,
            _initialPrice,
            msg.value,
            _minimumData,
            uint64(now),
            newReference.endTime,
            _depreciationType,
            _description,
            _publicKeyDH1,
            _publicKeyDH2,
            _publicKeyDH3,
            _publicKeyDH4);

    }

    // 5 days after the end of the contract/reference the provider can withdraw the available funds
    function withdrawFunds(uint _referenceId) onlyProvider(_referenceId) external {

        // Checks if the provider has waited for the time limit for clients to set a dispute
        // !!!!!!!!!!!!!!! TODO CHANGE LATER TO 5 DAYS
        require(now > dataReferences[_referenceId].endTime + 30 seconds);

        // Checks that provider gave a key
        require(dataReferences[_referenceId].referenceKey != 0);

        // Calculating the total funds that can be withdrawn
        uint funds = dataReferences[_referenceId].withdrawableFunds;
        dataReferences[_referenceId].withdrawableFunds = 0;

        require(funds > 0);

        (msg.sender).transfer(funds);
        emit withdrawFundsEvent(_referenceId, funds);
    }

    /*
    ---------------------------------------------
                     Key Setters
    ---------------------------------------------
    */

    // Needed to send privately(encrypted) encoded Key (K^K2^K3)
    function setEncryptedEncodedKey(
        uint _referenceId,
        address _client,
        bytes32 _encryptedEncodedKey) onlyProvider(_referenceId) external {
        // To avoid emitting an empty _encryptedEncodedKey and having trouble with events
        if (_encryptedEncodedKey != 0)
            emit encryptedEncodedKeyEvent(_referenceId, _client, _encryptedEncodedKey);
    }


    function setKeyDecoder(uint _referenceId, address _client, bytes32 _keyDecoder) onlyProvider(_referenceId) external {

        // Condition necessary so that the provider does not provide a key decoder if the client removed his funds
        if (dataReferences[_referenceId].clientFunds[_client] > 0) {

            // First condition: the key once set cannot be modified to avoid scams
            // Second Condition: To avoid emitting an empty _keyDecoder and having trouble with events
            if (dataReferences[_referenceId].keyDecoder[_client] == 0 && _keyDecoder != 0) {
                dataReferences[_referenceId].keyDecoder[_client] = _keyDecoder;
                dataReferences[_referenceId].completedClients ++;
                emit keyDecoder(_referenceId, _client, _keyDecoder);
            }
        }
    }


    function setReferenceKey(uint _referenceId, bytes32 _referenceKey) onlyProvider(_referenceId) external {

        // First condition: the key once set cannot be modified to avoid scams
        // Second Condition: To avoid emitting an empty _referenceKey and having trouble with events
        if (dataReferences[_referenceId].referenceKey == 0 && _referenceKey != 0) {
            dataReferences[_referenceId].referenceKey = _referenceKey;
            emit referenceKey(_referenceId, _referenceKey);
        }
    }


    /*
    ---------------------------------------------
                      Getters
    ---------------------------------------------
    */

    function getClients(uint _referenceId) onlyProvider(_referenceId) external view returns (address[] memory){
        return dataReferences[_referenceId].clients;
    }


    function getClientDisputes(uint _referenceId) onlyProvider(_referenceId) view external
    returns (address[] memory) {

        uint numberOfDisputes = dataReferences[_referenceId].numberOfDisputes;

        // Initializing the tables
        address[] memory clientDisputes = new address[](numberOfDisputes);

        // Just to be used for for loop
        address client;

        for (uint i = 0; i < dataReferences[_referenceId].clients.length; i++) {

            client = dataReferences[_referenceId].clients[i];

            // If condition that checks that the client Id has claimed his funds (raised a dispute)
            if (dataReferences[_referenceId].clientFunds[client] == 0) {
                clientDisputes[i] = client;
            }
        }
        return (clientDisputes);
    }

}
