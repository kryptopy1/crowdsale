var KryptopyToken = artifacts.require("KryptopyToken");

contract('KryptopyToken', function(accounts) {

  it("should be able to mint another 5m", function() {
    return KryptopyToken.deployed().then(function(instance) {
      kryptopyToken = instance;
      return kryptopyToken.mint(accounts[0], 50000000000000001);
    }).then(function() {
      return kryptopyToken.balanceOf.call(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 50000000000000001, "50000000.0000000001 KPY wasn't in the first account");
    });
  });

  it("should not be able to mint another 40m", function() {
    return KryptopyToken.deployed().then(function(instance) {
      kryptopyToken = instance;
      return kryptopyToken.mint.call(accounts[0], 400000000000000000);
    }).then(function(result) {
      assert.equal(result, false, "was able to mint another 40m");
    });
  });
  
});
