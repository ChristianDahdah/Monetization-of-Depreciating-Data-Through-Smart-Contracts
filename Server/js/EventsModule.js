const Web3 = require('web3');
// const Admin = require('web3-eth-admin').Admin;


// const options = {
//     defaultAccount: '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73',
//     defaultBlock: 'latest',
//     defaultGas: 1,
//     defaultGasPrice: 0,
//     transactionBlockTimeout: 50,
//     transactionConfirmationBlocks: 24,
//     transactionPollingTimeout: 480,
// };

/* Providers */
const provider = 'http://192.168.33.115:8545';
const web3 = new Web3(new Web3.providers.HttpProvider(provider));
const web3ws = new Web3(new Web3.providers.WebsocketProvider('ws://192.168.33.115:8546'));
// const admin = new Admin(provider, null, options);

/*Loading contract */
let ContractAddress = '0x42699A7612A82f1d9C36148af9C77354759b210b';
let abi = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"referenceId","type":"uint256"},{"indexed":true,"internalType":"address","name":"client","type":"address"},{"indexed":false,"internalType":"bytes32","name":"encodedKeyHash","type":"bytes32"}],"name":"encodedKeyHash","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"referenceId","type":"uint256"},{"indexed":true,"internalType":"address","name":"client","type":"address"},{"indexed":false,"internalType":"bytes32","name":"encryptedEncodedKey","type":"bytes32"}],"name":"encryptedEncodedKeyEvent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"referenceId","type":"uint256"},{"indexed":true,"internalType":"address","name":"client","type":"address"},{"indexed":false,"internalType":"bytes32","name":"keyDecoder","type":"bytes32"}],"name":"keyDecoder","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"referenceId","type":"uint256"},{"indexed":true,"internalType":"address","name":"client","type":"address"},{"indexed":false,"internalType":"uint256","name":"fund","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"},{"indexed":false,"internalType":"bytes32","name":"publicKeyDH1","type":"bytes32"},{"indexed":false,"internalType":"bytes32","name":"publicKeyDH2","type":"bytes32"},{"indexed":false,"internalType":"bytes32","name":"publicKeyDH3","type":"bytes32"},{"indexed":false,"internalType":"bytes32","name":"publicKeyDH4","type":"bytes32"}],"name":"newClient","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"referenceId","type":"uint256"},{"indexed":true,"internalType":"address","name":"provider","type":"address"},{"indexed":false,"internalType":"uint256","name":"initialPrice","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"insuranceDeposit","type":"uint256"},{"indexed":false,"internalType":"uint64","name":"minimumData","type":"uint64"},{"indexed":false,"internalType":"uint64","name":"deployTime","type":"uint64"},{"indexed":false,"internalType":"uint64","name":"endTime","type":"uint64"},{"indexed":false,"internalType":"uint8","name":"depreciationType","type":"uint8"},{"indexed":false,"internalType":"string","name":"description","type":"string"},{"indexed":false,"internalType":"bytes32","name":"publicKeyDH1","type":"bytes32"},{"indexed":false,"internalType":"bytes32","name":"publicKeyDH2","type":"bytes32"},{"indexed":false,"internalType":"bytes32","name":"publicKeyDH3","type":"bytes32"},{"indexed":false,"internalType":"bytes32","name":"publicKeyDH4","type":"bytes32"}],"name":"newDataReference","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"referenceId","type":"uint256"},{"indexed":false,"internalType":"string","name":"spaceObject","type":"string"}],"name":"newTLE","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"referenceId","type":"uint256"},{"indexed":false,"internalType":"bytes32","name":"referenceKey","type":"bytes32"}],"name":"referenceKey","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"_referenceId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"funds","type":"uint256"}],"name":"withdrawFundsEvent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"referenceId","type":"uint256"},{"indexed":true,"internalType":"address","name":"client","type":"address"},{"indexed":false,"internalType":"uint256","name":"funds","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"withdrawRefund","type":"event"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"TLEs","outputs":[{"internalType":"string","name":"spaceObject","type":"string"},{"internalType":"bytes25","name":"TLE1","type":"bytes25"},{"internalType":"bytes24","name":"TLE2","type":"bytes24"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_referenceId","type":"uint256"},{"internalType":"bytes32","name":"_publicKeyDH1","type":"bytes32"},{"internalType":"bytes32","name":"_publicKeyDH2","type":"bytes32"},{"internalType":"bytes32","name":"_publicKeyDH3","type":"bytes32"},{"internalType":"bytes32","name":"_publicKeyDH4","type":"bytes32"}],"name":"buyReference","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_initialPrice","type":"uint256"},{"internalType":"uint64","name":"_minimumData","type":"uint64"},{"internalType":"uint64","name":"_referenceDuration","type":"uint64"},{"internalType":"uint8","name":"_depreciationType","type":"uint8"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"bytes32","name":"_publicKeyDH1","type":"bytes32"},{"internalType":"bytes32","name":"_publicKeyDH2","type":"bytes32"},{"internalType":"bytes32","name":"_publicKeyDH3","type":"bytes32"},{"internalType":"bytes32","name":"_publicKeyDH4","type":"bytes32"}],"name":"createDataReference","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_referenceId","type":"uint256"}],"name":"getClientDisputes","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_referenceId","type":"uint256"}],"name":"getClients","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_referenceKey","type":"uint256"}],"name":"getKeyDecoder","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_referenceId","type":"uint256"}],"name":"getNumberOfData","outputs":[{"internalType":"uint128","name":"numberOfData","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_referenceId","type":"uint256"}],"name":"getReferenceCurrentPrice","outputs":[{"internalType":"uint256","name":"price","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_referenceId","type":"uint256"}],"name":"getTLEs","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"},{"components":[{"internalType":"string","name":"spaceObject","type":"string"},{"internalType":"bytes25","name":"TLE1","type":"bytes25"},{"internalType":"bytes24","name":"TLE2","type":"bytes24"}],"internalType":"struct TLE_Contract.structTLE[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_referenceId","type":"uint256"}],"name":"raiseDispute","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_referenceId","type":"uint256"},{"internalType":"bytes32","name":"_encodedKeyHash","type":"bytes32"}],"name":"setEncodedHashedKey","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_referenceId","type":"uint256"},{"internalType":"address","name":"_client","type":"address"},{"internalType":"bytes32","name":"_encryptedEncodedKey","type":"bytes32"}],"name":"setEncryptedEncodedKey","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_referenceId","type":"uint256"},{"internalType":"address","name":"_client","type":"address"},{"internalType":"bytes32","name":"_keyDecoder","type":"bytes32"}],"name":"setKeyDecoder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_referenceId","type":"uint256"},{"internalType":"bytes32","name":"_referenceKey","type":"bytes32"}],"name":"setReferenceKey","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_referenceId","type":"uint256"},{"internalType":"string","name":"_spaceObject","type":"string"},{"internalType":"bytes25","name":"_TLE1","type":"bytes25"},{"internalType":"bytes24","name":"_TLE2","type":"bytes24"}],"name":"setTLE","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_referenceId","type":"uint256"}],"name":"withdrawFunds","outputs":[],"stateMutability":"nonpayable","type":"function"}]
//TODO: current abi :Provider
// const contract = new web3.eth.Contract(abi, ContractAddress); //TODO give correct address when available
const contractws = new web3ws.eth.Contract(abi, ContractAddress);
//TODO give correct address when available


module.exports = {
    /*Get all references */
    GetAvailableRefs: async function () {
        try {
            return await contractws.getPastEvents("newDataReference", {
                fromBlock: 0,
                toBlock: 'latest'
            });
        } catch (e) {
            throw e;
        }
    },

    /*Get a specific reference by it's Id*/
    GetRef: async function (refId) {
        try {
            let res1 = await contractws.getPastEvents("newDataReference", {
                filter: {referenceId: refId},
                fromBlock: 0,
                toBlock: 'latest'
            });
            const reference = res1[0].returnValues;
            reference.insuranceDeposit = web3.utils.fromWei(reference["insuranceDeposit"], "ether");
            return reference;
        } catch (e) {
            throw e;
        }
    },
    /*Get a events references by a list of Id's*/
    GetRefs: async function (listId) {
        try {
            let res1 = await contractws.getPastEvents("newDataReference", {
                filter: {referenceId: listId},
                fromBlock: 0,
                toBlock: 'latest'
            });
            let result =[]
            for (let i = 0; i < res1.length ; i++) {
                const reference = res1[i].returnValues;
                reference.insuranceDeposit = web3.utils.fromWei(reference["insuranceDeposit"], "ether");
                result.push(reference)
            }

            return result;
        } catch (e) {
            throw e;
        }
    },

    /*Get the reference you just put up for sale (useful for sellers database)*/
    GetYourRef: async function (address, blockNumber) {
        try {
            return await contractws.getPastEvents("newDataReference", {
                filter: {address: address},
                fromBlock: blockNumber - 1,
                toBlock: 'latest'
            });
        } catch (e) {
            throw e;
        }
    },

    /*Get references bought by a specific account*/
    GetBoughtRefs: async function (account) {
        try {
            return await contractws.getPastEvents("newClient", {
                filter: {client: account.address},
                fromBlock: 0,
                toBlock: 'latest'
            });
        } catch (e) {
            throw e;
        }
    },
    /*Get references bought by a specific client for a specific id*/
    GetBoughtRefSpecific: async function (id, account) {
        try {
            return await contractws.getPastEvents("newClient", {
                filter: {client: account.address, referenceId: id},
                fromBlock: 0,
                toBlock: 'latest'
            });
        } catch (e) {
            throw e;
        }
    },

    /*Get references being sold by a specific id*/
    GetSoldRefs: async function (account) {
        try {
            return await contractws.getPastEvents("newDataReference", {
                filter: {provider: account.address},
                fromBlock: 0,
                toBlock: 'latest'
            });
        } catch (e) {
            throw e;
        }
    },
    /*Get emit for a refund of a certain client for a certain reference of id : id*/
    GetDispute: async function (clientAddress, id) {
        try {
            return await contractws.getPastEvents("withdrawRefund", {
                filter: {referenceId: id, client: clientAddress},
                fromBlock: 0,
                toBlock: 'latest'
            });
        } catch (e) {
            throw e;
        }
    },
    /*Get all emits testifying that a the provider sent the encrypted key K2 for a certain reference of id : id*/
    GetEncryptedKeysSent: async function (id) {
        try {
            return await contractws.getPastEvents("encryptedEncodedKeyEvent", {
                filter: {referenceId: id},
                fromBlock: 0,
                toBlock: 'latest'
            });
        } catch (e) {
            throw e;
        }
    },

    /*Get emit testifying that a the provider sent the encrypted key K2 for a certain reference of id : id*/
    GetEncryptedKeySentSpecific: async function (id, myaddress) {
        try {
            return await contractws.getPastEvents("encryptedEncodedKeyEvent", {
                filter: {client: myaddress, referenceId: id},
                fromBlock: 0,
                toBlock: 'latest'
            });
        } catch (e) {
            throw e;
        }
    },

    /*Get emit testifying that a the provider sent me the K2 for a certain reference of id : id*/
    GetKeySentSpecific: async function (id, myaddress) {
        try {
            return await contractws.getPastEvents("keyDecoder", {
                filter: {client: myaddress, referenceId: id},
                fromBlock: 0,
                toBlock: 'latest'
            });
        } catch (e) {
            throw e;
        }
    },

    /*Get emits testifying that clients sent me hashes for a certain reference of id : id*/
    GetClientsWhoSentHashes: async function (id) {
        try {
            return await contractws.getPastEvents("encodedKeyHash", {
                filter: {referenceId: id},
                fromBlock: 0,
                toBlock: 'latest'
            });
        } catch (e) {
            throw e;
        }
    },

    /*Get all emits testifying that K2 was sent for a certain reference of id : id*/
    GetKeysSent: async function (id) {
        try {
            return await contractws.getPastEvents("keyDecoder", {
                filter: {referenceId: id},
                fromBlock: 0,
                toBlock: 'latest'
            });
        } catch (e) {
            throw e;
        }
    },

    /************************ Useful function for transforming lists of events ***************************/
    /*note that the event has to be coded such that the attribute of the addresses is "client" !*/
    EventsToAddresses: function (events) {
        let res = [];
        for (let i = 0; i < events.length; i++) {
            res.push(events[i].returnValues.client)
        }
        return res;
    },
    EventsToIds: function (events) {
        let res = [];
        for (let i = 0; i < events.length; i++) {
            res.push(events[i].returnValues.referenceId)
        }
        return res;
    },

    /*Computes the list of elements in list1 and not list2*/
    ComputeLeft: function (list1, list2) {
        let res = [];
        for (let i = 0; i < list1.length; i++) {
            if (!(list2.indexOf(list1[i]) >= 0)) {
                res.push(list1[i])
            }
        }
        return res;
    },
    /*Computes the list of elements in both list1 and list2*/
    ComputeInter: function (list1, list2) {
        let res = [];
        for (let i = 0; i < list1.length; i++) {
            if ((list2.indexOf(list1[i]) >= 0)) {
                res.push(list1[i])
            }
        }
        return res;
    },
    /*Filters the References on todays time*/
    FilterOnTime: function (refs) {
        let res = [];
        let d = new Date();
        let currentTime = d.getTime() / 1000;

        for (let i = 0; i < refs.length; i++) {
            if (refs[i].returnValues.endTime > currentTime) {
                res.push(refs[i])
            }
        }
        return res;
    },



    /*Get the DH Public Key of a provider for a certain id*/
    GetPubDiffieClient: async function (address_client, id) {
        try {
            let res1 = await contractws.getPastEvents("newClient", {
                filter: {referenceId: id, client: address_client},
                fromBlock: 0,
                toBlock: 'latest'
            });
            let DH1 = await new Buffer.from(web3.utils.hexToBytes(res1[0].returnValues.publicKeyDH1));
            let DH2 = await new Buffer.from(web3.utils.hexToBytes(res1[0].returnValues.publicKeyDH2));
            let DH3 = await new Buffer.from(web3.utils.hexToBytes(res1[0].returnValues.publicKeyDH3));
            let DH4 = await new Buffer.from(web3.utils.hexToBytes(res1[0].returnValues.publicKeyDH4));
            return Buffer.concat([DH1, DH2, DH3, DH4])//.slice(0, 4); //TODO Check lengths for slices..
        } catch (e) {
            throw e;
        }
    },

    /*Get the DH Public Key of a seller for a certain id*/
    GetPubDiffieSeller: async function (address_seller, id) {
        try {
            let res1 = await contractws.getPastEvents("newDataReference", {
                filter: {referenceId: id, address: address_seller},
                fromBlock: 0,
                toBlock: 'latest'
            });
            let DH1 = await new Buffer.from(web3.utils.hexToBytes(res1[0].returnValues.publicKeyDH1));
            let DH2 = await new Buffer.from(web3.utils.hexToBytes(res1[0].returnValues.publicKeyDH2));
            let DH3 = await new Buffer.from(web3.utils.hexToBytes(res1[0].returnValues.publicKeyDH3));
            let DH4 = await new Buffer.from(web3.utils.hexToBytes(res1[0].returnValues.publicKeyDH4));
            return Buffer.concat([DH1, DH2, DH3, DH4])//.slice(0, 4); //TODO Check lengths for slices..
        } catch (e) {
            throw e;
        }
    },

    /*Get correct emit from client with the hash he submitted for a particular Id */
    GetHashFromClient: async function (client_address, id) {
        try {
            return await contractws.getPastEvents("encodedKeyHash", {
                filter: {referenceId: id, client: client_address},
                fromBlock: 0,
                toBlock: 'latest'
            });
        } catch (e) {
            throw e;
        }
    },

    /*Get Decoder (K2) from the event emitted by the seller, for me, for a particular Id */
    GetClientDecoder: async function (id, my_address) {
        try {
            return await contractws.getPastEvents("keyDecoder", {
                filter: {referenceId: id, client: my_address},
                fromBlock: 0,
                toBlock: 'latest'
            });
        } catch (e) {
            throw e;
        }
    },
    /* Check for event detailing if a the Reference Key K was posted for a particular Id */
    ReferenceKeySent: async function (id) {
        try {
            return await contractws.getPastEvents("referenceKey", {
                filter: {referenceId: id},
                fromBlock: 0,
                toBlock: 'latest'
            });
        } catch (e) {
            throw e;
        }
    },
    /* Get events detailing all deprecated data in the sense that anyone can read them because the reference key was released */
    ReferenceKeysSent: async function () {
        try {
            return await contractws.getPastEvents("referenceKey", {
                fromBlock: 0,
                toBlock: 'latest'
            });
        } catch (e) {
            throw e;
        }
    },

    /* Check for event detailing the funds withdrawn by the Provider for a particular Id */
    WithdrawFundsEvent: async function (id) {
        try {
            return await contractws.getPastEvents("withdrawFundsEvent", {
                filter: {referenceId: id},
                fromBlock: 0,
                toBlock: 'latest'
            });
        } catch (e) {
            throw e;
        }
    },

    /* Check for events of withdrawn funds in general */
    WithdrawFundsEventGeneral: async function () {
        try {
            return await contractws.getPastEvents("withdrawFundsEvent", {
                fromBlock: 0,
                toBlock: 'latest'
            });
        } catch (e) {
            throw e;
        }
    },

    /* Events testifying a provider added a TLE for  particular Id */
    NewTLEEvent: async function (id) {
        try {
            return await contractws.getPastEvents("newTLE", {
                filter: {referenceId: id},
                fromBlock: 0,
                toBlock: 'latest'
            });
        } catch (e) {
            throw e;
        }
    },
};