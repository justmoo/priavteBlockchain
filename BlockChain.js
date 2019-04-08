/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {

    constructor() {
        this.bd = new LevelSandbox.LevelSandbox();
        this.generateGenesisBlock();
    }

    // Helper method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
   async generateGenesisBlock(){
       let self= this;
       try{
        if(await self.getBlockHeight() <= 0 ){ // Changed it to <= instead of == 
            await self.addBlock( new Block.Block("First block in the chain - Genesis block"));
        }
            }catch(err) {
        console.log(err)
        }
    }

    // Get block height, it is a helper method that return the height of the blockchain
   async getBlockHeight() {
        let self =this;
        let height = await self.bd.getBlocksCount();
        let length = await height.length -1 ; // now it shows the right number 
        
        return length;
       
     }

    // Add new block
    async addBlock(newBlock) {
       let self = this;
       
        try{
                newBlock.time = new Date().getTime().toString().slice(0,-3);
                newBlock.height= await self.getBlockHeight() + 1; // done
                if(await self.getBlockHeight() > 0){
                        let previousBlock = await self.getBlock(await self.getBlockHeight() - 1 ); // Fixed some Json.parse done
                        newBlock.previousBlockHash = previousBlock.hash; //fixed await
                }
            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
            self.bd.addLevelDBData( await newBlock.height, await JSON.stringify(newBlock).toString());
             return newBlock;
        }catch(err) {
             console.log(err)
           }

       
       }
    

    // Get Block By Height
     async getBlock(key) {
         try{
        let self= this;
        let value = JSON.parse(await self.bd.getLevelDBData(key));
        return value;
         }catch(err){
             console.log(err);
         }
    }

    
    // Validate if Block is being tampered by Block Height
     async validateBlock(height) {
         let self = this;
        let block = await self.getBlock(height);
      // get block hash
        let blockHash = block.hash;
      // remove block hash to test block integrity
        block.hash = '';
      // generate block hash
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
      // Compare
      if (blockHash===validBlockHash) {
          return true;
        } else {
          console.log('Block #'+ height +' invalid hash:\n'+blockHash+'<>'+validBlockHash);
          return false; 
        }
    }

    // Validate Blockchain
     async validateChain() {
         let self= this;
         let errorLog = [];
         let BlockHeight = await self.getBlockHeight();
        for (var i = 1; i <= BlockHeight; i++) { // from one because gensis block doesn't have previous block
        // validate block
         let checkTheBlock = await self.validateBlock(i); // fixed error here , it was giving me always false 
         
        if (!checkTheBlock)errorLog.push(await self.getBlock(i)); // fixed it 
        // compare blocks hash link
        let blockHash = await self.getBlock(i-1).hash;
        let previousHash = await self.getBlock(i).previousBlockHash; 
        if (blockHash!==previousHash) {
          errorLog.push(await self.getBlock(i));
        }
      }

      if ( errorLog.length > 0) {
        console.log('Block errors = ' + errorLog.length);
        console.log('Blocks: '+errorLog);
      } else {
        console.log('No errors detected');
      }
      
      return errorLog;
    }

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.bd.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
                resolve(blockModified);
            }).catch((err) => { console.log(err); reject(err)});
        });
    }
   
}

module.exports.Blockchain = Blockchain;
