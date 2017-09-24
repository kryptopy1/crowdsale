pragma solidity ^0.4.15;

import "./KryptopyToken.sol";
import "zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/RefundableCrowdsale.sol";

/**
 * @title KryptopyCrowdsale
 * @dev This is a fully fledged crowdsale.
 * The way to add new features to a base crowdsale is by multiple inheritance.
 * In this crowdsale we are providing following extensions:
 * CappedCrowdsale - sets a max boundary for raised funds
 * RefundableCrowdsale - set a min goal to be reached and returns funds if it's not met
 *
 * After adding multiple features it's good practice to run integration tests
 * to ensure that subcontracts works together as intended.
 */
contract KryptopyCrowdsale is CappedCrowdsale, RefundableCrowdsale {

  /*
  *  Events
  */
  event PreICOStarted();
  event PreICOSucceeded();
  event PreICOFailed();
  event ICOStarted();
  event ICOStep1();
  event ICOStep2();
  event ICOStep3();
  event ICOStep4();
  event ICOStep5();
  event ICOStep6();
  event ICOFinished();
  event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

  /*
  *  Constants
  */
  /*
   * - Preparing: All contract initialization calls and variables have not been set yet
   * - Prefunding: We have not passed start time yet
   * - Funding: Active crowdsale
   * - Success: Minimum funding goal reached
   * - Failure: Minimum funding goal not reached before ending time
   * - Finalized: The finalized has been called and succesfully executed
   * - Refunding: Refunds are loaded on the contract for reclaim.
   */
  enum CrowdsaleProgress {
    STARTED,
    STOPPED,
    PREICO,
    ICO0,
    ICO1,
    ICO2,
    ICO3,
    ICO4,
    ICO5,
    GOALSUCCESS,
    GOALFAILED,
    ICOENDED
  }

  /*
  *  Storage
  */
  // in pre-ICO 200 KPY per ether invested we double the investment per ether in pre-ICO
  uint256 public initPreICOBonus = 200000000000000000 wei;
  // in ICO 125 KPY per ether invested we double the investment per ether in ICO
  uint256 public initICOBonus = 125000000000000000 wei;
  // the amount of WEI to remove at each step of the ICO from the Bonuses
  uint256 public bonusStepMin =  25000000000000000 wei;
  // we do not want the contract to start before the start date we put Stopped as initial State to prevent that.
  CrowdsaleProgress public crowdsaleProgress;

  /*
   *  Modifiers
   */
   modifier isState(CrowdsaleProgress _progress) {
       require(_progress == crowdsaleProgress);
       _;
   }

  /*
  * Public functions
  */
  /** Constructor to initialize all variables, including Crowdsale variables
  *  _token Address of the deployed KryptopyToken contract
  * @param _startBlock unix timestamp for start of ICO
  * @param _endBlock unix timestamp for end of ICO
  * @param _rate of ether to KrytopyToken in wei
  * @param _goal minimum amount of funds to be raised in wei
  * @param _cap max amount of funds to be raised in wei
  * @param _wallet Address of the deployed Multisig wallet
  */
  function KryptopyCrowdsale(uint256 _startBlock, uint256 _endBlock, uint256 _rate, uint256 _goal, uint256 _cap, address _wallet)
    CappedCrowdsale(_cap)
    FinalizableCrowdsale()
    RefundableCrowdsale(_goal)
    Crowdsale(_startBlock, _endBlock, _rate, _wallet)
  {
    /*require(_startBlock >= block.number);
    require(_endBlock >= _startBlock);
    require(_rate > 0);
    require(_wallet != 0x0);

    token = createTokenContract(_token);
    startBlock = _startBlock;
    endBlock = _endBlock;
    rate = _rate;
    wallet = _wallet;*/

    //As goal needs to be met for a successful crowdsale
    //the value needs to less or equal than a cap which is limit for accepted funds
    require(_goal <= _cap);
    startPreICO();
  }

  // overridden : Crowdsale.buyTokens(address beneficiary) payable
  function buyTokens(address beneficiary)
    public
    payable
  {
    require(beneficiary != 0x0);
    require(validPurchase());

    uint256 weiAmount = msg.value;

    // get bonus based on step
    // calculate token amount to be created
    uint256 weiAmountPlusBonus = bonus(weiAmount);
    uint256 tokensToSend = weiAmountPlusBonus.mul(rate);

    weiRaised = weiRaised.add(weiAmount);
    setSteps();

    // update state
    token.mint(beneficiary, tokensToSend);
    TokenPurchase(msg.sender, beneficiary, weiAmount, tokensToSend);

    super.forwardFunds();
  }

  /*
  * Internal functions
  */
  // overridden : Crowdsale.createTokenContract()
  function createTokenContract()
    internal
    returns (MintableToken)
  {
    return new KryptopyToken();
  }

  function startPreICO()
    onlyOwner
    internal
  {
    crowdsaleProgress = CrowdsaleProgress.PREICO;
    PreICOStarted();
  }

  function startICO()
    onlyOwner
    isState(CrowdsaleProgress.GOALSUCCESS)
    internal
  {
    crowdsaleProgress = CrowdsaleProgress.ICO0;
    ICOStarted();
    ICOStep1();
  }

  // we double check to make sure the sale is not Stopped or at last step. Last step of ICO is not having any bonuses
  // function to calculate bonus based on step of the ICO or pre-ICO
  function bonus(uint256 weiAmount)
    internal
    returns (uint256 bonus)
  {
    if(crowdsaleProgress == CrowdsaleProgress.PREICO) {
      bonus = initPreICOBonus.add(weiAmount);
    }
    if(crowdsaleProgress == CrowdsaleProgress.ICO0) {
      bonus = initICOBonus.add(weiAmount);
    }
    if(crowdsaleProgress == CrowdsaleProgress.ICO1) {
      bonus = initICOBonus.sub(bonusStepMin);
      bonus = initICOBonus.add(weiAmount);
    }
    if(crowdsaleProgress == CrowdsaleProgress.ICO2) {
      bonus = initICOBonus.sub(bonusStepMin.mul(2));
      bonus = initICOBonus.add(weiAmount);
    }
    if(crowdsaleProgress == CrowdsaleProgress.ICO3) {
      bonus = initICOBonus.sub(bonusStepMin.mul(3));
      bonus = initICOBonus.add(weiAmount);
    }
    if(crowdsaleProgress == CrowdsaleProgress.ICO4) {
      bonus = initICOBonus.sub(bonusStepMin.mul(4));
      bonus = initICOBonus.add(weiAmount);
    }
    if(crowdsaleProgress == CrowdsaleProgress.ICO5) {
        bonus = weiAmount;
    }
    return bonus;
  }


  //ICO Steps are calculated based on the amount of funds raised.
  function setSteps()
    internal
  {
    if(weiRaised >= 15384620000000000000000 && weiRaised < 16666670000000000000000) {
      crowdsaleProgress = CrowdsaleProgress.ICO1;
      ICOStep2();
    } else if(weiRaised >= 16666670000000000000000 && weiRaised < 18181820000000000000000) {
      crowdsaleProgress = CrowdsaleProgress.ICO2;
      ICOStep3();
    } else if(weiRaised >= 18181820000000000000000 && weiRaised < 20000000000000000000000) {
      crowdsaleProgress = CrowdsaleProgress.ICO3;
      ICOStep4();
    } else if(weiRaised >= 20000000000000000000000 && weiRaised < 22222220000000000000000) {
      crowdsaleProgress = CrowdsaleProgress.ICO4;
      ICOStep5();
    } else if(weiRaised >= 22222220000000000000000 && weiRaised < 25000000000000000000000) {
      crowdsaleProgress = CrowdsaleProgress.ICO5;
      ICOStep6();
    } else if(weiRaised >= 25000000000000000000000) {
      endICO();
    }
  }

  // will do the deposit action from RefundVault
  // overridden : RefundableCrowdsale.forwardFunds() internal
  function forwardFunds()
    internal
  {
    // we calculate the bonus to add to the value in wei
    uint256 totalValue = bonus(msg.value);
    vault.deposit.value(totalValue)(msg.sender);
  }

  // we ended the ICO and everything went smoothly yay !
  function endICO()
    internal
  {
    // end routines here
    require(super.hasEnded() == true);
    crowdsaleProgress = CrowdsaleProgress.ICOENDED;
  }

  /*
  * Web3 call functions
  */

}
