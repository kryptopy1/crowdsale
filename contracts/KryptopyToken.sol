pragma solidity ^0.4.15;

/**
* This smart contract code is Copyright 2017 Kryptopy (http://Kryptopy.com)
*/

import "zeppelin-solidity/contracts/token/MintableToken.sol";
import "zeppelin-solidity/contracts/token/PausableToken.sol";

/**
 * @title KryptopyToken
 *
 * @dev An ERC20 Token that can be minted. All tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `StandardToken` functions.
 *
 * KPY Tokens have 10 decimal places. The smallest meaningful (and transferable)
 * unit is therefore 0.0000000001 KPY. This unit is called a 'nanoKPY'.
 *
 * 1 KPY = 1 * 10**10 = 1000000000 nanoKPY.
 *
 * Maximum total KPY supply is 40 Million.
 * This is equivalent to 40000000 * 10**10 = 4e+17 krypis.
 *
 * KPY are mintable on demand (as they are being purchased), which means that
 * 40 Million is the maximum.
 *
 * Tokens are initially paused until crowdsale first milestone has been reached.
 */
contract KryptopyToken is MintableToken, PausableToken {

  string public constant name = "Kryptopy Token";
  string public constant symbol = "KPY";
  string public constant version = "1.0";
  uint8 public constant decimals = 10;

  //** Maximum total number of tokens ever created */
  uint256 public constant tokenCap = 40000000 * (10 ** uint256(decimals));
  //** Initial Supply */
  uint256 public constant tokenReserve = 5000000 * (10 ** uint256(decimals));

  /**
   * @dev Contructor that gives msg.sender all of existing tokens.
   */
  function KryptopyToken() MintableToken() {
    owner = msg.sender;
    totalSupply = tokenReserve;
    balances[owner] = totalSupply;
    Mint(owner, totalSupply);
    pause();
  }

  /**
   * @dev override MintableToken to check tokenCap and add a Transfer event from 0x0 to owner.
   * @param _to The address that will receive the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(address _to, uint256 _amount) onlyOwner canMint returns (bool success) {
    if (totalSupply.add(_amount) > tokenCap) {
      return false;
    }
    totalSupply = totalSupply.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    Mint(_to, _amount);
    Transfer(0x0, owner, _amount);
    Transfer(owner, _to, _amount);
    return true;
  }
  
}
