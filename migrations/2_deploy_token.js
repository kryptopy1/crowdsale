var Token = artifacts.require("./KryptopyToken.sol");
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
    var _minRequired = 2;
    var _listOfOwners;

    if (network == "development") {
        _listOfOwners = [accounts[1], accounts[2], accounts[3]];
    } else if (network == "test") {
        _listOfOwners = [accounts[1], accounts[2], accounts[3]];
    // } else if (network == "ropsten") {
    //     var johnRopsten = "0x00";
    //     var stephRopsten = "0x00";
    //     var rickRopsten = "0x00";
    //     _listOfOwners = [johnRopsten, stephRopsten, rickRopsten];
    } else if (network == "mainnet") {
        // you have to manually specify this
        // before you deploy this in mainnet
        // or else this deployment will fail
        var member1 = "0x00";
        var member2 = "0x00";
        var member3 = "0x00";
        _listOfOwners = [member1, member2, member3];
        if (member1 == "0x00" || member2 == "0x00" || member3 == "0x00") {
            throw new Error("MultiSigWallet members are not set properly. Please set them in migration/2_deploy_token.js.");
        }
    }

    /**
     *
     * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
     * Parameters Section Ends
     * ===================================
     *
     */

    var tokenInstance;
    var multisigWalletInstance;

    deployer.then(function() {

        return Token.new();

    }).then(function(Instance) {
        //console.log(Instance);
        tokenInstance = Instance;
        if (debug) console.log("KryptopyToken address is: ", tokenInstance.address);
        if (showURL) console.log("Token URL is: " + getEtherScanUrl(network, tokenInstance.address, "token"));
        if (showURL) console.log("Transaction URL is: " + getEtherScanUrl(network, tokenInstance.transactionHash, "tx"));
        if (showABI) console.log("KryptopyToken ABI is: ", JSON.stringify(tokenInstance.abi));
        if (debug) console.log("===============================================");
        if (debug) console.log("\n\n");
        if (debug) console.log("*************  Deploying MultiSigWallet by Zeppelin  ************** \n");
        return MultiSigWallet.new(_listOfOwners, _minRequired);
    }).then(function(Instance) {
        multisigWalletInstance = Instance;
        if (debug) console.log("MultiSigWallet Parameters are:");
        if (debug) console.log(_listOfOwners, _minRequired);
        if (debug) console.log("MultiSigWallet address is: ", multisigWalletInstance.address);
        if (showURL) console.log("Wallet URL is: " + getEtherScanUrl(network, multisigWalletInstance.address, "address"));
        if (showURL) console.log("Transaction URL is: " + getEtherScanUrl(network, multisigWalletInstance.transactionHash, "tx"));
        if (showABI) console.log("MultiSigWallet ABI is: ", JSON.stringify(multisigWalletInstance.abi));
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
}
