# PIR
Projet d'innovation recherche de 2A. <br>
Développement d'une interface web pour interagir plus simplement avec une blockchain.

# Menu
[Prerequisites](#prerequisites)

[Launching the blockchain](#start-the-blockchain)

[Deploying the Smart Contract](#deploy-the-smart-contract)

[Start the Server](#start-the-server)

[Using the server](#using-the-server)



## Installation

### Prerequisites
<ul>
  <li><a href="https://besu.hyperledger.org/en/stable/HowTo/Get-Started/Install-Binaries/">Besu</a></li>
  <li><a href="https://nodejs.org/en/">Node Js</a></li>
</ul>
Other packages need to be installed, use npm install.



### Start The Blockchain
How to launch the 4 nodes <br>
The full tutorial is available <a href="https://besu.hyperledger.org/en/stable/Tutorials/Private-Network/Create-IBFT-Network/">here<a> , but for a quickstart, use <a href="https://github.com/ColineVL/PIR/tree/master/IBFT-Network">IBFT-Network<a>, and follow these steps:
  <ol>
    <li>open 4 consoles,cd to the paths Node-1,-2,-3 and -4. </li>
    <li> start by launching the bootnode(Node-1), enter the following command : <br>
      besu --data-path=data --genesis-file=../genesis.json --rpc-http-enabled --rpc-ws-enabled --rpc-http-api=ETH,NET,IBFT,WEB3,PRIV,PERM,ADMIN --rpc-ws-api=ETH,NET,IBFT,WEB3,PRIV,PERM,ADMIN --host-whitelist="*" --rpc-http-cors-origins=“all”  </li>
    <li> in Node-2 : <br>
      besu --data-path=data --genesis-file=../genesis.json --bootnodes=enode://39ac2c24db6c07ba5b2b39658d4fd1c9b51c813a4c5975ca53a0080520b7c6f5ce5d0f6e651193d216bfcfccbf378d4601266f8b58219e5f606ef0c0a1a6b4eb@127.0.0.1:30303 --p2p-port=30304 --rpc-http-enabled --rpc-http-api=ETH,NET,IBFT --host-whitelist="*" --rpc-http-cors-origins="all" --rpc-http-port=8547 </li>
    <li> in 3 : <br>
      besu --data-path=data --genesis-file=../genesis.json --bootnodes=enode://39ac2c24db6c07ba5b2b39658d4fd1c9b51c813a4c5975ca53a0080520b7c6f5ce5d0f6e651193d216bfcfccbf378d4601266f8b58219e5f606ef0c0a1a6b4eb@127.0.0.1:30303 --p2p-port=30305 --rpc-http-enabled --rpc-http-api=ETH,NET,IBFT --host-whitelist="*" --rpc-http-cors-origins="all" --rpc-http-port=8548  </li>
    <li> 4 : <br>
      besu --data-path=data --genesis-file=../genesis.json --bootnodes=enode://39ac2c24db6c07ba5b2b39658d4fd1c9b51c813a4c5975ca53a0080520b7c6f5ce5d0f6e651193d216bfcfccbf378d4601266f8b58219e5f606ef0c0a1a6b4eb@127.0.0.1:30303 --p2p-port=30306 --rpc-http-enabled --rpc-http-api=ETH,NET,IBFT --host-whitelist="*" --rpc-http-cors-origins="all" --rpc-http-port=8549   </li>
  </ol>
   Finally, an easy to verify the blockhain is up and running, simply insert the following in a new console (should indicate 4 nodes): <br>
  curl -X POST --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' localhost:8545
  <br>
  
  To further simplify launching the nodes, you can copy the command in <a href="https://github.com/ColineVL/PIR/tree/master/Start_Nodes_Faster">Start_Nodes_Faster<a>, the previous steps will be done automatically.

### Deploy the Smart Contract

The server's only use being to test and handle the smart contract, you must deploy it before using the server. A NodeJs (<a href="https://github.com/ColineVL/PIR/tree/master/Solidity/Deployment.js">here<a>) file has been added for this, you must simply launch <i>node Deployment.js</i>. If the blockchain is up and running, this will deploy the smart contract to an Ethereum address. Before continuing, please check that this address is the one in <a href="https://github.com/ColineVL/PIR/tree/master/Server/js/EventsModule.js">Events Module<a> and <a href="https://github.com/ColineVL/PIR/tree/master/Server/js/SignedTransactionModule.js">Signed Transaction Module<a> , if not replace these addresses. You can now proceed to Launch the server.


### Start the Server
Simply open a new terminal window, navigate to the correct path and enter <i>node server.js</i>.


Be sure the blockchain is up and running beforehand.
The blockchain's address must coincide with the ones in the files.

### Using the Server
Simply connect to localhost:8089 (or IP_OF_THE_SERVER:8089), using a browser. 

You can the navigate through the server and try buying/selling references. To connect, you can use these three test accounts with pre-filled wallets. To correctly test functionnalities out, it is recommended to read the article prior to using this tool, and avoid buying from one self (sell from an account, then from another machine buy from another account).

Test account private keys: (more details in the <a href="https://github.com/ColineVL/PIR/tree/master/IBFT-Network/genesis.json">Genesis<a>
  <ul>
  <li>"8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63"</li>
  <li>"c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3"</li>
  <li>"ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f"</li>
</ul>

A typical test could be :
<ul>
  <li>Sell from account 1</li>
  <li>Buy from account 2</li>
  <li>Respond honestly from account 1</li>
  <li>Respond honestly from account 2</li>
  <li>Finish the transaction from account 1 and release the key</li>
  <li>Check to see you have the same key from 2's perspective</li>
</ul>
