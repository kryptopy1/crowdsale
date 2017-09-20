var KryptopyToken = artifacts.require("KryptopyToken");

contract('KryptopyToken', function(accounts) {

  it("should have 5m KPY in the owners account", function() {
    return KryptopyToken.deployed().then(function(instance) {
      return instance.balanceOf.call(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 50000000000000000, "5m KPY wasn't in the first account");
    });
  });

  it("should start off paused", function() {
    return KryptopyToken.deployed().then(function(instance) {
      return instance.paused.call();
    }).then(function(paused) {
      assert.equal(paused, true, "wasn't paused");
    });
  });

  it("should be unpaused by owner", function() {
    return KryptopyToken.deployed().then(function(instance) {
      kryptopyToken = instance;
      return kryptopyToken.unpause();
    }).then(function() {
      return kryptopyToken.paused.call();
    }).then(function(paused) {
      assert.equal(paused, false, "wasn't uppaused");
    });
  });

  it("should send coin correctly", function() {
    var kryptopy;

    // Get initial balances of first and second account.
    var account_one = accounts[0];
    var account_two = accounts[1];

    var account_one_starting_balance;
    var account_two_starting_balance;
    var account_one_ending_balance;
    var account_two_ending_balance;

    var amount = 50000000000000000;

    return KryptopyToken.deployed().then(function(instance) {
      kryptopyToken = instance;
      return kryptopyToken.balanceOf.call(account_one);
    }).then(function(balance) {
      account_one_starting_balance = balance.toNumber();
      return kryptopyToken.balanceOf.call(account_two);
    }).then(function(balance) {
      account_two_starting_balance = balance.toNumber();
      return kryptopyToken.transfer(account_two, amount, {from: account_one});
    }).then(function() {
      return kryptopyToken.balanceOf.call(account_one);
    }).then(function(balance) {
      account_one_ending_balance = balance.toNumber();
      return kryptopyToken.balanceOf.call(account_two);
    }).then(function(balance) {
      account_two_ending_balance = balance.toNumber();

      assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
      assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
    });
  });

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
      return kryptopyToken.mint(accounts[0], 400000000000000000);
    }).then(function(result) {
      return kryptopyToken.balanceOf.call(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 400000000000000000, "40m KPY wasn't in the first account");
    });
  });
});
