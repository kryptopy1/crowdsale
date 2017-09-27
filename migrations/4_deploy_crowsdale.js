var KryptopyCrowdsale = artifacts.require("./KryptopyCrowdsale.sol");

var debug = true;
var showABI = true;
var showURL = true;

const duration = {
  seconds: function(val) { return val},
  minutes: function(val) { return val * this.seconds(60) },
  hours:   function(val) { return val * this.minutes(60) },
  days:    function(val) { return val * this.hours(24) },
  weeks:   function(val) { return val * this.days(7) },
  years:   function(val) { return val * this.days(365)}
};

module.exports = function(deployer, network, accounts) {

    /**
     *
     * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
     * Parameters Section Starts
     * ===================================
     *
     */

       // /**
       //  * Crowdsale parameters
       //  * =====================================
       //  * Here you will set your Crowdsale parameters
       //  */
      const _startTime = new web3.BigNumber(web3.eth.getBlock('latest').timestamp); // blockchain block number where the crowdsale will commence. Here I just taking the current block that the contract and setting that the crowdsale starts two block after
      const _endTime = _startTime.plus(2592000);          // blockchain block number where it will end. 300 is little over an hour.
      const _rate = new web3.BigNumber(265);                    // rate of ether to KrytopyToken in wei
      const _cap = new web3.BigNumber(12500000000000000000000); // max amount of funds raised in wei
      const _goal = new web3.BigNumber(2500000000000000000000); // minimum amount of funds to be raised in wei

    /**
     *
     * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
     * Parameters Section Ends
     * ===================================
     *
     */

    var crowdsaleInstance;

    deployer.then(function() {

      return KryptopyCrowdsale.new(_startTime, _endTime, _rate, _goal, _cap, "0xc4c7497fbe1a886841a195a5d622cd60053c1376");

    }).then(function(Instance) {

      crowdsaleInstance = Instance;

      if (debug) console.log(_startTime, _endTime, _rate, _goal, _cap, "0xc4c7497fbe1a886841a195a5d622cd60053c1376");
      if (debug) console.log("KryptopyCrowdsale address is: ", crowdsaleInstance.address);
      if (showURL) console.log("Crowdsale URL is: " + getEtherScanUrl(network, crowdsaleInstance.address, "address"));
      if (showURL) console.log("Transaction URL is: " + getEtherScanUrl(network, crowdsaleInstance.transactionHash, "tx"));
      if (showABI) console.log("KryptopyCrowdsale ABI is: ", JSON.stringify(crowdsaleInstance.abi));
      if (debug) console.log("===============================================");
      if (debug) console.log("\n\n");

    });


    function getEtherScanUrl(network, data, type) {
        var etherscanUrl;
        if (network == "ropsten") {
            etherscanUrl = "https://" + network + ".etherscan.io";
        } else {
            etherscanUrl = "https://etherscan.io";
        }
        if (type == "tx") {
            etherscanUrl += "/tx";
        } else if (type == "token") {
            etherscanUrl += "/token";
        } else if (type == "address") {
            etherscanUrl += "/address";
        }
        etherscanUrl = etherscanUrl + "/" + data;
        return etherscanUrl;
    }

    function etherInWei(x) {
        return web3.toBigNumber(web3.toWei(x, 'ether')).toNumber();
    }


    function tokenPriceInWeiFromTokensPerEther(x) {
        if (x == 0) return 0;
        return Math.floor(web3.toWei(1, 'ether') / x);
    }

    function getUnixTimestamp(timestamp) {
        var startTimestamp = new Date(timestamp);
        return startTimestamp.getTime() / 1000;
    }


    function tokenInSmallestUnit(tokens, _tokenDecimals) {
        return tokens * Math.pow(10, _tokenDecimals);
    }
};

// module.exports = function(deployer, network, accounts) {
//   deployer
//     .then(function() {
//       return performMigration(deployer, network, accounts);
//     })
//     .catch(error => {
//       console.log(error);
//       process.exit(1);
//     });
// };
