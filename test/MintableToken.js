'use strict';

const assertJump = require('./helpers/assertJump');
var Token = artifacts.require("./helpers/KryptopyTokenMock.sol");

contract('KryptopyToken: MintableToken', function(accounts) {

  var _tokenName = "Kryptopy Token";
  var _tokenSymbol = "KPY";
  var _tokenDecimals = 10;
  var _tokenInitialSupply = 5000000 * Math.pow(10, _tokenDecimals);
  var decimals = _tokenDecimals;
  var instance = null;

  function tokenInSmallestUnit(tokens, _tokenDecimals) {
    return tokens * Math.pow(10, _tokenDecimals);
  }

  beforeEach(async() => {
    instance = await Token.new();
  });

  it('Creation: should return the correct totalSupply after construction', async function() {
    let totalSupply = await instance.totalSupply();
    assert.equal(totalSupply, _tokenInitialSupply);
  });

  it('Creation: should return the correct balance of admin after construction', async function() {
    let adminBalance = await instance.balanceOf.call(accounts[0]);
    assert.equal(adminBalance, _tokenInitialSupply);
  });

  it('Creation: should return correct token meta information', async function() {
    let name = await instance.name.call();
    assert.strictEqual(name, _tokenName, "Name value is not as expected.");

    let decimal = await instance.decimals.call();
    assert.strictEqual(decimal.toNumber(), _tokenDecimals, "Decimals value is not as expected");

    let symbol = await instance.symbol.call();
    assert.strictEqual(symbol, _tokenSymbol, "Symbol value is not as expected");
  });

  it('Transfer: ether transfer to token address should fail.', async function() {
      try {
          await web3.eth.sendTransaction({ from: accounts[0], to: instance.address, value: web3.toWei("10", "Ether") });
      } catch (error) {
          return assertJump(error)
      }
      assert.fail('should have thrown exception before');
  });

  it('Mint: Token minting should succeed only if owner is the minting', async function() {
    await instance.mint(accounts[0], 5000000 * Math.pow(10, _tokenDecimals));
    let receiverBalance = await instance.balanceOf(accounts[0]);
    assert.equal(receiverBalance, 10000000 * Math.pow(10, _tokenDecimals), "Receiver balance should have been " + tokenInSmallestUnit(10000000) + ".");
  });

  it('Mint: Token minting should not be able to exceed TokenCap', async function() {
    await instance.mint(accounts[0], 100000000 * Math.pow(10, _tokenDecimals));
    let receiverBalance = await instance.balanceOf(accounts[0]);
    assert.equal(receiverBalance, 5000000 * Math.pow(10, _tokenDecimals), "Receiver balance should have been " + tokenInSmallestUnit(5000000) + ".");
  });

  it('Mint: Mint agent must be able to close minting.', async function() {
    await instance.mint(accounts[2], 100 * Math.pow(10, _tokenDecimals), { from: accounts[0] });

    let receiverBalance = await instance.balanceOf(accounts[2]);
    assert.equal(receiverBalance, 100 * Math.pow(10, _tokenDecimals), "Receiver balance should have been " + tokenInSmallestUnit(100) + ".");
    await instance.finishMinting({ from: accounts[0] });
    let mintingFinished = await instance.mintingFinished.call();
    assert.equal(mintingFinished, true, "Minting could not be finished by the mint agent (owner).");
  });

  it('Mint: Mint agent must close minting & should no longer be able to mint anymore.', async function() {
    await instance.mint(accounts[2], 100 * Math.pow(10, _tokenDecimals), { from: accounts[0] });

    let receiverBalance = await instance.balanceOf(accounts[2]);
    assert.equal(receiverBalance, 100 * Math.pow(10, _tokenDecimals), "Receiver balance should have been " + tokenInSmallestUnit(100) + ".");
    await instance.finishMinting({ from: accounts[0] });
    let mintingFinished = await instance.mintingFinished.call();
    assert.equal(mintingFinished, true, "Miniting could not be finished by the mint agent (owner).");

    try {
        await instance.mint(accounts[2], 100 * Math.pow(10, _tokenDecimals), { from: accounts[0] });
    } catch (error) {
        return assertJump(error);
    }
    assert.fail('should have thrown exception before');

  });

  it('Mint: FinishMinting call from non-mint-agents should fail.', async function() {
    await instance.mint(accounts[2], 100 * Math.pow(10, _tokenDecimals), { from: accounts[0] });

    let receiverBalance = await instance.balanceOf(accounts[2]);
    assert.equal(receiverBalance, 100 * Math.pow(10, _tokenDecimals), "Receiver balance should have been " + tokenInSmallestUnit(100) + ".");
    try {
        await instance.finishMinting({ from: accounts[3] });
    } catch (error) {
        return assertJump(error);
    }
    assert.fail('should have thrown exception before');

  });

});
