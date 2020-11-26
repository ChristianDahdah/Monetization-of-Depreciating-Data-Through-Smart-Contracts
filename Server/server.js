const express = require('express');
const session = require('cookie-session'); // Charge le middleware de sessions
// const bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
const bc = require('./js/blockchain');
const EventsModule = require('./js/EventsModule');


/********************************
 * Create the app
 ********************************/
const port = 8089;
const app = express();
// Load the css folder
app.use(express.static(__dirname + '/css'));
// Load the js files
app.use(express.static(__dirname + '/js'));
// Load the html files
app.use(express.static(__dirname + '/html'));
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({extended: true}));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());


app.use(session({
    'secret': '343ji43j4n3jn4jk3n'
}));

/********************************
 * Listen on port 8081
 ********************************/

let server = app.listen(port, function () {
    console.log("Server listening on port " + port + ".");
});

/********************************
 * Register the URLs
 ********************************/

app.use('/public', express.static(__dirname + '/public'))

    .get('', function (req, res) {
        res.render('home.ejs');
    })

    /************ Sign in and out ************/

    .get('/connect/:privateKey', async (req, res) => {
        try {
            req.session.Account = await bc.getAccount(req.params.privateKey);
            res.json(req.session.Account.address);
        } catch (e) {
            res.status(500).json(e.message);
        }
    })

    .get('/balance', async (req, res) => {
        try {
            let balance = await bc.getBalance(req.session.Account.address);
            balance = Number(balance);
            res.json(balance);
        } catch (e) {
            res.status(500).json(e.message);
        }
    })

    .get('/signout', function (req, res) {
        req.session.Account = undefined;
    })

    .get('/newAccount/', async (req, res) => {
        const info = await bc.createNewAccount();
        res.json([info["address"], info["privateKey"]]);
    })

    /************ Nodes and blocks ************/

    .get('/updateNodelist/', async (req, res) => {
        const list = await bc.getNodelistIDS();
        res.json(list);
    })

    .get('/updateListBlocks/', async (req, res) => {
        const info = bc.getBlockslistNUMBERS();
        res.json(info);
    })

    .get('/getBlockInfo/:blocknumber', async (req, res) => {
        const info = await bc.getBlockInfo(req.params.blocknumber);
        res.json(info);
    })

    /************ For sale references ************/

    .get('/getReferences/', async (req, res) => {
        try {
            const Ids = await bc.getForSaleRefs();
            res.json(Ids);
        } catch (e) {
            res.status(500).json(e.message);
        }
    })

    .get('/getRefInfo/:id', async (req, res) => {
        try {
            let reference = await EventsModule.GetRef(req.params.id);
            res.json(reference);
        } catch (e) {
            res.status(500).json(e.message);
        }
    })

    .get('/getPrice/:id', async (req, res) => {
        try {
            const actualPrice = await bc.getCurrentPrice(req.session.Account, req.params.id);
            res.json(actualPrice);
        } catch (e) {
            res.status(500).json(e.message);
        }
    })

    /************ Completed purchases ************/

    .get('/getCompletedPurchases/', async (req, res) => {
        try {
            let Ids = await bc.getCompletedPurchases(req.session.Account)
            res.json(Ids);
        } catch (e) {
            console.error(e);
            res.status(500).json(e.message);
        }
    })

    .get('/getCompletedPurchaseRefInfo/:id', async (req, res) => {
        try {
            let reference = await EventsModule.GetRef(req.params.id);
            reference = reference[0].returnValues;
            res.json(reference);
        } catch (e) {
            res.status(500).json(e.message);
        }
    })

    /************ Buy a reference ************/

    .get('/buy/:id', async (req, res) => {
        try {
            let reference = await EventsModule.GetRef(req.params.id);
            await bc.buyReference(req.params.id, req.session.Account);
            res.json(reference[0]);
        } catch (e) {
            console.error(e);
            res.status(500).json(e.message);
        }
    })

    /************ Ongoing purchases ************/

    .get('/ongoingPurchases/', async (req, res) => {
        try {
            let Ids = await bc.ongoingPurchases(req.session.Account);
            res.json(Ids);
        } catch (e) {
            res.status(500).json(e.message);
        }
    })

    .get('/manageIdBuyer/:id', async (req, res) => {
        try {
            let result = await bc.manageIdBuyer(req.params.id, req.session.Account);
            res.json(result);
        } catch (e) {
            console.log(e);
            res.status(500).json(e.message);
        }
    })

    .get('/sendBuyerHash/:id', async (req, res) => {
        try {
            await bc.sendClientHash(req.params.id, req.session.Account);
            res.json(req.params.id);
        } catch (e) {
            console.log(e);
            res.status(500).json(e.message);
        }
    })

    .get('/computeK/:id', async (req, res) => {
        try {
            const K = await bc.computeK(req.params.id, req.session.Account);
            console.log(K);
            res.json({id: req.params.id, K: K});
        } catch (e) {
            console.log(e);
            res.status(500).json(e.message);
        }
    })

    .get('/dispute/:id', async (req, res) => {
        try {
            let [alreadyEncoded, possibleRefund, alreadyDisputed] = await bc.disputeInfoClient(req.params.id, req.session.Account);
            res.json({
                id: req.params.id,
                alreadyEncoded: alreadyEncoded,
                possibleRefund: possibleRefund,
                alreadyDisputed: alreadyDisputed,
            });
        } catch (e) {
            console.log(e);
            res.status(500).json(e.message);
        }
    })

    .get('/confirmDispute/:id', async (req, res) => {
        try {
            let funds = await bc.dispute(req.params.id, req.session.Account);
            res.json({id: req.params.id, funds: funds});
        } catch (e) {
            console.log(e);
            res.status(500).json(e.message);
        }
    })

    .get('/seeTLEs/:id', async (req, res) => {
        try {
            let TLEs = await bc.clientReadTLEs(req.params.id, req.session.Account);
            res.json({id: req.params.id, TLEs: TLEs});
        } catch (e) {
            console.log(e);
            res.status(500).json(e.message);
        }
    })

    /************ Access depreciated Data ************/

    .get('/depreciatedData', async (req, res) => {
        try {
            let Ids = await bc.getDeprecated();
            res.json(Ids);
        } catch (e) {
            console.log(e);
            res.status(500).json(e.message);
        }
    })
    .get('/accessDepreciatedData/:id', async (req, res) => {
        try {
            let [K, TLEs] = await bc.readFreeTLEs(req.params.id, req.session.Account);
            res.json({id: req.params.id, TLEs: TLEs, K: K});
        } catch (e) {
            console.log(e);
            res.status(500).json(e.message);
        }
    })
    /************ Sell a reference ************/

    .get('/sellNewReference/:json', async (req, res) => {
        try {
            let receipt = await bc.sellReference(req.params.json, req.session.Account);
            res.json(receipt);
        } catch (e) {
            console.log(e);
            res.status(500).json(e.message);
        }
    })

    /************ Manage sales ************/

    .get('/manageSales/', async (req, res) => {
        try {
            let Ids = await bc.manageSales(req.session.Account);
            res.json(Ids);
        } catch (e) {
            res.status(500).json(e.message);
        }
    })

    .get('/manageIdSeller/:id', async (req, res) => {
        try {
            const result = await bc.manageIdSeller(req.params.id, req.session.Account);
            res.json(result);
        } catch (e) {
            console.log(e);
            res.status(500).json(e.message);
        }
    })

    /** Upload a new TLE to the reference **/

    .get('/uploadNewTLE/:json', async (req, res) => {
        try {
            const result = await bc.addTLE(req.params.json, req.session.Account);
            res.json(result);
        } catch (e) {
            console.log(e);
            res.status(500).json(e.message);
        }
    })

    /** Seller step 1 **/
    .get('/sendEncodedEncryptedKey/:id', async (req, res) => {
        try {
            let result = await bc.sendEncryptedEncodedKey(req.params.id, req.session.Account);
            // result = [num, done]
            res.json(result);
        } catch (e) {
            console.log(e);

            res.status(500).json(e.message);
        }
    })

    /** Seller step 2 **/
    .get('/sendDecoderKey/:id', async (req, res) => {
        try {
            let result = await bc.sendDecoderKey(req.params.id, req.session.Account);
            // result = [num, done]
            res.json(result);
        } catch (e) {
            console.error(e);
            res.status(500).json(e.message);
        }
    })

    /** Seller release key **/
    .get('/postRefKey/:id', async (req, res) => {
        try {
            let result = await bc.sendReferenceKey(req.params.id, req.session.Account);            // result = [num, done]
            res.json(result);
        } catch (e) {
            console.error(e);
            res.status(500).json(e.message);
        }
    })

    /** Seller withdraw funds **/
    .get('/withdrawFunds/:id', async (req, res) => {
        try {
            let funds = await bc.withdrawFundsProvider(req.params.id, req.session.Account);
            res.json({id: req.params.id, funds: funds});
        } catch (e) {
            throw e;
        }
    })

    /************ Delete these gets ************/


    .get('/maketransaction/:jsonInfo', async (req, res) => {
        let receipt = await bc.createTransaction(req.params.jsonInfo);
        res.json(receipt);
    })

    /************ Malicious gets ************/

    /* Send a fake hash I compute to the provider */
    .get('/sendBuyerHashMalicious/:id', async (req, res) => {
        try {
            await bc.sendClientHashMalicious(req.params.id, req.session.Account);
            res.json(req.params.id);
        } catch (e) {
            console.log(e);
            res.status(500).json(e.message);
        }
    })

    .get('/sendEncodedEncryptedKeyMalicious/:id', async (req, res) => {
        try {
            let result = await bc.sendEncryptedEncodedKeyMalicious(req.params.id, req.session.Account);
            // result = [num, done]
            res.json(result);
        } catch (e) {
            console.log(e);

            res.status(500).json(e.message);
        }
    })

    .get('/sendDecoderKeyMalicious/:id', async (req, res) => {
        try {
            let result = await bc.sendDecoderKeyMalicious(req.params.id, req.session.Account);
            // result = [num, done]
            res.json(result);
        } catch (e) {
            console.error(e);
            res.status(500).json(e.message);
        }
    })

    .get('/postRefKeyMalicious/:id', async (req, res) => {
        try {
            let result = await bc.sendReferenceKeyMalicious(req.params.id, req.session.Account);            // result = [num, done]
            res.json(result);
        } catch (e) {
            console.error(e);
            res.status(500).json(e.message);
        }
    })

    /************ Close the server ************/

    .get('/closeserver', function (req, res) {
        res.render('closeServer.ejs');
        server.close(() => {
            console.log("Server closed.");
        });
    })

    /** Redirection to home if the page is not found **/
    .use(function (req, res) {
        res.redirect('/');
    });

