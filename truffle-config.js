require('babel-register');
require('babel-polyfill');

var provider;
var HDWalletProvider = require('truffle-hdwallet-provider');
var mnemonic = '[REDACTED]';

if (!process.env.SOLIDITY_COVERAGE){
  provider = new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/')
}

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*' // Match any network id
    },
    live: {
      network_id: 1,
      gas: 4612388,
      gasPrice: 25000000000,
      from: "0x00"
    },
    ropsten: {
      host: 'localhost',
      port: 8545,
      network_id: '3', // Match any network id
      gas: 4612388,
      gasPrice: 25000000000,
      from: "0x00"
    },
    rinkeby: {
      provider: provider,
      network_id: '4',
    },
    coverage: {
      host: "localhost",
      network_id: "*",
      port: 8555,
      gas: 0xfffffffffff,
      gasPrice: 0x01
    }
  }
}
