var KryptopyToken = artifacts.require("./KryptopyToken.sol");

var debug = true;
var showABI = false;
var showURL = false;

module.exports = function(deployer, network, accounts) {

    var tokenInstance;

    deployer.then(function() {

        return KryptopyToken.new();

    }).then(function(Instance) {

        tokenInstance = Instance;

        if (debug) console.log("KryptopyToken address is: ", tokenInstance.address);
        if (showURL) console.log("Token URL is: " + getEtherScanUrl(network, tokenInstance.address, "token"));
        if (showURL) console.log("Transaction URL is: " + getEtherScanUrl(network, tokenInstance.transactionHash, "tx"));
        if (showABI) console.log("KryptopyToken ABI is: ", JSON.stringify(tokenInstance.abi));
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
//       return performMigration(deployer);
//     })
//     .catch(error => {
//       console.log(error);
//       process.exit(1);
//     });
// };
