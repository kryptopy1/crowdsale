'use strict';

const assertJump = require('./helpers/assertJump');
var Token = artifacts.require('./helpers/KryptopyTokenMock.sol');

contract('KryptopyToken: StandardToken', function(accounts) {
  var instance = null;

  beforeEach(async() => {
      instance = await Token.new();
  });

  it('should return the correct totalSupply after construction', async function() {
    let instance = await Token.new();
    let totalSupply = await instance.totalSupply();

    assert.equal(totalSupply, 50000000000000000);
  });

  it('should return the correct allowance amount after approval', async function() {
    let instance = await Token.new();
    await instance.approve(accounts[1], 100);
    let allowance = await instance.allowance(accounts[0], accounts[1]);

    assert.equal(allowance, 100);
  });

  it("should start off paused", async function() {
    let instance = await Token.new();
    let paused = await instance.paused();

    assert.equal(paused, true);
  });

  it("should be unpaused by owner", async function() {
    let instance = await Token.new();
    await instance.unpause();

    let paused = await instance.paused()
    assert.equal(paused, false);
  });

  it('should return correct balances after transfer', async function() {
    let instance = await Token.new();
    await instance.unpause();

    await instance.transfer(accounts[1], 100);
    let balance0 = await instance.balanceOf(accounts[0]);
    assert.equal(balance0, 49999999999999900);

    let balance1 = await instance.balanceOf(accounts[1]);
    assert.equal(balance1, 100);
  });

  it('should return false when trying to transfer more than balance', async function() {
    let instance = await Token.new();
    await instance.unpause();

    let status = await instance.transfer.call(accounts[1], 50000000000000100);
    assert.equal(status, false);
  });

  it('should return correct balances after transfering from another account', async function() {
    let instance = await Token.new();
    await instance.unpause();
    await instance.approve(accounts[1], 100);
    await instance.transferFrom(accounts[0], accounts[2], 100, { from: accounts[1] });

    let balance0 = await instance.balanceOf(accounts[0]);
    assert.equal(balance0, 49999999999999900);

    let balance1 = await instance.balanceOf(accounts[2]);
    assert.equal(balance1, 100);

    let balance2 = await instance.balanceOf(accounts[1]);
    assert.equal(balance2, 0);
  });

  it('should return false when trying to transfer more than allowed', async function() {
    let instance = await Token.new();
    await instance.unpause();
    await instance.approve(accounts[1], 99);

    let status = await instance.transferFrom.call(accounts[0], accounts[2], 100, { from: accounts[1] });
    assert.equal(status, false);
  });

});
