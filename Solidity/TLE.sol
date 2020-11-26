// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.5.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "./Provider_Depreciation_Contract.sol";

contract TLE_Contract is Provider_Depreciation_Contract {

    event newTLE(uint indexed referenceId, string spaceObject);

    struct structTLE {
        string spaceObject;
        bytes25 TLE1;
        bytes24 TLE2;
    }

    // mapping between referenceId and the data
    mapping (uint => structTLE[]) public TLEs;


    function setTLE(uint _referenceId, string memory _spaceObject, bytes25 _TLE1, bytes24 _TLE2) onlyProvider(_referenceId) public{

        /*
            Creating a two line element object and inserting data
        */
        structTLE memory _newObs;
        _newObs.spaceObject = _spaceObject;
        _newObs.TLE1 = _TLE1;
        _newObs.TLE2 = _TLE2;
        TLEs[_referenceId].push(_newObs);

        // Needed to see at the end if the provider uploaded the number of data promised
        if(dataReferences[_referenceId].referenceKey ==0)
        dataReferences[_referenceId].numberOfData ++;

        emit newTLE(_referenceId, _spaceObject);
    }


    function getTLEs (uint _referenceId) external view returns(bytes32 ,structTLE[] memory){
        if((now < dataReferences[_referenceId].endTime) && (dataReferences[_referenceId].referenceKey == 0)){
            // Conditions to check if the request comes from a client or not
            require(dataReferences[_referenceId].keyDecoder[msg.sender] != 0 || msg.sender == dataReferences[_referenceId].provider);
            return (dataReferences[_referenceId].keyDecoder[msg.sender], TLEs[_referenceId]);
        }
        else{
            return (dataReferences[_referenceId].referenceKey, TLEs[_referenceId]);
        }
    }

}