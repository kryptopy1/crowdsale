var MultiSigWallet = artifacts.require("./MultiSigWallet.sol");

var debug = true;
var showABI = false;
var showURL = false;

module.exports = function(deployer, network, accounts) {

    /**
     *
     * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
     * Parameters Section Starts
     * ===================================
     *
     */

      // /**
      //  * MultiSigWallet parameters
      //  * =====================================
      //  * Here you will set your MultiSigWallet parameters where you will be collecting the contributed ethers
      //  * here you have to mention the list of wallet owners (none of them must be 0)
      //  * and the minimum approvals required to approve the transactions.
      //  */
      var _minRequired = 3;
      var _listOfOwners;

      if (network == "development") {
          _listOfOwners = [accounts[1], accounts[2], accounts[3]];
      } else if (network == "test") {
          _listOfOwners = [accounts[1], accounts[2], accounts[3]];
      } else if (network == "mainnet") {
          // you have to manually specify this
          // before you deploy this in mainnet
          // or else this deployment will fail
          var member1 = "0x8d3FA81120fab5C7eE4aD04beA7DE4B0c32C4B50"; // Nicolas
          var member2 = "0xbECBA759c08280Bfd6467C2eCd91d109838f5137"; // Cody
          var member3 = "0x2FB24A2F8377867D0DeaC4Ee3D655771e51Fc3BA"; // Rob
          _listOfOwners = [member1, member2, member3];
          if (member1 == "0x00" || member2 == "0x00" || member3 == "0x00") {
              throw new Error("MultiSigWallet members are not set properly. Please set them in migration/2_deploy_contracts.js.");
          }
      }

    /**
     *
     * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
     * Parameters Section Ends
     * ===================================
     *
     */

    var multisigWalletInstance;

    deployer.then(function() {

        return MultiSigWallet.new(_listOfOwners, _minRequired);

    }).then(function(Instance) {

      multisigWalletInstance = Instance;

      if (debug) console.log("MultiSigWallet Parameters are:");
      if (debug) console.log(_listOfOwners, _minRequired);
      if (debug) console.log("MultiSigWallet address is: ", multisigWalletInstance.address);
      if (showURL) console.log("Wallet URL is: " + getEtherScanUrl(network, multisigWalletInstance.address, "address"));
      if (showURL) console.log("Transaction URL is: " + getEtherScanUrl(network, multisigWalletInstance.transactionHash, "tx"));
      if (showABI) console.log("MultiSigWallet ABI is: ", JSON.stringify(multisigWalletInstance.abi));
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
