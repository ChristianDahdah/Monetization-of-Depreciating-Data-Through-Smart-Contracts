/********************************
 * Defining Database N.B : will destruct if server is closed...
 ********************************/
let DiffieSchema = { // Schema for storing Diffie-H keys
    refId: "", // Id of the reference for which this applies
    PubDH: "", // Public key of Diffie-h
    PrivDH: "", // Private key of Diffie-h
    Pub_Other: "", // Public key of other individual
};
// let Reference_ClientSchema = { // Schema for storing reference information for a Client (keys and messages.)
//     public_key: "", // User ethereum public key
//     refId: "", // Id of the reference for which this applies
//     KxorK2 :   "", // KxorK2 provided by the seller
//     K2: "", // K2 provided later by the seller
// };
// let Reference_SellerSchema = { // Schema for storing reference information for a Seller (keys and messages.)
//     public_key:  "", // User ethereum public key
//     refId: "", // Id of the reference for which this applies
//     K: "", // Primary key used to encrypt the info
//     K2:  [],     // a mapping between client addresses and the hashes to send them
// };

module.exports = {
    newDiffieSchema: function () {
        return Object.create(DiffieSchema);
    },
    // newReference_SellerSchema: function () {
    //     return Object.create(Reference_SellerSchema);
    // },
    // newReference_ClientSchema: function () {
    //     return Object.create(Reference_ClientSchema)
    // },

};
