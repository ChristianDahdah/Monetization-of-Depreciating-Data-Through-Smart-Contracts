// const readline = require('readline');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');


// function toBinary(input) {
//     let result = "";
//     for (let i = 0; i < input.length; i++) {
//         const bin = input[i].charCodeAt().toString(2);
//         result += Array(8 - bin.length + 1).join("0") + bin;
//     }
//     return result;
// }

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
// const web3ws = new Web3(new Web3.providers.WebsocketProvider('ws://192.168.33.115:8546'));


let ContractAddress = '0x42699A7612A82f1d9C36148af9C77354759b210b';
let abi = [{
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "uint256", "name": "referenceId", "type": "uint256"}, {
        "indexed": true,
        "internalType": "address",
        "name": "client",
        "type": "address"
    }, {"indexed": false, "internalType": "bytes32", "name": "encodedKeyHash", "type": "bytes32"}],
    "name": "encodedKeyHash",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "uint256", "name": "referenceId", "type": "uint256"}, {
        "indexed": true,
        "internalType": "address",
        "name": "client",
        "type": "address"
    }, {"indexed": false, "internalType": "bytes32", "name": "encryptedEncodedKey", "type": "bytes32"}],
    "name": "encryptedEncodedKeyEvent",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "uint256", "name": "referenceId", "type": "uint256"}, {
        "indexed": true,
        "internalType": "address",
        "name": "client",
        "type": "address"
    }, {"indexed": false, "internalType": "bytes32", "name": "keyDecoder", "type": "bytes32"}],
    "name": "keyDecoder",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "uint256", "name": "referenceId", "type": "uint256"}, {
        "indexed": true,
        "internalType": "address",
        "name": "client",
        "type": "address"
    }, {"indexed": false, "internalType": "uint256", "name": "fund", "type": "uint256"}, {
        "indexed": false,
        "internalType": "uint256",
        "name": "time",
        "type": "uint256"
    }, {"indexed": false, "internalType": "bytes32", "name": "publicKeyDH1", "type": "bytes32"}, {
        "indexed": false,
        "internalType": "bytes32",
        "name": "publicKeyDH2",
        "type": "bytes32"
    }, {"indexed": false, "internalType": "bytes32", "name": "publicKeyDH3", "type": "bytes32"}, {
        "indexed": false,
        "internalType": "bytes32",
        "name": "publicKeyDH4",
        "type": "bytes32"
    }],
    "name": "newClient",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "uint256", "name": "referenceId", "type": "uint256"}, {
        "indexed": true,
        "internalType": "address",
        "name": "provider",
        "type": "address"
    }, {"indexed": false, "internalType": "uint256", "name": "initialPrice", "type": "uint256"}, {
        "indexed": false,
        "internalType": "uint256",
        "name": "insuranceDeposit",
        "type": "uint256"
    }, {"indexed": false, "internalType": "uint64", "name": "minimumData", "type": "uint64"}, {
        "indexed": false,
        "internalType": "uint64",
        "name": "deployTime",
        "type": "uint64"
    }, {"indexed": false, "internalType": "uint64", "name": "endTime", "type": "uint64"}, {
        "indexed": false,
        "internalType": "uint8",
        "name": "depreciationType",
        "type": "uint8"
    }, {"indexed": false, "internalType": "string", "name": "description", "type": "string"}, {
        "indexed": false,
        "internalType": "bytes32",
        "name": "publicKeyDH1",
        "type": "bytes32"
    }, {"indexed": false, "internalType": "bytes32", "name": "publicKeyDH2", "type": "bytes32"}, {
        "indexed": false,
        "internalType": "bytes32",
        "name": "publicKeyDH3",
        "type": "bytes32"
    }, {"indexed": false, "internalType": "bytes32", "name": "publicKeyDH4", "type": "bytes32"}],
    "name": "newDataReference",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "internalType": "uint256",
        "name": "referenceId",
        "type": "uint256"
    }, {"indexed": false, "internalType": "string", "name": "spaceObject", "type": "string"}],
    "name": "newTLE",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "internalType": "uint256",
        "name": "referenceId",
        "type": "uint256"
    }, {"indexed": false, "internalType": "bytes32", "name": "referenceKey", "type": "bytes32"}],
    "name": "referenceKey",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "internalType": "uint256",
        "name": "_referenceId",
        "type": "uint256"
    }, {"indexed": false, "internalType": "uint256", "name": "funds", "type": "uint256"}],
    "name": "withdrawFundsEvent",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "uint256", "name": "referenceId", "type": "uint256"}, {
        "indexed": true,
        "internalType": "address",
        "name": "client",
        "type": "address"
    }, {"indexed": false, "internalType": "uint256", "name": "funds", "type": "uint256"}, {
        "indexed": false,
        "internalType": "uint256",
        "name": "time",
        "type": "uint256"
    }],
    "name": "withdrawRefund",
    "type": "event"
}, {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}, {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
    }],
    "name": "TLEs",
    "outputs": [{"internalType": "string", "name": "spaceObject", "type": "string"}, {
        "internalType": "bytes25",
        "name": "TLE1",
        "type": "bytes25"
    }, {"internalType": "bytes24", "name": "TLE2", "type": "bytes24"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "_referenceId", "type": "uint256"}, {
        "internalType": "bytes32",
        "name": "_publicKeyDH1",
        "type": "bytes32"
    }, {"internalType": "bytes32", "name": "_publicKeyDH2", "type": "bytes32"}, {
        "internalType": "bytes32",
        "name": "_publicKeyDH3",
        "type": "bytes32"
    }, {"internalType": "bytes32", "name": "_publicKeyDH4", "type": "bytes32"}],
    "name": "buyReference",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "_initialPrice", "type": "uint256"}, {
        "internalType": "uint64",
        "name": "_minimumData",
        "type": "uint64"
    }, {"internalType": "uint64", "name": "_referenceDuration", "type": "uint64"}, {
        "internalType": "uint8",
        "name": "_depreciationType",
        "type": "uint8"
    }, {"internalType": "string", "name": "_description", "type": "string"}, {
        "internalType": "bytes32",
        "name": "_publicKeyDH1",
        "type": "bytes32"
    }, {"internalType": "bytes32", "name": "_publicKeyDH2", "type": "bytes32"}, {
        "internalType": "bytes32",
        "name": "_publicKeyDH3",
        "type": "bytes32"
    }, {"internalType": "bytes32", "name": "_publicKeyDH4", "type": "bytes32"}],
    "name": "createDataReference",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "_referenceId", "type": "uint256"}],
    "name": "getClientDisputes",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "_referenceId", "type": "uint256"}],
    "name": "getClients",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "_referenceKey", "type": "uint256"}],
    "name": "getKeyDecoder",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "_referenceId", "type": "uint256"}],
    "name": "getNumberOfData",
    "outputs": [{"internalType": "uint128", "name": "numberOfData", "type": "uint128"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "_referenceId", "type": "uint256"}],
    "name": "getReferenceCurrentPrice",
    "outputs": [{"internalType": "uint256", "name": "price", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "_referenceId", "type": "uint256"}],
    "name": "getTLEs",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}, {
        "components": [{
            "internalType": "string",
            "name": "spaceObject",
            "type": "string"
        }, {"internalType": "bytes25", "name": "TLE1", "type": "bytes25"}, {
            "internalType": "bytes24",
            "name": "TLE2",
            "type": "bytes24"
        }], "internalType": "struct TLE_Contract.structTLE[]", "name": "", "type": "tuple[]"
    }],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "_referenceId", "type": "uint256"}],
    "name": "raiseDispute",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "_referenceId", "type": "uint256"}, {
        "internalType": "bytes32",
        "name": "_encodedKeyHash",
        "type": "bytes32"
    }], "name": "setEncodedHashedKey", "outputs": [], "stateMutability": "nonpayable", "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "_referenceId", "type": "uint256"}, {
        "internalType": "address",
        "name": "_client",
        "type": "address"
    }, {"internalType": "bytes32", "name": "_encryptedEncodedKey", "type": "bytes32"}],
    "name": "setEncryptedEncodedKey",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "_referenceId", "type": "uint256"}, {
        "internalType": "address",
        "name": "_client",
        "type": "address"
    }, {"internalType": "bytes32", "name": "_keyDecoder", "type": "bytes32"}],
    "name": "setKeyDecoder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "_referenceId", "type": "uint256"}, {
        "internalType": "bytes32",
        "name": "_referenceKey",
        "type": "bytes32"
    }], "name": "setReferenceKey", "outputs": [], "stateMutability": "nonpayable", "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "_referenceId", "type": "uint256"}, {
        "internalType": "string",
        "name": "_spaceObject",
        "type": "string"
    }, {"internalType": "bytes25", "name": "_TLE1", "type": "bytes25"}, {
        "internalType": "bytes24",
        "name": "_TLE2",
        "type": "bytes24"
    }], "name": "setTLE", "outputs": [], "stateMutability": "nonpayable", "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "_referenceId", "type": "uint256"}],
    "name": "withdrawFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}]
//TODO: current abi :Provider
const contract = new web3.eth.Contract(abi, ContractAddress); //TODO give correct address when available


module.exports = {
    createAndSendSignedTransaction: async function (prov, valueInEther, privateKey_notBuffered, addressFrom, addressTo) {
        // web3 initialization - must point to the HTTP JSON-RPC endpoint
        try {
            web3.transactionConfirmationBlocks = 1;
            const privateKey = new Buffer.from(privateKey_notBuffered, 'hex');
            const txnCount = await web3.eth.getTransactionCount(addressFrom, "pending");
            const rawTx = {
                nonce: web3.utils.numberToHex(txnCount),
                gasPrice: web3.utils.numberToHex(1500),
                gasLimit: web3.utils.numberToHex(4700000),
                to: '0x' + addressTo,
                value: web3.utils.numberToHex(web3.utils.toWei(valueInEther.toString(), 'ether'))
            };
            const tx = new Tx(rawTx);
            tx.sign(privateKey);
            const serializedTx = tx.serialize();
            const rawTxHex = '0x' + serializedTx.toString('hex');
            return web3.eth.sendSignedTransaction(rawTxHex);
        } catch (e) {
            throw e;
        }
    },

    BuyReference: async function (account, referenceId, pubKey1, pubKey2, pubKey3, pubKey4, currentPrice) {
        // web3.transactionConfirmationBlocks = 1;
        try {
            let pubKey_bin1 = web3.utils.bytesToHex(pubKey1);
            let pubKey_bin2 = web3.utils.bytesToHex(pubKey2);
            let pubKey_bin3 = web3.utils.bytesToHex(pubKey3);
            let pubKey_bin4 = web3.utils.bytesToHex(pubKey4);
            const privateKey = new Buffer.from(account.privateKey.substring(2), 'hex');
            const txnCount = await web3.eth.getTransactionCount(account.address, "pending");
            const dataref = contract.methods.buyReference(referenceId, pubKey_bin1, pubKey_bin2, pubKey_bin3, pubKey_bin4).encodeABI();
            const rawTx = {
                nonce: web3.utils.numberToHex(txnCount),
                gasPrice: web3.utils.numberToHex(1500),
                gasLimit: web3.utils.numberToHex(4700000),
                to: ContractAddress,
                value: parseInt(currentPrice, 10),
                data: dataref
            };
            const tx = new Tx(rawTx);
            tx.sign(privateKey);
            const serializedTx = tx.serialize();
            const rawTxHex = '0x' + serializedTx.toString('hex');
            let res = await web3.eth.sendSignedTransaction(rawTxHex)
            return res;
        } catch (e) {
            throw e;
        }
    },

    SellReference: async function (account, pubKey1, pubKey2, pubKey3, pubKey4, price, duration, description, minData, depreciationType, insuranceDeposit) {
        try {

            const pubKey_bin1 = web3.utils.bytesToHex(pubKey1);
            const pubKey_bin2 = web3.utils.bytesToHex(pubKey2);
            const pubKey_bin3 = web3.utils.bytesToHex(pubKey3);
            const pubKey_bin4 = web3.utils.bytesToHex(pubKey4);
            const privateKey = new Buffer.from(account.privateKey.substring(2), 'hex');
            const txnCount = await web3.eth.getTransactionCount(account.address, "pending");
            const dataref = contract.methods.createDataReference(
                price, minData, duration, depreciationType, description,
                pubKey_bin1, pubKey_bin2, pubKey_bin3, pubKey_bin4
            ).encodeABI();
            const rawTx = {
                nonce: web3.utils.numberToHex(txnCount),
                gasPrice: web3.utils.numberToHex(1500),
                gasLimit: web3.utils.numberToHex(4700000),
                to: ContractAddress,
                data: dataref,
                value: parseInt(insuranceDeposit, 10),
            };
            const tx = new Tx(rawTx);
            tx.sign(privateKey);
            const serializedTx = tx.serialize();
            const rawTxHex = '0x' + serializedTx.toString('hex');
            return await web3.eth.sendSignedTransaction(rawTxHex)

        } catch (e) {
            throw e;
        }
    },

    /*Function to view the clients of a certain reference*/
    GetClients: async function (account, id) {
        try {
            return await contract.methods.getClients(id).call({from: account.address});
        } catch (e) {
            throw e;
        }
    },

    /*Function to view the clients who opted out of a certain reference*/
    GetClientsDisputes: async function (account, id) {
        try {
            return await contract.methods.getClientDisputes(id).call({from: account.address});
        } catch (e) {
            throw e;
        }
    },

    /*Function to get the current price of a certain reference*/
    GetCurrentPrice: async function (account, id) {
        try {
            return await contract.methods.getReferenceCurrentPrice(id).call({from: account.address});
        } catch (e) {
            throw e;
        }
    },

    /*Send K2 xor K xor K3 to the correct client (via the contract) from the provider*/
    sendEncryptedEncodedKey: async function (account, id, client_address, encryptedEncodedKey) {
        try {
            let bin = web3.utils.bytesToHex(encryptedEncodedKey);
            const privateKey = new Buffer.from(account.privateKey.substring(2), 'hex');
            const txnCount = await web3.eth.getTransactionCount(account.address, "pending");
            const dataref = contract.methods.setEncryptedEncodedKey(id, client_address, bin).encodeABI();

            const rawTx = {
                nonce: web3.utils.numberToHex(txnCount),
                gasPrice: web3.utils.numberToHex(1500),
                gasLimit: web3.utils.numberToHex(4700000),
                to: ContractAddress,
                data: dataref
            };
            const tx = new Tx(rawTx);
            tx.sign(privateKey);
            const serializedTx = tx.serialize();
            const rawTxHex = '0x' + serializedTx.toString('hex');
            let res = await web3.eth.sendSignedTransaction(rawTxHex)
            return res;
        } catch (e) {
            throw e;
        }
    },

    /*Send correct K2 to the correct client (via the contract) from the provider*/
    sendDecoderKey: async function (account, id, client_address, Key) {
        try {
            let bin = web3.utils.bytesToHex(Key);
            const privateKey = new Buffer.from(account.privateKey.substring(2), 'hex');
            const txnCount = await web3.eth.getTransactionCount(account.address, "pending");
            const dataref = contract.methods.setKeyDecoder(id, client_address, bin).encodeABI();

            const rawTx = {
                nonce: web3.utils.numberToHex(txnCount),
                gasPrice: web3.utils.numberToHex(1500),
                gasLimit: web3.utils.numberToHex(4700000),
                to: ContractAddress,
                data: dataref
            };
            const tx = new Tx(rawTx);
            tx.sign(privateKey);
            const serializedTx = tx.serialize();
            const rawTxHex = '0x' + serializedTx.toString('hex');
            let res = await web3.eth.sendSignedTransaction(rawTxHex)
            return res;
        } catch (e) {
            throw e;
        }
    },

    /*Send the hash to the provider (via the contract)*/
    SendHashToProvider: async function (account, id, Hash) {
        try {
            const privateKey = new Buffer.from(account.privateKey.substring(2), 'hex');
            const txnCount = await web3.eth.getTransactionCount(account.address, "pending");
            const dataref = contract.methods.setEncodedHashedKey(id, Hash).encodeABI();
            const rawTx = {
                nonce: web3.utils.numberToHex(txnCount),
                gasPrice: web3.utils.numberToHex(1500),
                gasLimit: web3.utils.numberToHex(4700000),
                to: ContractAddress,
                data: dataref
            };
            const tx = new Tx(rawTx);
            tx.sign(privateKey);
            const serializedTx = tx.serialize();
            const rawTxHex = '0x' + serializedTx.toString('hex');
            let res = await web3.eth.sendSignedTransaction(rawTxHex)
            return res;
        } catch (e) {
            throw e;
        }
    },
    /*For a client to raise a dispute (or withdraw his money if still possible)*/
    RaiseDispute: async function (account, id) {
        try {
            const privateKey = new Buffer.from(account.privateKey.substring(2), 'hex');
            const txnCount = await web3.eth.getTransactionCount(account.address, "pending");
            const dataref = contract.methods.raiseDispute(id).encodeABI();
            const rawTx = {
                nonce: web3.utils.numberToHex(txnCount),
                gasPrice: web3.utils.numberToHex(1500),
                gasLimit: web3.utils.numberToHex(4700000),
                to: ContractAddress,
                data: dataref
            };
            const tx = new Tx(rawTx);
            tx.sign(privateKey);
            const serializedTx = tx.serialize();
            const rawTxHex = '0x' + serializedTx.toString('hex');
            let res = await web3.eth.sendSignedTransaction(rawTxHex)
            return res;
        } catch (e) {
            throw e;
        }
    },

    /*For a provider to send the Reference Key K of a certain reference*/
    sendRefKey: async function (account, id, refKey) {
        try {
            let bin = web3.utils.bytesToHex(refKey);
            const privateKey = new Buffer.from(account.privateKey.substring(2), 'hex');
            const txnCount = await web3.eth.getTransactionCount(account.address, "pending");
            const dataref = contract.methods.setReferenceKey(id, bin).encodeABI();
            const rawTx = {
                nonce: web3.utils.numberToHex(txnCount),
                gasPrice: web3.utils.numberToHex(1500),
                gasLimit: web3.utils.numberToHex(4700000),
                to: ContractAddress,
                data: dataref
            };
            const tx = new Tx(rawTx);
            tx.sign(privateKey);
            const serializedTx = tx.serialize();
            const rawTxHex = '0x' + serializedTx.toString('hex');
            let res = await web3.eth.sendSignedTransaction(rawTxHex)
            return res;
        } catch (e) {
            throw e;
        }
    },
    /*For a provider to  withdraw funds*/
    withdrawFundsProvider: async function (id, account) {
        try {
            const privateKey = new Buffer.from(account.privateKey.substring(2), 'hex');
            const txnCount = await web3.eth.getTransactionCount(account.address, "pending");
            const dataref = contract.methods.withdrawFunds(id).encodeABI();
            const rawTx = {
                nonce: web3.utils.numberToHex(txnCount),
                gasPrice: web3.utils.numberToHex(1500),
                gasLimit: web3.utils.numberToHex(4700000),
                to: ContractAddress,
                data: dataref
            };
            const tx = new Tx(rawTx);
            tx.sign(privateKey);
            const serializedTx = tx.serialize();
            const rawTxHex = '0x' + serializedTx.toString('hex');
            let res = await web3.eth.sendSignedTransaction(rawTxHex)
            return res;
        } catch (e) {
            throw e;
        }
    },


    /************************** TLE SPECIFIC FUNCTIONS **************************/

    /*For a provider to  add a TLE to a certain reference */
    addTLE: async function (account, id, spaceObject, BuffTLE) {
        try {
            let bin25 = web3.utils.bytesToHex(BuffTLE.slice(0, 25));
            let bin24 = web3.utils.bytesToHex(BuffTLE.slice(25, 49));

            const privateKey = new Buffer.from(account.privateKey.substring(2), 'hex');
            const txnCount = await web3.eth.getTransactionCount(account.address, "pending")
            const dataref = contract.methods.setTLE(id, spaceObject, bin25, bin24).encodeABI();
            const rawTx = {
                nonce: web3.utils.numberToHex(txnCount),
                gasPrice: web3.utils.numberToHex(1500),
                gasLimit: web3.utils.numberToHex(4700000),
                to: ContractAddress,
                data: dataref
            };
            const tx = new Tx(rawTx);
            tx.sign(privateKey);
            const serializedTx = tx.serialize();
            const rawTxHex = '0x' + serializedTx.toString('hex');
            let funds = await web3.eth.sendSignedTransaction(rawTxHex);
            return funds;
        } catch (e) {
            throw e;
        }
    },

    /*Function to view the TLEs set for a certain reference*/
    GetTLEs: async function (account, id) {
        try {
            let TLEs = await contract.methods.getTLEs(id).call({from: account.address});
            return TLEs;
        } catch (e) {
            throw e;
        }
    },
};
