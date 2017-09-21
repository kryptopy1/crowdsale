var KryptopyToken = artifacts.require("./KryptopyToken.sol")

module.exports = function(deployer) {
  deployer.deploy(KryptopyToken);
};
