// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.5.0 <0.7.0;

contract Depreciation_Contract{

    struct DataReference{ // Contains reference info and price

        uint initialPrice;
        uint insuranceDeposit;
        // Necessary to keep track what can the provider withdraw
        uint withdrawableFunds;

        address provider;

        //Must be long enough to avoid BruteForce
        bytes32 referenceKey;

        // Tightly packed data 4x64 = 256
        uint64 minimumData;
        uint64 numberOfData;
        // Needed to calculate depreciation value
        uint64 deployTime;
        /*
            Should not be allowed to be changed by anyone, even the owner to avoid scams and ...
            ... withholding funds for a longer time than anticipated
        */
        uint64 endTime;

        /*
            Value depreciation factors.
            1: linear depreciation | 2: quadratic depreciation. Any other value: constant price (no depreciation)
        */
        uint8 depreciationType;

        /*
            Client parameters
        */

        // List of clients that bought the contract
        address[] clients;
        mapping (address => uint) clientFunds;

        // Needed to give access for a client to call dispute function or recall funds
        mapping (address => bool) isClient;
        // Needed to return a table of clients disputes
        uint128 numberOfDisputes;
        // Needed to distribute redeemFunds
        uint128 completedClients;

        /*
            The client provides the encryptedKey's hash that would allow the provided to provider the decoding key
            Also this is used to compare this hash with the real key later provided publicly by the provider
        */
        mapping (address => bytes32) encodedKeyHash;
        mapping (address => bytes32) keyDecoder;
    }

    DataReference[] dataReferences;


    /*
    ---------------------------------------------
                      Getters
    ---------------------------------------------
    */

    function getNumberOfData(uint _referenceId) view external returns(uint128 numberOfData){
        return dataReferences[_referenceId].numberOfData;
    }


    // Needed so the client and the smart contract know the current depreciated value
    function getReferenceCurrentPrice(uint _referenceId) view public returns(uint price){
        uint _price = dataReferences[_referenceId].initialPrice;
        uint8 depreciationType = dataReferences[_referenceId].depreciationType;

        // Linear value depreciation
        if(depreciationType == 1){
            // reference time length timeLength: T(end) - T(deploy)
            uint timeLength = uint (dataReferences[_referenceId].endTime - dataReferences[_referenceId].deployTime);
            // time elapsed from the beginning of contract T: now - deployTime
            uint timeElapsed = now - uint (dataReferences[_referenceId].deployTime);

            _price = _price - (_price * timeElapsed / timeLength);

        }

        // Quadratic value depreciation
        else if(depreciationType == 2){
            // reference time length timeLength: T(end) - T(deploy)
            uint timeLength = uint (dataReferences[_referenceId].endTime - dataReferences[_referenceId].deployTime);
            // time elapsed from the beginning of contract T: now - deployTime
            uint timeElapsed = now - uint (dataReferences[_referenceId].deployTime);

            _price = (_price*timeElapsed*timeElapsed)/(timeLength*timeLength)
            - (2*_price*timeElapsed)/(timeLength) + _price;
        }

        // if no depreciation type index is correct it will return the initial price (constant value / no depreciation)
        return _price;
    }


}