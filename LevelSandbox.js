/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {

    constructor() {
        this.db = level(chainDB);
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key){
        let self = this;
        return new Promise(function(resolve, reject) {

            self.db.get(key, function(err, value) {
                if (err) return console.log('Not found!', err);
                console.log('Value = ' + value);
                resolve(value);
              })
        });
    }

    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        let self = this;
        return new Promise(function(resolve, reject) { 
            // Add your code here, remember in Promises you need to resolve() or reject() 
            self.db.put(key, value, function(err) {
                if (err) return console.log('Block ' + key + ' submission failed', err);
                resolve(value);
              })
        });
    }

    // Method that return the height
    getBlocksCount() {
        let self = this;
        let dataArray =[];
        return new Promise(function(resolve, reject){
            // Add your code here, remember in Promises you need to resolve() or reject()
            self.db.createReadStream()
            .on('data', function (data) {
                dataArray.push(data);
            })
            .on('error', function (err) {
                reject(err)
            })
            .on('close', function () {
                resolve(dataArray);
            })
        
        })
    }
        

}

module.exports.LevelSandbox = LevelSandbox;
