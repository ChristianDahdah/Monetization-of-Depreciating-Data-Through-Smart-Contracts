/** Variables **/
let connected = false;
// let references;
let myAccount = {};

/** To get a response from the server **/
function loadXMLDoc(page, successCallback, errorCallback) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 500) {
            errorCallback(this.responseText);
        }
        if (this.readyState === 4 && this.status === 200) {
            try {
                let result = JSON.parse(this.responseText);
                successCallback(result);
            } catch (e) {
                errorCallback(e.message);
            }
        }
    };
    xhttp.open("GET", page, true);
    xhttp.send();
}

/** Display functions **/
function displayListBlocks(list) {
    let html = "";
    list.forEach(function (blockNumber) {
        html += "<li onclick=displayBlockInfo(" + blockNumber + ")>" + blockNumber + "</li>";
    });
    return html;
}

function displayListNodes(list) {
    let html = "";
    list.forEach(function (nodeID) {
        html += "<li>" + nodeID + "</li>";
    });
    return html;
}

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

function displayTable(dict) {
    let html = "<table><tbody>";
    for (let key in dict) {
        html += "<tr>";
        html += "<td>" + key.capitalize() + "</td>";
        html += "<td>" + dict[key] + "</td>";
        html += "</tr>";
    }
    html += "</tbody></table>";
    return html;
}

function displayReferenceInfo(reference, keysToDisplay, keysNames) {
    let html = "<table><tbody>";
    html += "<tr>";
    html += "<td>ReferenceId</td>";
    html += "<td id='referenceInfo_referenceID'>" + reference["referenceId"] + "</td>";
    html += "</tr>";
    for (let i = 0; i < keysToDisplay.length; i++) {
        let key = keysToDisplay[i];
        let keyName = keysNames[i];
        html += "<tr>";
        html += "<td>" + keyName + "</td>";
        html += "<td>" + reference[key] + "</td>";
        html += "</tr>";
    }
    html += "</tbody></table>";
    return html;
}

/********************************
 * Accounts
 ********************************/

/** Load my account **/
function loadMyAccount() {
    if (connected) {
        $('#myAccount_notConnected').hide();
        $('#myAccount_connected').show();
        $('#myAccount_address').html(myAccount.address);
        loadManageSales();
        getCompletedPurchases();
        loadOngoingPurchases();
        loadHTMLDoc("sellNew.html", callbackLoadHTMLsellNew);
        updateBalance();
    } else {
        $('#myAccount_connected').hide();
        $('#myAccount_notConnected').show();
    }
}

/** Update balance **/
function callbackUpdateBalance(balance) {
    $("#myAccount_value").text(balance);
}

function updateBalance() {
    loadHTMLDoc("balance", callbackUpdateBalance, callbackError);
}

/** Connection **/
function callbackConnect(address) {
    connected = true;
    myAccount.address = address;
    loadMyAccount();
}

function callbackErrorConnect(err) {
    $("#myAccount_message").show();
    $("#myAccount_message").html(err);
}

function connect() {
    let privateKey = $("#myAccount_connection_privateKey").val();
    loadXMLDoc("connect/" + privateKey, callbackConnect, callbackErrorConnect);
}

function disconnect() {
    connected = false;
    myAccount = {};
    loadMyAccount();
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", 'signout', true);
    xhttp.send();
}

/** Creation of a new account **/
function callbackNewAccount(param) {
    $("#newAccount_address").html(param[0]);
    $("#newAccount_privatekey").html(param[1]);
}

function createNewAccount() {
    loadXMLDoc("newAccount", callbackNewAccount, callbackError);
}

function callbackConnectNewAccount(json) {
    connected = true;
    myAccount.address = json["address"];
    loadMyAccount();
}

function logInWithNewAccount() {
    let privateKey = $("#newAccount_privatekey").text();
    loadXMLDoc("connect/" + privateKey, callbackConnectNewAccount, callbackError);
}

/********************************
 * Nodes
 ********************************/

/** Update of the nodelist **/
function callbackNodelist(param) {
    param = displayListNodes(param);
    $("#nodes_list").html(param);
}

function updateNodesList() {
    // We only update the list if the item is displayed on the screen
    if ($("#listNodesItem").text()) {
        loadXMLDoc("updateNodelist", callbackNodelist, callbackError);
    }
}

setInterval(updateNodesList, 2000);

/********************************
 * Blocks
 ********************************/

/** Update of the blocks list **/
function callbackBlockslist(param) {
    param = displayListBlocks(param);
    $("#blocks_list").html(param);
}

function updateBlocksList() {
    // We only update the list if the item is displayed on the screen
    if ($("#listBlocksItem").text()) {
        loadXMLDoc("updateListBlocks", callbackBlockslist, callbackError);
    }
}

setInterval(updateBlocksList, 2000);

/** Info about one block **/
function callbackBlockInfo(param) {
    param = displayTable(param);
    $('#block_message').hide();
    $("#block_info").html(param);
}

function displayBlockInfo(blocknumber) {
    if (blocknumber === -1) {
        blocknumber = $("#blocks_blockNumber").val();
        blocknumber = Number(blocknumber);
    }
    if (blocknumber > 0) {
        addItem(blockInfoItem);
        loadXMLDoc("getBlockInfo/" + blocknumber, callbackBlockInfo, callbackError);
    }
}

/********************************
 * Buy menu
 ********************************/

/** Get for sale references **/
function callbackGetReferences(param) {
    $('#forSale_message').hide();
    // references = {};
    let html = "";
    param.forEach(function (reference) {
        html += "<details>";
        html += "<summary>" + reference["description"] + "</summary>";
        html += "<p>Reference Id: " + reference["referenceId"] + "</p>";
        html += "<p>Minimum data: " + reference["minimumData"] + "</p>";
        html += "<p class='link' onclick=getRefForSaleInfo(" + reference["referenceId"] + ")>Get more info</p>";
        html += "</details>";
        // references[reference["referenceId"]] = reference;
    });
    $("#forSale_list").html(html);
}

function callbackErrorGetReferences(err) {
    $('#forSale_message').show();
    $('#forSale_message').html(err);
}

function getReferences() {
    loadXMLDoc("getReferences", callbackGetReferences, callbackErrorGetReferences);
}

/** For sale Reference info **/
function callbackGetPrice(price) {
    $("#referenceInfo_currentPrice").html(price);
}

function updatePrice() {
    // We only update the price if the item is displayed on the screen
    if ($("#referenceInfo_referenceID").text()) {
        const id = $('#referenceInfo_referenceID').text();
        loadXMLDoc("getPrice/" + id, callbackGetPrice, callbackError);
    }
}

let myTimerPrice;

function callbackgetRefForSaleInfo(reference) {
    let html = "<table><tbody>";
    const keysToDisplay = ["provider", "insuranceDeposit", "minimumData"];
    const keysNames = ["Provider", "Insurance funds by the provider", "Minimum Data"];
    const depreciationTypes = {
        1: "Linear",
        2: "Quadratic",
        0: "No depreciation"
    };

    html += "<tr>";
    html += "<td>Reference Id</td>";
    html += "<td id='referenceInfo_referenceID'>" + reference["referenceId"] + "</td>";
    html += "</tr>";

    html += "<tr>";
    html += "<td>Description</td>";
    html += "<td>" + reference["description"] + "</td>";
    html += "</tr>";

    html += "<tr>";
    html += "<td>Current price</td>";
    html += "<td id='referenceInfo_currentPrice'></td>";
    html += "</tr>";

    for (let i = 0; i < keysToDisplay.length; i++) {
        let key = keysToDisplay[i];
        let keyName = keysNames[i];
        html += "<tr>";
        html += "<td>" + keyName + "</td>";
        html += "<td>" + reference[key] + "</td>";
        html += "</tr>";
    }

    html += "<tr>";
    html += "<td>Type of depreciation</td>";
    html += "<td>" + depreciationTypes[reference["depreciationType"]] + "</td>";
    html += "</tr>";

    html += "<tr>";
    html += "<td>Time of Deployment</td>";
    let deployTime = Number(reference["deployTime"]);
    deployTime = new Date(deployTime * 1000);
    deployTime = deployTime.toLocaleString();
    html += "<td>" + deployTime + "</td>";
    html += "</tr>";

    html += "<tr>";
    html += "<td>End Time</td>";
    let endTime = Number(reference["endTime"]);
    endTime = new Date(endTime * 1000);
    endTime = endTime.toLocaleString();
    html += "<td>" + endTime + "</td>";
    html += "</tr>";

    html += "</tbody></table>";

    addItem(forSaleReferenceInfoItem);
    $('#forSaleReferenceInfo_info').html(html);

    if (!connected) {
        $('#forSaleReferenceInfo_message').show();
        $('#forSaleReferenceInfo_message').text("To see the price and buy the reference you need to be connected...");
        $('#forSaleReferenceInfo_buyButton').hide();
        clearInterval(myTimerPrice);
    } else {
        $('#forSaleReferenceInfo_buyButton').show();
        $('#forSaleReferenceInfo_message').hide();
        myTimerPrice = setInterval(updatePrice, 3000);
    }
}

function getRefForSaleInfo(id) {
    loadXMLDoc("getRefInfo/" + id, callbackgetRefForSaleInfo, callbackError);
}

/** Get completed purchases **/
function comparisonReferences(ref1, ref2) {
    if (parseInt(ref1["referenceId"], 10) < parseInt(ref2["referenceId"], 10)) {
        return -1;
    } else {
        return 1;
    }
}

function callbackGetCompletedPurchaseRefInfo(reference) {
    const keysToDisplay = ["referenceId"];
    addItem(completedPurchaseRefInfoItem);
    const html = displayReferenceInfo(reference, keysToDisplay, keysToDisplay);
    $('#completePurchaseRefInfo_info').html(html);
}

function getCompletedPurchaseRefInfo(id) {
    loadXMLDoc("getCompletedPurchaseRefInfo/" + id, callbackGetCompletedPurchaseRefInfo, callbackError);
}

function callbackGetCompletedPurchases(Ids) {
    $("#completedPurchases_message").hide();
    Ids.sort(comparisonReferences);
    let html = "";
    for (let reference of Ids) {
        html += "<details>";
        html += "<summary>" + reference["description"] + "</summary>";
        html += "<p>Reference Id: " + reference["referenceId"] + "</p>";
        html += "</details>";
    }
    $("#completedPurchases_list").html(html);
}

function callbackErrorGetCompletedPurchases(err) {
    console.log(err);
    $("#completedPurchases_message").show();
    $("#completedPurchases_message").html(err);
}

function getCompletedPurchases() {
    if (connected) {
        $('#completedPurchases_notConnected').hide();
        $('#completedPurchases_connected').show();
        loadXMLDoc("getCompletedPurchases", callbackGetCompletedPurchases, callbackErrorGetCompletedPurchases);
    } else {
        $('#completedPurchases_connected').hide();
        $('#completedPurchases_notConnected').show();
    }
}

/** Buy reference **/
function callbackBuy(param) {
    $('#forSaleReferenceInfo_message').show();
    $('#forSaleReferenceInfo_message').text("Bought!");
}

function callbackErrorBuy(err) {
    $('#forSaleReferenceInfo_message').show();
    $('#forSaleReferenceInfo_message').text(err);
}

async function buyReference() {
    const id = $('#referenceInfo_referenceID').text();
    loadXMLDoc("buy/" + id, callbackBuy, callbackErrorBuy);
}

/** Ongoing Purchases **/

function callbackOngoingPurchases(Ids) {
    $("#ongoingPurchases_message").hide();
    let html = "";
    for (let reference of Ids) {
        html += "<details>";
        html += "<summary>" + reference["description"] + "</summary>";
        html += "<p>Reference Id: " + reference["referenceId"] + "</p>";
        html += "<p class='link' onclick=manageIdBuyer(" + reference["referenceId"] + ")>Manage this Id</p>";
        html += "</details>";
    }
    $("#ongoingPurchases_beingBought").html(html);
}

function callbackErrorOngoingPurchases(err) {
    $("#ongoingPurchases_message").show();
    $("#ongoingPurchases_message").html(err);
}

function loadOngoingPurchases() {
    if (connected) {
        $('#ongoingPurchases_notConnected').hide();
        $('#ongoingPurchases_connected').show();
        loadXMLDoc("ongoingPurchases", callbackOngoingPurchases, callbackErrorOngoingPurchases);
    } else {
        $('#ongoingPurchases_connected').hide();
        $('#ongoingPurchases_notConnected').show();
    }
}

/** Free public data **/
function callbackFreeReferences(Ids) {
    console.log(Ids);
    $("#freeReferences_message").hide();
    let html = "";
    for (let reference of Ids) {
        html += "<details>";
        html += "<summary>" + reference["description"] + "</summary>";
        html += "<p>Reference Id: " + reference["referenceId"] + "</p>";
        html += "<p class='link' onclick=getFreeReferenceInfo(" + reference["referenceId"] + ")>See the TLEs</p>";
        html += "</details>";
    }
    $("#freeReferences_references").html(html);
}

function callbackErrorFreeReferences(err) {
    $("#freeReferences_message").show();
    $("#freeReferences_message").html(err);
}

function loadFreeReferences() {
    if (connected) {
        $('#freeReferences_notConnected').hide();
        $('#freeReferences_connected').show();
        loadXMLDoc("depreciatedData", callbackFreeReferences, callbackErrorFreeReferences);
    } else {
        $('#freeReferences_connected').hide();
        $('#freeReferences_notConnected').show();
    }
}

function callbackGetFreeReferenceInfo(result) {
    const id = result.id;
    const TLEs = result.TLEs;
    const K = result.K;
    addItem(freeRefInfoItem);
    $('#freeRefInfo_id').html(id);
    let html = "";
    html += "<p>Key: " + K + "</p>";
    for (let TLE of TLEs) {
        html += "<details>";
        html += "<summary>" + TLE["line0"] + "</summary>";
        html += "<p>" + TLE["line1"] + "</p>";
        html += "<p>" + TLE["line2"] + "</p>";
        html += "</details>";
    }
    $('#freeRefInfo_info').html(html);
}

function getFreeReferenceInfo(id) {
    loadXMLDoc("accessDepreciatedData/" + id, callbackGetFreeReferenceInfo, callbackError);
}


/** Manage Id Buyer **/
function callbackManageIdBuyer(param) {
    addItem(manageIdBuyerItem);

    const [reference, hashSent, encryptedEncodedReceived, decoderReceived, key] = param;
    console.log(key);
    const keys = ["provider", "description"];
    const keysNames = ["Provider", "Description"];
    const tableReference = displayReferenceInfo(reference, keys, keysNames);
    $("#manageIdBuyer_reference").html(tableReference);

    if (key != 0) {
        $("#manageIdBuyer_keyIsReleased").show();
        $("#manageIdBuyer_key").html(key);
    } else {
        $("#manageIdBuyer_keyIsReleased").hide();
    }

    if (!encryptedEncodedReceived) {
        // Waiting for the encrypted encoded key
        $('#manageidBuyer_encryptedEncodedWaiting').show();

        $('#manageidBuyer_sendHash').hide();
        $('#manageidBuyer_sendHashMalicious').hide();

        $('#manageidBuyer_decoderKeyWaiting').hide();

        $('#manageidBuyer_decoderKeyReceived').hide();
        $('#manageIdBuyer_seeTLES').hide();

    } else {
        // Encrypted encoded key received
        if (!hashSent) {
            // Client has to send the hash
            $('#manageidBuyer_encryptedEncodedWaiting').hide();

            $('#manageidBuyer_sendHash').show();
            $('#manageidBuyer_sendHashMalicious').show();

            $('#manageidBuyer_decoderKeyWaiting').hide();

            $('#manageidBuyer_decoderKeyReceived').hide();
            $('#manageIdBuyer_seeTLES').hide();

        } else {
            // Client has sent the hash
            if (!decoderReceived) {
                // Waiting for the decoder key
                $('#manageidBuyer_encryptedEncodedWaiting').hide();

                $('#manageidBuyer_sendHash').hide();
                $('#manageidBuyer_sendHashMalicious').hide();

                $('#manageidBuyer_decoderKeyWaiting').show();

                $('#manageidBuyer_decoderKeyReceived').hide();
                $('#manageIdBuyer_seeTLES').hide();

            } else {
                // Decoder key received, client can compute
                $('#manageidBuyer_encryptedEncodedWaiting').hide();

                $('#manageidBuyer_sendHash').hide();
                $('#manageidBuyer_sendHashMalicious').hide();

                $('#manageidBuyer_decoderKeyWaiting').hide();

                $('#manageidBuyer_decoderKeyReceived').show();
                $('#manageIdBuyer_seeTLES').show();
            }
        }
    }
}

function callbackErrorManageIdBuyer(err) {
    $('#manageIdBuyer_message').html(err);
}

function manageIdBuyer(id) {
    loadXMLDoc("manageIdBuyer/" + id, callbackManageIdBuyer, callbackErrorManageIdBuyer);
}

function callbackSendBuyerHash(id) {
    $('#manageIdBuyer_message').html("Successfully sent the hash")
}

function sendBuyerHash() {
    const id = $('#referenceInfo_referenceID').text();
    loadXMLDoc("sendBuyerHash/" + id, callbackSendBuyerHash, callbackErrorManageIdBuyer);
}

function callbackComputeK(result) {
    manageIdBuyer(result["id"]);
    $('#manageIdBuyer_K').html("K: " + result["K"]);
    $('#manageIdBuyer_message').html("Successfully computed K")
}

function computeK() {
    const id = $('#referenceInfo_referenceID').text();
    loadXMLDoc("computeK/" + id, callbackComputeK, callbackErrorManageIdBuyer);
}

/** Dispute **/
function callbackDisputeNotConfirmed(json) {
    $('#dispute_notConfirmed').show();
    $('#dispute_confirmed').hide();
    $('#dispute_id').html(json["id"]);

    if (json["alreadyDisputed"]) {
        $('#dispute_alreadyDisputed').show();
        $('#dispute_alreadyEncoded').hide();
        $('#dispute_refund').hide();
    } else if (json["alreadyEncoded"]) {
        $('#dispute_alreadyDisputed').hide();
        $('#dispute_alreadyEncoded').show();
        $('#dispute_refund').hide();
    } else {
        $('#dispute_alreadyDisputed').hide();
        $('#dispute_alreadyEncoded').hide();
        $('#dispute_refund').show();
        $('#dispute_possibleRefund').html(json["possibleRefund"]);
    }
}

function dispute() {
    const id = $('#referenceInfo_referenceID').text();
    addItem(disputeItem);
    loadXMLDoc("dispute/" + id, callbackDisputeNotConfirmed, callbackErrorManageIdBuyer);
}

function callbackConfirmDispute(json) {
    $('#dispute_notConfirmed').hide();
    $('#dispute_confirmed').show();
    $('#dispute_id').html(json["id"]);
    if (json["funds"] > 0) {
        $('#dispute_unsuccessful').hide();
        $('#dispute_successful').show();
        $('#dispute_funds').html(json["funds"]);
    } else {
        $('#dispute_unsuccessful').show();
        $('#dispute_successful').hide();
    }
}

function confirmDispute() {
    const id = $('#dispute_id').text();
    loadXMLDoc("confirmDispute/" + id, callbackConfirmDispute, callbackErrorManageIdBuyer);
}

/** See TLEs **/
function callbackSeeTLEs(result) {
    addItem(seeTLEsItem);
    $('#seeTLEs_id').html(result["id"]);
    let html = "";
    for (let TLE of result['TLEs']) {
        html += "<details>";
        html += "<summary>" + TLE["line0"] + "</summary>";
        html += "<p>" + TLE["line1"] + "</p>";
        html += "<p>" + TLE["line2"] + "</p>";
        html += "</details>";
    }
    $('#seeTLEs_list').html(html);
}

function seeTLEs() {
    const id = $('#referenceInfo_referenceID').text();
    loadXMLDoc("seeTLEs/" + id, callbackSeeTLEs, callbackErrorManageIdBuyer);
}

/********************************
 * Sell menu
 ********************************/

/** Sell reference **/

function callbackSellNewReference(param) {
    $("#sellNew_message").text("The offer is on the blockchain!");
    $("#sellNew_receipt").show();
    $("#sellNew_blockNumber").text(param["blockNumber"]);
    $("#sellNew_gasUsed").text(param["cumulativeGasUsed"]);
    $("#sellNew_referenceId").text(param["id"]);
}

function callbackErrorSellNewReference(err) {
    $("#sellNew_message").show();
    $("#sellNew_message").html(err);
}

function sellNewReference() {
    let json = {
        initialPrice: $("#sellNew_price").val(),
        durationDays: $("#sellNew_durationDays").val(),
        durationHours: $("#sellNew_durationHours").val(),
        durationMinutes: $("#sellNew_durationMinutes").val(),
        description: $("#sellNew_description").val(),
        minData: $("#sellNew_minData").val(),
        depreciationType: document.querySelector('input[name="depreciationType"]:checked').value,
        deposit: $("#sellNew_insuranceDeposit").val(),
    };
    let complete = false;
    for (let property in json) {
        if (json[property] === "") {
            $("#sellNew_message").show();
            $("#sellNew_message").html("Please complete the whole form.");
            break;
        } else {
            complete = true;
        }
    }
    if (complete) {
        $("#sellNew_message").hide();
        loadXMLDoc("sellNewReference/" + JSON.stringify(json),
            callbackSellNewReference, callbackErrorSellNewReference);
    }
}

/** Manage sales **/

function callbackManageSales(Ids) {
    $("#manageSales_message").hide();
    let html = "";
    for (let reference of Ids) {
        html += "<details>";
        html += "<summary>" + reference["description"] + "</summary>";
        html += "<p>Reference Id: " + reference["referenceId"] + "</p>";
        html += "<p class='link' onclick=manageIdSeller(" + reference["referenceId"] + ")>Manage this Id</p>";
        html += "</details>";
    }
    $("#manageSales_beingSold").html(html);
}

function callbackErrorManageSales(err) {
    $("#manageSales_message").show();
    $("#manageSales_message").html(err);
}

function loadManageSales() {
    if (connected) {
        $('#manageSales_notConnected').hide();
        $('#manageSales_connected').show();
        loadXMLDoc("manageSales", callbackManageSales, callbackErrorManageSales);
    } else {
        $('#manageSales_connected').hide();
        $('#manageSales_notConnected').show();
    }
}

/** Manage Id Seller **/

function callbackManageIdSeller(param) {
    addItem(manageIdSellerItem);
    const [reference, total_clients, num_clients_step1, num_clients_step2, key, timeLeft, numberTLES, minNumberTLE] = param;
    const keys = ["provider", "initialPrice", "currentPrice", "description"];
    const keysNames = ["Provider", "Initial price", "Current price", "Description"];
    const tableReference = displayReferenceInfo(reference, keys, keysNames);
    $("#manageIdSeller_reference").html(tableReference);

    $("#manageIdSeller_totalNumberClients").text(total_clients);
    $("#manageIdSeller_NumClientsStep1").text(num_clients_step1);
    $("#manageIdSeller_NumClientsStep2").text(num_clients_step2);
    $("#manageIdSeller_totalNumberClients").text(total_clients);

    const daysLeft = Math.trunc(timeLeft / 86400);
    const secondsLeft = new Date(1000 * (timeLeft % 86400));
    $("#manageIdSeller_timeLeftDays").text(daysLeft);
    $("#manageIdSeller_timeLeftSeconds").text(secondsLeft.toISOString().substr(11,8));
    $("#manageIdSeller_minNumberTLEs").text(minNumberTLE);
    $("#manageIdSeller_numberTLEs").text(numberTLES);

    if (key === 0) {
        $('#manageIdSeller_keyReleased').hide();
        $('#manageIdSeller_keyNotReleased').show();
        $('#manageIdSeller_keyNotReleasedMalicious').show();

    } else {
        $('#manageIdSeller_keyNotReleased').hide();
        $('#manageIdSeller_keyNotReleasedMalicious').hide();

        $('#manageIdSeller_keyReleased').show();
        $('#manageIdSeller_releasedKey').html(key);
    }
}

function callbackErrorManageIdSeller(err) {
    $("#manageIdSeller_message").show();
    $("#manageIdSeller_message").html(err);
}

function manageIdSeller(id) {
    $("#manageIdSeller_message").hide();
    loadXMLDoc("manageIdSeller/" + id, callbackManageIdSeller, callbackErrorManageIdSeller);
}

/** New TLE **/
function callbackUploadNewTLE(param) {
    $("#newTLE_message").show();
    $("#newTLE_message").html("TLE uploaded");
}

function callbackErrorUploadNewTLE(err) {
    $("#newTLE_message").show();
    $("#newTLE_message").html(err);
}

function uploadNewTLE() {
    let json = {
        id: $("#newTLE_id").text(),
        line0: $("#newTLE_line0").val(),
        line1: $("#newTLE_line1").val(),
        line2: $("#newTLE_line2").val(),

    };
    let complete = false;
    for (const property in json) {
        if (json[property] === "") {
            $("#newTLE_message").show();
            $("#newTLE_message").html("Please complete the whole form.");
            break;
        } else {
            complete = true;
        }
    }
    if (complete) {
        $("#newTLE_message").hide();
        loadXMLDoc("uploadNewTLE/" + JSON.stringify(json), callbackUploadNewTLE, callbackErrorUploadNewTLE);
    }
}

function loadNewTLEForm() {
    addItem(newTLEItem);
    loadHTMLDoc("newTLE.html", callbackLoadHTMLnewTLE);
}

/** Seller step 1 **/

function callbackEncodedEncryptedKey(param) {
    const [num, done] = param;
    $("#manageIdSeller_message").show();
    $("#manageIdSeller_message").html("Successfully sent info to " + done + " clients out of " + num + " expected!");
}

function sendEncodedEncryptedKey() {
    const id = $('#referenceInfo_referenceID').text();
    loadXMLDoc("sendEncodedEncryptedKey/" + id, callbackEncodedEncryptedKey, callbackError);
}

/** Seller step 2 **/
function callbackSendDecoderKey(result) {
    $("#manageIdSeller_message").show();
    let [num, done] = result;
    $("#manageIdSeller_message").html("Successfully sent K2 to " + done + " clients out of " + num + " expected!<br>The others were ignored because a wrong hash was sent.");
}

function sendDecoderKey() {
    const id = $('#referenceInfo_referenceID').text();
    loadXMLDoc("sendDecoderKey/" + id, callbackSendDecoderKey, callbackError);
}

/** Seller post key **/
function callbackpostRefKey(result) {
    $("#manageIdSeller_message").show();
    let [receipt, refKey] = result;
    $("#manageIdSeller_message").html("Successfully sent the Reference Key to the contract.");
}

function postRefKey() {
    const id = $('#referenceInfo_referenceID').text();
    loadXMLDoc("postRefKey/" + id, callbackpostRefKey, callbackError);
}

/** Withdraw Funds **/
function callbackWithdrawFunds(param) {
    $("#manageIdSeller_message").show();
    $("#manageIdSeller_message").html("Successfully withdrew funds. You received " + param["funds"] + " Ether.");
}

function callbackErrorWithdrawFunds(err) {
    $("#manageIdSeller_message").show();
    $("#manageIdSeller_message").html(err);
}

function withdrawFunds() {
    const id = $('#referenceInfo_referenceID').text();
    loadXMLDoc("withdrawFunds/" + id, callbackWithdrawFunds, callbackErrorWithdrawFunds);
}

/** Error **/

function callbackError(err) {
    console.log("ERROR");
    console.error(err);
}

/** Make a transaction, to delete **/
function callbackMakeTransaction(param) {
    addItem(resultTransactionItem);
    param = displayTable(param);
    $("#transaction_message").html("Transaction completed!");
    $("#resultTransaction_receipt").html(param);
}

function makeTransaction() {
    let json = {
        sender: $("#transaction_sender").val(),
        receiver: $("#transaction_receiver").val(),
        privateKey: $("#transaction_privateKey").val(),
        amount: $("#transaction_amount").val(),
    };
    let complete = false;
    for (const property in json) {
        if (json[property] === "") {
            $("#message").html("Please complete the whole form.");
            $("#transaction_message").html("Please complete the whole form.");
            break;
        } else {
            complete = true;
        }
    }
    if (complete) {
        loadXMLDoc("maketransaction/" + JSON.stringify(json), callbackMakeTransaction, callbackError);
    }
}

/********************************
 * Malicious functions
 ********************************/

function sendBuyerHashMalicious() {
    const id = $('#referenceInfo_referenceID').text();
    loadXMLDoc("sendBuyerHashMalicious/" + id, callbackSendBuyerHash, callbackErrorManageIdBuyer);
}

function sendEncodedEncryptedKeyMalicious() {
    const id = $('#referenceInfo_referenceID').text();
    loadXMLDoc("sendEncodedEncryptedKeyMalicious/" + id, callbackEncodedEncryptedKey, callbackError);
}

function sendDecoderKeyMalicious() {
    const id = $('#referenceInfo_referenceID').text();
    loadXMLDoc("sendDecoderKeyMalicious/" + id, callbackSendDecoderKey, callbackError);
}

function postRefKeyMalicious() {
    const id = $('#referenceInfo_referenceID').text();
    loadXMLDoc("postRefKeyMalicious/" + id, callbackpostRefKey, callbackError);
}
