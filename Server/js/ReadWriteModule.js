const fs = require('fs');


let DiffieSchema = { // Schema for storing Diffie-H keys
    PubDH: "", // Public key of Diffie-h
    PrivDH: "", // Private key of Diffie-h
    Pub_Other: "", // Public key of other individual
};
let Reference_SellerSchema = { // Schema for storing reference information for a Seller (keys and messages.)
    K2: "", // Appropriate K2 for a client
    hash: "",     // hash expected
};
let Seller_InfoSchema = { // Schema for storing reference information for a Seller (keys and messages.)
    K: "", // Primary key used to encrypt the info
};
let Reference_ClientSchema = { // Schema for storing reference information for a Client (keys and messages.)
    KxorK2: "", // KxorK2 provided by the seller
    K2: "", // K2 provided later by the seller
};

function callbackError(err) {
    if (err) {
        throw err;
    }
}

module.exports = {
    // GetAvailableRefs: async function (contractws, endTime, priceMax, provider) {
    Read: async function (path) {
        return fs.readFileSync(path, function (err, data) {
        });
    },
    Write: async function (name, data) {
        await fs.writeFile(name, data, callbackError);
        return 0;
    },
    ReadAsObjectDH: async function (path) {
        let res = await fs.readFileSync(path, function (err, data) {
        });
        let res_obj = JSON.parse(res);
        const Diffie = Object.create(DiffieSchema);

        Diffie.PrivDH = new Buffer.from(res_obj.PrivDH.data, 'hex');
        Diffie.PubDH = new Buffer.from(res_obj.PubDH.data, 'hex');
        return Diffie;
    },
    WriteAsRefSeller: async function (path, hash, K2) {
        try {
            const RefSeller = Object.create(Reference_SellerSchema);
            RefSeller.hash = hash;
            RefSeller.K2 = K2;
            await fs.writeFile(path, JSON.stringify(RefSeller), callbackError);
            return 0;
        } catch (e) {
            throw e;
        }
    },

    WriteAsSellerInfo: async function (path, K) {
        try {
            const RefSeller = Object.create(Seller_InfoSchema);
            RefSeller.K = K;
            await fs.writeFile(path, JSON.stringify(RefSeller), callbackError);
            return 0;
        } catch (e) {
            throw e;
        }
    },

    WriteAsRefBuyer: async function (path, KxorK2, K2) {
        const RefBuyer = Object.create(Reference_ClientSchema);
        RefBuyer.KxorK2 = KxorK2;
        RefBuyer.K2 = K2 || new Buffer.from("000000000000000000000", 'hex');
        await fs.writeFile(path, JSON.stringify(RefBuyer), callbackError);
        return 0;
    },
    ReadAsObjectRefSeller: async function (path) {
        let res = await fs.readFileSync(path, function (err, data) {
        });
        let res_obj = JSON.parse(res);
        const Ref = Object.create(Reference_SellerSchema);

        Ref.hash = res_obj.hash;
        Ref.K2 = new Buffer.from(res_obj.K2.data, 'hex');
        return Ref;
    },
    ReadAsObjectRefClient: async function (path) {
        let res = await fs.readFileSync(path, function (err, data) {
        });
        let res_obj = JSON.parse(res);
        const Ref = Object.create(Reference_ClientSchema);

        Ref.KxorK2 = new Buffer.from(res_obj.KxorK2.data, 'hex');
        Ref.K2 = new Buffer.from(res_obj.K2.data, 'hex');
        return Ref;
    },

    Read_K: async function (path) {
        let res = await fs.readFileSync(path, function (err, data) {
        });
        let res_obj = JSON.parse(res);
        const Ref = Object.create(Seller_InfoSchema);
        Ref.K = new Buffer.from(res_obj.K.data, 'hex');
        return Ref.K;
    },
    ReadPrimeAndGen: async function (path) {
        let res = await fs.readFileSync(path, function (err, data) {
        });
        return JSON.parse(res);
    },
    // WritePrimeAndGen: async function (path, primeh) {
    //     await fs.writeFile(path, JSON.stringify(primeh), callbackError);
    //     return 0;
    // },

};
