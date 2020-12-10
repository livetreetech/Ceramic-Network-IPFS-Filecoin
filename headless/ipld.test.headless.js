const IPFS = require('ipfs');
const dagJose = require('dag-jose');
const multiformats = require('multiformats/basics'); // Need version multiformats@3.0.3
const legacy = require('multiformats/legacy');
const DID = require('dids');
const KeyResolver = require('@ceramicnetwork/key-did-resolver'); // *** Undeclared dependency *** Need version @ceramicnetwork/key-did-resolver@0.2.0 at least
//const ThreeID = require('3id-connect'); // This does not work outside of a browser
const { Ed25519Provider } = require('key-did-provider-ed25519');

var sysOwnerDID;

//console.log(dagJose.default);
//console.log(multiformats.multicodec);
//console.log(ThreeID);
//console.log(Ed25519Provider);
//console.log(DID);

function showMethods(obj)
{
    var res = [];
    for(var m in obj) {
        if(typeof obj[m] == "function") {
            res.push(m);
            console.log("method: ", m);
        }
    }
    return res;
}

async function addSignedObject(payload, did, ipfs) {
  // sign the payload as dag-jose
  const { jws, linkedBlock } = await did.createDagJWS(payload);
  //console.log("jws: ", jws);
  //console.log("linkedBlock: ", linkedBlock);
  // put the JWS into the ipfs dag
  const jwsCid = await ipfs.dag.put(jws, { format: 'dag-jose', hashAlg: 'sha2-256' });
  // put the payload into the ipfs dag
  console.log("jws.link: ", jws.link);
  await ipfs.block.put(linkedBlock, { cid: jws.link });
  //console.log ("Saved object: ", jwsCid);
  return jwsCid;
}

async function addEncryptedObject(payload, did, ipfs) {
    //showMethods(did);
    const dids = [did.id, sysOwnerDID.id];
    //console.log("Adding encrypted object ...", dids);
    const jwe = await did.createDagJWE(payload, dids);
    //console.log("jwe:", jwe);
    return ipfs.dag.put(jwe, { format: 'dag-jose', hashAlg: 'sha2-256' });
}


async function initIPFS() {
    multiformats.multicodec.add(dagJose.default);
    const dagJoseFormat = legacy(multiformats, dagJose.default.name);
    //console.log("Starting IPFS.");
    const ipfs = await IPFS.create({ ipld: { formats: [dagJoseFormat] } });
    return ipfs    
}

async function initDID(seed) {
    const provider = new Ed25519Provider(seed);
    //console.log(DID);
    const did = new DID.DID({ provider });
    const keyres = await KeyResolver.default.getResolver();
    //console.log("keyres: ", keyres);
    //const keyafunc = await keyres.key;
    await did.setResolver({ registry: keyres});
    await did.authenticate() ;   
    console.log("Connected with : ", did.id); 
    return did;
}

async function fetchItem(cid, did, ipfs) {
    const item = (await ipfs.dag.get(cid)).value;
    var cleartext;
    //console.log("item: ", item);
    if (typeof item.ciphertext != "undefined") {
       cleartext = await did.decryptDagJWE(item);
    } else {
        cleartext = (await ipfs.dag.get(cid, { path: '/link' })).value;
    };
    return cleartext;
}

async function fetchItems(cid, did, ipfs) {
    var item, cid;
    var items = []; 
    do {
        item = await fetchItem(cid, did, ipfs);
        if(typeof item.prev == "undefined") {break};
        cid = item.prev;
        console.log("item: ", item);
        items.push(item);
    } while (item.prev != 0) ;
    return items;
}

async function main() {
    console.log("Starting..."); 
    ipfs = await initIPFS();
    sysOwnerDID = await initDID([26,34,249,164,90,247,158,182,224,34,249,164,90,247,158,182,24,34,249,164,90,247,158,182,24,34,249,164,90,247,158,182]);
    
    // Create digital identities
    const seed1 = new Uint8Array([24,34,249,164,90,247,158,182,224,34,249,164,90,247,158,182,24,34,249,164,90,247,158,182,24,34,249,164,90,247,158,182]); //  32 bytes with high entropy
    const seed2 = new Uint8Array([25,34,249,164,90,247,158,182,224,34,249,164,90,247,158,182,24,34,249,164,90,247,158,182,24,34,249,164,90,247,158,182]); //  32 bytes with high entropy
    //console.log("Seed length: ", seed1.length);
    
    const did1 = await initDID(seed1);
    const did2 = await initDID(seed2);
    
    const cid1 = await addSignedObject({id: 1, msg: "Test", prev: 0}, did1, ipfs);
    const cid2 = await addSignedObject({id: 2, msg: "Next test", prev: cid1}, did2, ipfs);
    const cid3 = await addEncryptedObject({id: 3, msg: "Test encrypt", prev: cid2}, did1, ipfs);
    
    // Extract the payload chain
    await fetchItems(cid3, did1, ipfs);

    // Verify signatures
    console.log("Verifying signatures for ...");
    //console.log("cid: ", cid1);
    const jws1 = await ipfs.dag.get(cid1);
    const jws2 = await ipfs.dag.get(cid2);
    //console.log((await did1.verifyJWS(jws1.value)).kid.substring(0,56));
    //console.log(did1.id);
    console.log("Verify first message signed by first user: ",((await did1.verifyJWS(jws1.value)).kid.substring(0,56) == did1.id));
    console.log("Attempt verify first message signed by second user: ", ((await did2.verifyJWS(jws1.value)).kid.substring(0,56) == did2.id));
    console.log("Attempt verify second message signed by first user: ", ((await did1.verifyJWS(jws2.value)).kid.substring(0,56) == did1.id));
    console.log("Verify second message signed by second user: ", ((await did2.verifyJWS(jws2.value)).kid.substring(0,56) == did2.id));

    console.log("Finished.");
}

main().catch(console.error).finally(() => process.exit());
