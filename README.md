# IpldEventLog

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.2, in collaboration with Filecoin and livetree (https://www.livetree.com/). For more information you may email ag@livetree.com.
Initial project build done during November and December 2020.

Purpose of the project was to test use of IPLD to store and retrieve video application-generated events.
with a view to incorporating IPLD<=>IPFS<=>Filecoin storage and retreival of structured meta-data related to livetree video data and user activity:
a) Item Data (title, genre, actors, scenes ...);
b) Audience Data (individual, community memberships, active rooms ...);
c) Tracking Data (view times, view duration, ad-clicks ...).

-- INITIAL BUILD --

Initial build was 'headless' npm .js script [./headless/ipld.test.headless.js] which demonstrated simple operation connecting to IPLD with different DIDs (digital identities), saving chained data (DAG) of signed and encrypted data, confirming signatories and recovering/decrypting data sequentially from the chain.

This can be downloaded into a project folder following by 'npm install' and run 'node ipld.test.headless.js'.

Care needs to be taken to install the correct version of modules (multiformats@3.0.3 ; @ceramicnetwork/key-did-resolver@0.2.0 and key-did-provider-ed25519@0.1.2 were required as at 27-11-2020). Later versions of some modules contain breaking updates. 
Care needs to be taken unpacking imported objects [for example if you use "const DID = require('dids')" you then need "const did = new DID.DID({ provider })" to unpack the DID object.]; 
Care also required in terminology when reading material around IPLD, for example, the term 'did' is sometimes used to refer to a did object or the the did.id string.

We noted that encryption with multiple did's is implemented with multiple saved instances of the data ... the data is not multi-encrypted, multiple single-encrypted data elements are created,
which requires increased storage usage. Further the data links are encypted with the data inside each DAG block, meaning that record-level access restrictions cannot be applied.

-- CURRENT STATUS --

This step was intended to create an npm module as a service. We wrote a simple one-page Angular application to interface with the service.

*Issues*

1. The modules provided for IPLD and IPFS currently do not compile under Angular. We identified and  resolved issues with the [dids] service, to be able create a DID from a given seed. See issue reported here: [https://github.com/dignifiedquire/borc/issues/49]
However, the exported functions from most of the other modules would need to be re-written so as to able to be imported/required by both CommonJS and ES6 style implementations. This work is outside the remit/budget of this phase of the project. The import for those modules has been commented out, and interaction with IPLD has been replicated using window.localStorage utilities instead.
2. The encryption process encrypts both the data and the links. This makes it impossible to traverse the chain of data unless you have access to every record. It is therefore not possible to limit access on a record-by-record basis; many use-cases would require such record-level encryption;
3. For multiple users, an encrypted data element is stored for each potential user. This is inefficient.
4. Access rights cannot be added or removed. For a new access user, a new set of data elements would need to be replicated and stored. Access rights cannot be removed ... the data elements encrypted for a specific user would need to be removed from storage.
5. The record set is read from the end-node backwards (LIFO). The end node for the chain must be stored somewhere, and continually updated as new records are added. A third-party cannot access the full chain without knowing what the end-node is, so every participant who can add data must update (somewhere ... this is not defined) the shared end-node record. Tools which add records need to update this end-node record There is a risk of adding 'ghost' entries if the process to update the end-node record fails (for any reason).
6. Distributed updates would appear to be hard to control. Two new nopes could be chained on to the same end-node creating two read-paths. All end nodes would need to recorded so as to be able to recover the full record set.
7. Data recovery from filecoin is currently challenging as you need to also know which miner(s) stored the data so that you can recover the data from them. This does not appear to be stored with the dag so it is difficult to recover the full data chain if it has been stored across multiple storage miners. 


-- INSTALLATION --

This test harness can be downloaded from git repo [enter repo], and then following the normal steps for an Angular download & compile:
a) Clone the repo to a local directory;
b) Install node modules in that directory (`npm install -i`)
c) Attempt compile (`ng serve -o`) and resolve any compilation issues (normally by installing required/missing modules or versions via `npm install -i [modulename@version]`. 
d) Eventually ng serve will compile and bring up the test page to http://localhost:4200

-- OPERATION --

Saving, signing and encrypting data operates on a DID (a cryptographic public key). This can either be provided directly (into the DID box) or generated from a Seed phrase, by entered the
Seed phrase and pressing the Get DID button.

JSON objects representing the events can be entered in 'chunks' or one-by-one and then sent for storage (the Send Events button).

The full chain (working back from the last sent data) can be retreived by pressing the Fetch Events button.

-- NEXT STEPS --

Next steps are pending update to IPLD and IPFS modules. Once these can be compiled within the project, next steps are to:
a) Complete integration and testing of the IPLD/IPFS interface to allow storage and retrieval of encrypted chained structured data (continue conversion of functions in [./headless/ipld.test.headless.js] into the service [./src/app/_services/ipld.service.js];
b) Extend the service to write the data from IPFS to filecoin proper (likely localnet instance to avoid on-chain charges). This will invole converting the functions built for the Slingshot excercise
(which can be found in [./src/app/_services/azure-to-filecoin_v5.js] into the the service defined in [./src/app/_services/ipld.service.js];
c) Investigate options to provide row-level security while still allowing access to the end-to-end data chain (DAG);
d) Integrate videojs functionality and build the hooks from that to push video-based events to IPLD for storage.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.


## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
