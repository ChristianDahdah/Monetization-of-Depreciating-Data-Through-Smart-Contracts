const Web3 = require('web3');
const provider = 'http://192.168.33.115:8545';
const web3 = new Web3(new Web3.providers.HttpProvider(provider));

const Admin = require('web3-eth-admin').Admin;
const options = {
    defaultAccount: '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73',
    defaultBlock: 'latest',
    defaultGas: 1,
    defaultGasPrice: 0,
    transactionBlockTimeout: 50,
    transactionConfirmationBlocks: 24,
    transactionPollingTimeout: 480,
};
const admin = new Admin(provider, null, options);

const transactions = require('./SignedTransactionModule');
const crypto = require('./CryptoModule');
const readwrite = require('./ReadWriteModule');
const database = require('./database.js');
const EventsModule = require('./EventsModule');
const TLE = require('./TLE');


const Diffie = database.newDiffieSchema();

let prime;
(async () => {
    prime = await readwrite.ReadPrimeAndGen(__dirname + '/../Database/PrimeAndGenerator.txt');
})();

/********************************
 * Variables
 ********************************/
let nodelistIDS = [];
let blockslistNUMBERS = [];
// TODO let the user change this ?
const nbBlocksToPrint = 5;

/********************************
 * Accounts
 ********************************/

async function getBalance(addressToCheck) {
    try {
        let bal = await web3.eth.getBalance(addressToCheck);
        bal = web3.utils.fromWei(bal, 'ether');
        return bal;
    } catch (err) {
        return err;
    }

}

async function createNewAccount() {
    return web3.eth.accounts.create();
}

async function getAccount(privateKey) {
    try {
        return web3.eth.accounts.privateKeyToAccount(privateKey);
    } catch (err) {
        throw err;
    }
}

/********************************
 * Nodes
 ********************************/
setInterval(refreshNodesList, 2000);

async function refreshNodesList() {
    try {
        let PeerCount = await web3.eth.net.getPeerCount();
        let peers = await admin.getPeers();
        nodelistIDS = [];
        for (let i = 0; i < PeerCount; i++) {
            nodelistIDS.push(peers[i].id);
        }
    } catch (err) {
        console.error(err);
    }
}

/********************************
 * Create a transaction
 ********************************/

async function createTransaction(jsonInfo) {
    jsonInfo = JSON.parse(jsonInfo);
    //,0.001,'8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63','0xfe3b557e8fb62b89f4916b721be55ceb828dbd73','0xf17f52151EbEF6C7334FAD080c5704D77216b732');
    return await transactions.createAndSendSignedTransaction(provider, jsonInfo["amount"], jsonInfo["privateKey"], jsonInfo["sender"], jsonInfo["receiver"]);
}

/********************************
 * Blocks
 ********************************/

// Update of the list of last blocks numbers
setInterval(refreshBlocksNUMBERSList, 2000);

function callbackBlocksNUMBERSlist() {
    if (nbBlocksToPrint === blockslistNUMBERS.length) {
        blockslistNUMBERS.sort();
        blockslistNUMBERS.reverse();
    }
}

function refreshBlocksNUMBERSList() {
    blockslistNUMBERS = [];
    web3.eth.getBlockNumber().then((n) => {
        for (let i = n - nbBlocksToPrint + 1; i <= n; i++) {
            web3.eth.getBlock(i).then((json) => {
                blockslistNUMBERS.push(json["number"]);
                callbackBlocksNUMBERSlist();
            });
        }
    })
}

async function getBlockInfo(blocknumber) {
    return await web3.eth.getBlock(blocknumber);
}

/********************************
 * Sell new item
 ********************************/

async function sellReference(jsonInfo, account) {
    jsonInfo = JSON.parse(jsonInfo);
    const initialPrice = jsonInfo["initialPrice"];
    const durationDays = jsonInfo["durationDays"];
    const durationHours = jsonInfo["durationHours"];
    const durationMinutes = jsonInfo["durationMinutes"];
    const description = jsonInfo["description"];
    const minData = jsonInfo["minData"];
    const depreciationType = jsonInfo["depreciationType"];
    const deposit = jsonInfo["deposit"];

    const durationInSecs = durationDays * 86400 + durationHours * 3600 + durationMinutes * 60;
    const keys = crypto.DiffieHellmanGenerate(prime);
    /* Updating object to write and save */
    Diffie.PrivDH = keys[0];
    Diffie.PubDH = keys[1];

    let K = crypto.RandomBytes(32); //Reference key with which data is encrypted. TODO use this on TLE

    let priceInWei = web3.utils.toWei(initialPrice, 'ether');

    let insuranceInWei = web3.utils.toWei(deposit, 'ether');

    /*Send transaction the get the ref_id for the database*/
    try {
        const receipt = await transactions.SellReference(account, Diffie.PubDH.slice(0, 32), Diffie.PubDH.slice(32, 64), Diffie.PubDH.slice(64, 96), Diffie.PubDH.slice(96, 128), priceInWei, durationInSecs, description, minData, depreciationType, insuranceInWei);
        let blockNumber = receipt.blockNumber;
        let event = await EventsModule.GetYourRef(account.address, blockNumber);
        let id = event[0].returnValues.referenceId;
        Diffie.refId = id;
        receipt.id = id;
        await readwrite.Write(__dirname + '/../Database/DH' + id.toString() + '_' + account.address.toString() + '.txt', JSON.stringify(Diffie));
        await readwrite.WriteAsSellerInfo(__dirname + '/../Database/SellerInfo' + id.toString() + '_' + account.address.toString() + '.txt', K);
        return receipt;
    } catch (err) {
        throw err;
    }
}

/*Function to get Completed purchases*/
async function getCompletedPurchases(account) {
    try {
        const IdsBoughtEvents = await EventsModule.GetBoughtRefs(account);
        let IdsBoughtList = await EventsModule.EventsToIds(IdsBoughtEvents);

        let IdsNoMoreActionsEvents = await EventsModule.WithdrawFundsEventGeneral();
        let IdsNoMoreActionsList = await EventsModule.EventsToIds(IdsNoMoreActionsEvents)

        let IdsList = await EventsModule.ComputeInter(IdsNoMoreActionsList, IdsBoughtList)
        let Ids = await EventsModule.GetRefs(IdsList);
        return Ids;
    } catch (err) {
        throw err;
    }
}


/********************************
 * Buy an item
 ********************************/

async function buyReference(id, account) {
    const keys = crypto.DiffieHellmanGenerate(prime);
    /* Updating object to write and save */
    Diffie.PrivDH = keys[0];
    Diffie.PubDH = keys[1];
    Diffie.refId = id + 1;
    try {
        let currentPrice = await transactions.GetCurrentPrice(account, id);
        await transactions.BuyReference(account, id, Diffie.PubDH.slice(0, 32), Diffie.PubDH.slice(32, 64), Diffie.PubDH.slice(64, 96), Diffie.PubDH.slice(96, 128), currentPrice);
        await readwrite.Write(__dirname + '/../Database/DH' + id.toString() + '_' + account.address.toString() + '.txt', JSON.stringify(Diffie));
        return (currentPrice);
    } catch (e) {
        throw e;
    }
}

/*Function to get refs for sale currently valid*/
async function getForSaleRefs() {
    try {
        let availableRefs = await EventsModule.GetAvailableRefs();

        let RefsNotExpired = await EventsModule.FilterOnTime(availableRefs); // Check which ones are expired

        let RefsNotExpiredIdList = await EventsModule.EventsToIds(RefsNotExpired); // Transformed in a list of ids

        let BecameFreeEvents = await EventsModule.ReferenceKeysSent(); // Refs for which the reference key is already public
        let BecameFreeListIds = await EventsModule.EventsToIds(BecameFreeEvents);  // Transformed in a list of ids

        let BuyableRefIds = await EventsModule.ComputeLeft(RefsNotExpiredIdList,BecameFreeListIds);

        let BuyableRefsEvents = await EventsModule.GetRefs(BuyableRefIds); // Back to a list of the correct events (we had a list of id's before)
        return (BuyableRefsEvents);
    } catch (e) {
        throw e;
    }
}

/*Get the current price of a certain reference*/
async function getCurrentPrice(account, id) {
    try {
        let currentPrice = await transactions.GetCurrentPrice(account, id);
        currentPrice = web3.utils.fromWei(currentPrice.toString(), "ether");
        // the result is in ether
        return currentPrice;
    } catch (e) {
        throw e;
    }
}

/*Computes information for Ongoing purchases view*/
async function ongoingPurchases(account) {
    try {
        let Ids = await EventsModule.GetBoughtRefs(account); // Get the Refs which were bought
        let WithdrawnIds = await EventsModule.WithdrawFundsEventGeneral(); // References for which funds have been withdrawn

        let ongoingIds = await EventsModule.ComputeLeft(EventsModule.EventsToIds(Ids), EventsModule.EventsToIds(WithdrawnIds)); // Only the ongoing one's

        let ongoingIdsEvents = await EventsModule.GetRefs(ongoingIds); // Transform back to events
        return ongoingIdsEvents;
    } catch (e) {
        throw e;
    }
}

/********************************
 * Manage an Id
 ********************************/

/*Function to generate details for management of a certain Id on the provider side*/
async function manageIdSeller(id, account) {
    try {
        let reference = await EventsModule.GetRef(id); // We fetch the reference

        reference.initialPrice = web3.utils.fromWei((reference.initialPrice).toString(), "ether");
        reference.currentPrice = await getCurrentPrice(account, id);

        const clients = await transactions.GetClients(account, id);
        let total_clients = clients.length;

        let ClientsWhoReceivedHashes = await EventsModule.GetEncryptedKeysSent(id);
        let num_clients_step1 = total_clients - ClientsWhoReceivedHashes.length; // Number of clients we need to send K^K2^K3 to

        let KeysSent = await EventsModule.GetKeysSent(id);
        let ReceivedHashes = await EventsModule.GetClientsWhoSentHashes(id);

        let num_clients_step2 = ReceivedHashes.length - KeysSent.length; // Number of clients we need to verify the hashes of and eventually send K2

        let KeyEvent = await EventsModule.ReferenceKeySent(id); // To check if we already set the final reference key

        let Key = 0;
        if (KeyEvent.length > 0) {
            let buffer = Buffer.from(web3.utils.hexToBytes(KeyEvent[0].returnValues[1]));
            Key = buffer.toString('hex'); // Eventually load the reference key we sent
        }

        // To compute the time left
        let d = new Date();
        let n = d.getTime() / 1000;
        let timeLeft = reference.endTime - n;
        if (timeLeft < 0) {
            timeLeft = 0;
        }
        let TLESAddedEvents = await EventsModule.NewTLEEvent(id)
        let numberTLES = TLESAddedEvents.length;
        let minNumberTLE = reference.minimumData;
        return [reference, total_clients, num_clients_step1, num_clients_step2, Key, timeLeft, numberTLES, minNumberTLE];

    } catch (e) {
        throw e;
    }
}

/*Computes information for managing an Id Buyer side*/
async function manageIdBuyer(id, account) {
    try {
        let reference = await EventsModule.GetRef(id);

        let eventEncryptedReceived = await EventsModule.GetEncryptedKeySentSpecific(id, account.address); //To check if we received the encrypted encoded key
        let eventDecoderReceived = await EventsModule.GetKeySentSpecific(id, account.address); //To check if we received the decoder KEy
        let eventHashSent = await EventsModule.GetHashFromClient(account.address, id); //To check if we sent our hash

        // !! allows to convert to boolean
        let decoderReceived = !!eventDecoderReceived.length;
        let encryptedEncodedReceived = !!eventEncryptedReceived.length;
        let hashSent = !!eventHashSent.length;

        let key = 0;
        let keyRefEvent = await EventsModule.ReferenceKeySent(id);
        if (keyRefEvent.length > 0) {
            const buffer = Buffer.from(web3.utils.hexToBytes(keyRefEvent[0].returnValues.referenceKey));
            key = buffer.toString('hex');
        }
        return [reference, hashSent, encryptedEncodedReceived, decoderReceived, key];
    } catch (e) {
        throw e;
    }
}

/*Function to get all our clients*/
async function getClients(account, id) {
    try {
        return await transactions.GetClients(account, id);
    } catch (e) {
        throw e;
    }

}

/*Function to have access to "Free data" once it is availabe*/
async function getDeprecated() {
    try {
        let IdsEvents = await EventsModule.ReferenceKeysSent(); // Get the events for this data (that anyone can read)
        let IdsList = await EventsModule.EventsToIds(IdsEvents); // Transforming into list of Ids, to later have more info

        let Ids = await EventsModule.GetRefs(IdsList); //Now getting the real reference objects
        return await Ids;
    } catch (e) {
        throw e;
    }
}

/*Function to send the encrypted encoded keys to our clients*/
async function sendEncryptedEncodedKey(id, Account) {
    try {
        const all_clients = await transactions.GetClients(Account, id);

        let ClientsWhoReceivedK2 = await EventsModule.GetEncryptedKeysSent(id); // This is a list of events
        let Address_ListClientsWhoReceivedK2 = await EventsModule.EventsToAddresses(ClientsWhoReceivedK2); // So I compute a  need a list of addresses

        let ClientsDisputes = await transactions.GetClientsDisputes(Account, id) // Get the clients who retrieved their money so we don't send them anything useless

        let ClientsToDo_bis = await EventsModule.ComputeLeft(all_clients, Address_ListClientsWhoReceivedK2); // Then i find who is left...
        let ClientsToDo = await EventsModule.ComputeLeft(ClientsToDo_bis, ClientsDisputes); // by getting the complementary of these 3 lists of addresses

        let myDH_obj = await readwrite.ReadAsObjectDH(__dirname + '/../Database/DH' + id.toString() + '_' + Account.address.toString() + '.txt');

        let K = await readwrite.Read_K(__dirname + '/../Database/SellerInfo' + id.toString() + '_' + Account.address.toString() + '.txt');
        // Now we have to: Generate a K2 and store it for each client and send the hash of K xor K2

        let done = 0; // To check how many were successful at the end...
        for (let i = 0; i < ClientsToDo.length; i++) {
            let client_address = ClientsToDo[i];

            let Pub_Client = await EventsModule.GetPubDiffieClient(client_address, id);
            let secret = crypto.DiffieHellmanComputeSecret(prime, myDH_obj.PubDH, myDH_obj.PrivDH, Pub_Client);
            let K2 = crypto.RandomBytes(32);

            let toEncrypt = crypto.OTP(K, K2);

            let toSend = crypto.OTP(secret, toEncrypt);
            let hashed = crypto.Hash(toEncrypt);


            await readwrite.WriteAsRefSeller(__dirname + '/../Database/RefSeller' + id.toString() + '_' + ClientsToDo[i] + '.txt', hashed, K2);

            try {
                await transactions.sendEncryptedEncodedKey(Account, id, client_address, toSend);
                done += 1;
            } catch (e) {
                throw e;
            }
        }
        return [ClientsToDo.length, done];
    } catch (e) {
        throw e;
    }

}

async function sendEncryptedEncodedKeyMalicious(id, Account) {
    const all_clients = await transactions.GetClients(Account, id);
    let ClientsWhoReceivedK2 = await EventsModule.GetEncryptedKeysSent(id); // This is a list of events
    let Address_ListClientsWhoReceivedK2 = await EventsModule.EventsToAddresses(ClientsWhoReceivedK2); // So I compute a  need a list of addresses
    let ClientsDisputes = await transactions.GetClientsDisputes(Account, id) // Get the clients who retrieved their money so we don't send them anything useless

    let ClientsToDobis = await EventsModule.ComputeLeft(all_clients, Address_ListClientsWhoReceivedK2); // Then i find who is left...
    let ClientsToDo = await EventsModule.ComputeLeft(ClientsToDobis, ClientsDisputes); // by taking the complementary of these 3 lists

    let myDH_obj = await readwrite.ReadAsObjectDH(__dirname + '/../Database/DH' + id.toString() + '_' + Account.address.toString() + '.txt');

    // Now We have to: Generate a K2 and store it for eache client and send the hash of K xor K2

    let done = 0; // To check how many were successful at the end...
    for (let i = 0; i < ClientsToDo.length; i++) {
        let client_address = ClientsToDo[i];

        let Pub_Client = await EventsModule.GetPubDiffieClient(client_address, id);
        let secret = crypto.DiffieHellmanComputeSecret(prime, myDH_obj.PubDH, myDH_obj.PrivDH, Pub_Client);
        let K2 = crypto.RandomBytes(32);

        let K_Malicious = crypto.RandomBytes(32);

        let toEncrypt = crypto.OTP(K_Malicious, K2);

        let toSend = crypto.OTP(secret, toEncrypt);
        let hashed = crypto.Hash(toEncrypt);

        await readwrite.WriteAsRefSeller(__dirname + '/../Database/RefSeller' + id.toString() + '_' + ClientsToDo[i] + '.txt', hashed, K2);

        let receipt = await transactions.sendEncryptedEncodedKey(Account, id, client_address, toSend);
        if (receipt) {
            done += 1;
        }
    }
    return [ClientsToDo.length, done];
}

/*Function to handle sending the appropriate K2 to every client which responded with a correct hash*/
async function sendDecoderKey(id, Account) {
    try {
        let ClientsWhoSentHashes = await EventsModule.GetClientsWhoSentHashes(id); // This is a list of events corresponding to clients who sent me a hash
        let ClientsReceivedK2 = await EventsModule.GetKeysSent(id); // This is a list of events corresponding to the clients I already answered concerning their hashes
        let Address_ListClientsWhoSentHashes = await EventsModule.EventsToAddresses(ClientsWhoSentHashes);  // Transformed into a list of addresses
        let Address_ListClientsWhoReceivedK2 = await EventsModule.EventsToAddresses(ClientsReceivedK2);  // Transformed into a list of addresses
        let ClientsToDo = await EventsModule.ComputeLeft(Address_ListClientsWhoSentHashes, Address_ListClientsWhoReceivedK2); // Then i find who is left...

        // Now We have to: Verify each hash received with the ones we had saved

        let done = 0; // To check how many were successful at the end...
        for (let i = 0; i < ClientsToDo.length; i++) {
            let myRef_obj = await readwrite.ReadAsObjectRefSeller(__dirname + '/../Database/RefSeller' + id.toString() + '_' + ClientsToDo[i] + '.txt');

            let client_address = ClientsToDo[i];

            let correctHash = myRef_obj.hash;

            let eventReceivedHash = await EventsModule.GetHashFromClient(client_address, id);
            let receivedHash = eventReceivedHash[0].returnValues.encodedKeyHash;


            if (correctHash === receivedHash) {
                let receipt = await transactions.sendDecoderKey(Account, id, client_address, myRef_obj.K2);
                if (receipt) {
                    done += 1;
                }
            }
        }
        return [ClientsToDo.length, done];
    } catch (e) {
        throw e;
    }

}

/*Malicious Version*/
async function sendDecoderKeyMalicious(id, Account) {

    let ClientsWhoSentHashes = await EventsModule.GetClientsWhoSentHashes(id); // This is a list of events corresponding to clients who sent me a hash
    let ClientsReceivedK2 = await EventsModule.GetKeysSent(id); // This is a list of events corresponding to the clients I already answered concerning their hashes
    let Address_ListClientsWhoSentHashes = await EventsModule.EventsToAddresses(ClientsWhoSentHashes);  // Transformed into a list of addresses
    let Address_ListClientsWhoReceivedK2 = await EventsModule.EventsToAddresses(ClientsReceivedK2);  // Transformed into a list of addresses
    let ClientsToDo = await EventsModule.ComputeLeft(Address_ListClientsWhoSentHashes, Address_ListClientsWhoReceivedK2); // Then i find who is left...

    // Now we have to: Verify each hash received with the ones we had saved

    let done = 0; // To check how many were successful at the end...
    for (let i = 0; i < ClientsToDo.length; i++) {
        let myRef_obj = await readwrite.ReadAsObjectRefSeller(__dirname + '/../Database/RefSeller' + id.toString() + '_' + ClientsToDo[i] + '.txt');

        let client_address = ClientsToDo[i];

        let correctHash = myRef_obj.hash;

        let eventReceivedHash = await EventsModule.GetHashFromClient(client_address, id);
        let receivedHash = eventReceivedHash[0].returnValues.encodedKeyHash;

        let K_Malicious = crypto.RandomBytes(32);

        if (correctHash === receivedHash) {
            let receipt = await transactions.sendDecoderKey(Account, id, client_address, K_Malicious);
            if (receipt) {
                done += 1;
            }
        }
    }
    return [ClientsToDo.length, done];
}

/*Function for the client to send the hash of K xor K2 to the provider*/
async function sendClientHash(id, Account) {
    try {
        let reference = await EventsModule.GetRef(id);

        let myDH_obj = await readwrite.ReadAsObjectDH(__dirname + '/../Database/DH' + id.toString() + '_' + Account.address.toString() + '.txt'); //Loading my DH keys from the database
        let seller_address = await EventsModule.EventsToAddresses(reference); //getting the seller's address neeeded to get his public key
        let Pub_Seller = await EventsModule.GetPubDiffieSeller(seller_address[0], id); // now getting the sellers public DH key
        let secret = crypto.DiffieHellmanComputeSecret(prime, myDH_obj.PubDH, myDH_obj.PrivDH, Pub_Seller); // we now have the diffie-Hellman secret key..


        let encrypted_event = await EventsModule.GetEncryptedKeySentSpecific(id, Account.address); // Get the K xor K2 xor K3 the provider sent me
        let encrypted = Buffer.from(web3.utils.hexToBytes(encrypted_event[0].returnValues.encryptedEncodedKey));

        let decryptedToBeHashed = crypto.OTP(secret, encrypted);
        let HashTobeSent = crypto.Hash(decryptedToBeHashed);

        await readwrite.WriteAsRefBuyer(__dirname + '/../Database/RefBuyer' + id.toString() + '_' + Account.address + '.txt', decryptedToBeHashed);
        let receipt = transactions.SendHashToProvider(Account, id, HashTobeSent);
        // Now we can do the OTP

        // These lines are for the old server only
        let done = 0; // value to verify later that everything went correctly
        if (receipt) {
            done = 1;
        }
        return done;
    } catch (e) {
        throw e;
    }
}

/*Function for the client to send a fake hash of K xor K2 to the provider*/
async function sendClientHashMalicious(id, Account) {
    try {
        let HashTobeSent = crypto.Hash((new Buffer.from("fakeClientHash")));

        let done = 0; // value to verify later that everything went correctly
        let receipt = transactions.SendHashToProvider(Account, id, HashTobeSent);
        // Now we can do the OTP

        if (receipt) {
            done = 1;
        }
        return done;
    } catch (e) {
        throw e;
    }

}

/*Function for the client to receive K2, compute K and save it*/
async function computeK(id, Account) {
    try {
        let RefBuyer = await readwrite.ReadAsObjectRefClient(__dirname + '/../Database/RefBuyer' + id.toString() + '_' + Account.address + '.txt');
        let K2_event = await EventsModule.GetClientDecoder(id, Account.address);

        // The actual value
        RefBuyer.K2 = Buffer.from(web3.utils.hexToBytes(K2_event[0].returnValues.keyDecoder));
        await readwrite.WriteAsRefBuyer(__dirname + '/../Database/RefBuyer' + id.toString() + '_' + Account.address + '.txt', RefBuyer.KxorK2, RefBuyer.K2);
        let K = crypto.OTP(RefBuyer.KxorK2, RefBuyer.K2);
        K = K.toString('hex');
        return K;
    } catch (e) {
        throw e;
    }
}

/*Computes information for managing an Id Buyer side*/
async function manageSales(account) {
    try {
        let Ids = await EventsModule.GetSoldRefs(account);

        let IdsFinished = await EventsModule.WithdrawFundsEventGeneral() // Ids for which funds have been withdrawn

        let IdsToShow_id = await EventsModule.ComputeLeft(EventsModule.EventsToIds(Ids), EventsModule.EventsToIds(IdsFinished))

        let IdsToShowEventForm = await EventsModule.GetRefs(IdsToShow_id);

        return IdsToShowEventForm;
    } catch (e) {
        throw e;
    }
}

/*Function to Check if it is possible to raise a dispute, or to retrieve your money*/
async function disputeInfoClient(id, Account) {
    try {
        let encoderEvent = await EventsModule.GetKeySentSpecific(id, Account.address);
        let buyEvent = await EventsModule.GetBoughtRefSpecific(id, Account.address);
        let disputeEvent = await EventsModule.GetDispute(Account.address, id); // Check if already disputed

        let alreadyDisputed = !!(disputeEvent.length);
        let alreadyEncoded = !!(encoderEvent.length);
        let possibleRefund = web3.utils.fromWei(buyEvent[0].returnValues.fund, 'ether');

        return [alreadyEncoded, possibleRefund, alreadyDisputed];
    } catch (e) {
        throw e;
    }

}

/*Function to raise a dispute, or to retrieve your money*/
async function dispute(id, Account) {
    try {
        let funds = 0;
        let receipt = await transactions.RaiseDispute(Account, id);
        if (receipt) {
            let disputeEvent = await EventsModule.GetDispute(Account.address, id);

            if (disputeEvent.length > 0) {
                funds = web3.utils.fromWei(disputeEvent[0].returnValues.funds, 'ether');
            }
        }
        return funds;
    } catch (e) {
        throw e;
    }

}

/*For a provider to release the reference Key*/
async function sendReferenceKey(id, Account) {
    let refKey = await readwrite.Read_K(__dirname + '/../Database/SellerInfo' + id.toString() + '_' + Account.address.toString() + '.txt');

    let receipt = await transactions.sendRefKey(Account, id, refKey);

    return [receipt, refKey];
}

/*For a provider to release the reference Key*/
async function sendReferenceKeyMalicious(id, Account) {
    let refKeyMalicious = crypto.RandomBytes(7);

    let receipt = await transactions.sendRefKey(Account, id, refKeyMalicious);

    return [receipt, refKeyMalicious];
}

/*Function to to raise a dispute, or to retrieve your money*/
async function withdrawFundsProvider(id, Account) {
    try {
        let receipt = await transactions.withdrawFundsProvider(id, Account);
        let funds = 0;
        let withdrawEvent = await EventsModule.WithdrawFundsEvent(id);
        if (withdrawEvent.length > 0) {
            funds = web3.utils.fromWei(withdrawEvent[0].returnValues.funds, 'ether');
        }
        return funds;
    } catch (e) {
        throw e;
    }
}

/*Function for a provider to add a TLE*/
async function addTLE(jsonInfo, account) {
    jsonInfo = JSON.parse(jsonInfo);
    const id = jsonInfo["id"];
    const spaceObject = jsonInfo["line0"];
    const line1 = jsonInfo["line1"];
    const line2 = jsonInfo["line2"];

    try {
        let arrayTLE = TLE.convertStrToBin(line1, line2);
        const rawBuffTLE = new Buffer.from(arrayTLE, 'hex');


        let K = await readwrite.Read_K(__dirname + '/../Database/SellerInfo' + id.toString() + '_' + account.address.toString() + '.txt');

        let pseudoK = crypto.pseudoRandomGenerator(web3.utils.bytesToHex(K), 59).slice(10); // To get a size of 49, a,d ,o 00's at the beginning

        const encryptedBuffTLE = crypto.OTP(pseudoK, rawBuffTLE);
        return await transactions.addTLE(account, id, spaceObject, encryptedBuffTLE);
    } catch (e) {
        throw e;
    }
}

/*Function for a purchaser ro read all posted TLE's for a reference (he must have the reference Key K)*/
async function clientReadTLEs(id, account) {
    try {
        let SellerObject = await readwrite.ReadAsObjectRefClient(__dirname + '/../Database/RefBuyer' + id.toString() + '_' + account.address + '.txt');

        let K = crypto.OTP(SellerObject.K2, SellerObject.KxorK2);
        let pseudoRandomRefKey = crypto.pseudoRandomGenerator(web3.utils.bytesToHex(K), 59).slice(10); // To get a size of 49, a,d ,o 00's at the beginning


        let rawTLES = await transactions.GetTLEs(account, id);
        let stringTLES = [];
        for (let i = 0; i < rawTLES["1"].length; i++) {
            let encryptedBuff1 = new Buffer.from(web3.utils.hexToBytes(rawTLES["1"][i].TLE1));
            let encryptedBuff2 = new Buffer.from(web3.utils.hexToBytes(rawTLES["1"][i].TLE2));
            let spaceObject = rawTLES["1"][i].spaceObject;

            let decryptedBuff = crypto.OTP(pseudoRandomRefKey, Buffer.concat([encryptedBuff1, encryptedBuff2]));

            let stringResult = TLE.convertBinToStr(decryptedBuff);
            stringTLES.push({
                line0: spaceObject,
                line1: stringResult[0],
                line2: stringResult[1]
            });
        }
        return stringTLES;
    } catch (e) {
        throw e;
    }
}

/*Function for a purchaser ro read all posted TLE's for a reference (case where the reference key is public)*/
async function readFreeTLEs(id, account) {
    try {
        // let SellerObject = await readwrite.ReadAsObjectRefClient(__dirname + '/../Database/RefBuyer' + id.toString() + '_' + account.address + '.txt');
        //
        // let K = crypto.OTP(SellerObject.K2, SellerObject.KxorK2);
        // let pseudoRandomRefKey = crypto.pseudoRandomGenerator(web3.utils.bytesToHex(K), 59).slice(10); // To get a size of 49, a,d ,o 00's at the beginning
        //

        let KEvent = await EventsModule.ReferenceKeySent(id);
        console.log(KEvent);
        let K = Buffer.from(web3.utils.hexToBytes(KEvent[0].returnValues.referenceKey));
        console.log(K);
        let pseudoRandomRefKey = crypto.pseudoRandomGenerator(web3.utils.bytesToHex(K), 59).slice(10); // To get a size of 49, a,d ,o 00's at the beginning

        let rawTLES = await transactions.GetTLEs(account, id);
        let stringTLES = [];
        for (let i = 0; i < rawTLES["1"].length; i++) {
            let encryptedBuff1 = new Buffer.from(web3.utils.hexToBytes(rawTLES["1"][i].TLE1));
            let encryptedBuff2 = new Buffer.from(web3.utils.hexToBytes(rawTLES["1"][i].TLE2));
            let spaceObject = rawTLES["1"][i].spaceObject;

            let decryptedBuff = crypto.OTP(pseudoRandomRefKey, Buffer.concat([encryptedBuff1, encryptedBuff2]));

            let stringResult = TLE.convertBinToStr(decryptedBuff);

            stringTLES.push({
                line0: spaceObject,
                line1: stringResult[0],
                line2: stringResult[1]
            });
        }
        return [K.toString('hex'), stringTLES];
    } catch (e) {
        throw e;
    }
}


/********************************
 * Exports
 ********************************/

async function getNodelistIDS() {
    return nodelistIDS;
}

function getBlockslistNUMBERS() {
    return blockslistNUMBERS;
}

module.exports = {
    getAccount,
    getBalance,
    createNewAccount,
    getNodelistIDS,
    getBlockslistNUMBERS,
    getBlockInfo,

    getCurrentPrice,
    buyReference,
    ongoingPurchases,
    manageIdBuyer,
    sendClientHash,
    computeK,
    disputeInfoClient,
    dispute,
    clientReadTLEs,

    sellReference,
    manageIdSeller,
    addTLE,
    manageSales,

    sendEncryptedEncodedKey,
    sendDecoderKey,
    sendReferenceKey,
    withdrawFundsProvider,

    sendClientHashMalicious,

    sendEncryptedEncodedKeyMalicious,
    sendDecoderKeyMalicious,
    sendReferenceKeyMalicious,

    createTransaction,

    getDeprecated,
    readFreeTLEs,
    getCompletedPurchases,
    getForSaleRefs,
};