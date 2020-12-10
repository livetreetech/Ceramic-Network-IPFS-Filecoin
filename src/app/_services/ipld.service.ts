import { Injectable } from '@angular/core';
// import IPFS from 'ipfs';
// import dagJose from 'dag-jose';
// import legacy from 'multiformats'; // Need version multiformats@3.0.3
import { DID } from 'dids';
import KeyResolver  from '@ceramicnetwork/key-did-resolver'; // *** Undeclared dependency *** Need version @ceramicnetwork/key-did-resolver@0.2.0 at least
import { Ed25519Provider } from 'key-did-provider-ed25519';

const localStorage = window.localStorage;

@Injectable({
  providedIn: 'root'
})

export class IpldService {

  constructor() { 
      // Set-up ipfs intance [*** pending resolution of debug errors in export from libs ***()]
  }

  private str2ab(str: string) {
      console.log("str: ", str);
      let arrayBuffer = new ArrayBuffer(32);
      let newUint = new Uint8Array(arrayBuffer);
      newUint.forEach((_, i) => {
        newUint[i] = str.charCodeAt(i);
      });
      return newUint;
  }

  public async createDID(seed: string): Promise<string> {
    console.log("seed: ", seed);
    const provider = new Ed25519Provider(this.str2ab(seed));
    const did = new DID({ provider });
    const keyres = await KeyResolver.getResolver();
    await did.setResolver(keyres);
    await did.authenticate() ;   
    // console.log("Connected with : ", did.id); 
    return(did.id);
   } 

   public async initIPFS() {
    // multiformats.multicodec.add(dagJose.default);
    // const dagJoseFormat = legacy(multiformats, dagJose.default.name);
    //console.log("Starting IPFS.");
    // const ipfs = await IPFS.create({ ipld: { formats: [dagJoseFormat] } });
    //return ipfs ;   
    return 0 ;   
  }

  public async addSignedObject(payload: any, did: any, ipfs: any) {
    /*
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
    */
    return 0;
  }

  public async fetchItem(cid: any, did: any, ipfs: any) {
    /*
    const item = (await ipfs.dag.get(cid)).value;
    var cleartext;
    //console.log("item: ", item);
    if (typeof item.ciphertext != "undefined") {
       cleartext = await did.decryptDagJWE(item);
    } else {
        cleartext = (await ipfs.dag.get(cid, { path: '/link' })).value;
    };
    return cleartext;
    */
    return 0;
  }

  public async fetchItems(cid: any, did: any, ipfs: any) {
    /*
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
    */
    return 0;
  }


  public async sendEvent(did: string, event: string): Promise<string> {
    // Use local storage until IPFS/IPLD module import errors resolved
    var event_stack_size = localStorage.getItem("event_stack_size");
    if (did) {
      if(event_stack_size) {
        localStorage.setItem("event_stack_" + (Number(event_stack_size) + 1).toString(), event);
        localStorage.setItem("event_stack_size", (Number(event_stack_size) + 1).toString());
        //console.log("key_write: ", "event_stack_size_" + (Number(event_stack_size) + 1).toString() + ":" + event);
      } else {
        localStorage.setItem("event_stack_1", event);
        localStorage.setItem("event_stack_size", "1");
        //console.log("key_write: ", "event_stack_size_1" + ":" + event);
      }
      return("Event sent.");
     } else {
      return("No DID provided.");      
     }
   } 
  
  public async fetchEvents(did:string): Promise<any> {
    // Use local storage until IPFS/IPLD module import errors resolved
    var event_stack_size = localStorage.getItem("event_stack_size");
    var msg = "";
    var eventLogs = "";

    if (did) {
      if(event_stack_size) {
        for(var i=Number(event_stack_size); i > 0; i--) {
          //console.log("retreiving: ", "event_stack_" + i.toString() + ":" + localStorage.getItem("event_stack_size_" + i.toString()));
          eventLogs += localStorage.getItem("event_stack_" + i.toString()) + "\r";
        }
        msg = event_stack_size + " events retrieved.";
      } else {
        // No events stored yet.
        msg = "No events stored."
      }
    } else {
      msg = "No DID provided.";      
    }
    return({events: eventLogs, msg: msg});
   }

  public async clearEvents(did: string): Promise<string> {
    // Use local storage until IPFS/IPLD module import errors resolved
    var event_stack_size = localStorage.getItem("event_stack_size");
    if (did) {
      localStorage.clear();
    }
    return("Events cleared.");
  }
}
