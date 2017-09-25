import ether from './helpers/ether';
import {advanceBlock} from './helpers/advanceToBlock';
import {increaseTimeTo, duration} from './helpers/increaseTime';
import latestTime from './helpers/latestTime';
import EVMThrow from './helpers/EVMThrow';

const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const KryptopyCrowdsale = artifacts.require('./helpers/KryptopyCrowdsaleMock.sol');
const KryptopyToken = artifacts.require('../contracts/KryptopyToken.sol');

contract('KryptopyCrowdsale', function ([_, investor, wallet, purchaser]) {

  const rate = new BigNumber(265);
  const cap = new web3.BigNumber(12500000000000000000000); // wei (12500 eth)
  const goal = new web3.BigNumber(2500000000000000000000); // wei (2500 eth)
  const lessThanGoal = ether(500);
  const lessThanCap = ether(1);
  const valueLessThanPreIcoMin = new web3.BigNumber(300000000000000000); // wei (0.3 eth)
  const valueMoreThanPreIcoMax = ether(10)
  const value = ether(1)

  const expectedTokenAmount = rate.mul(value)

  var CrowdsaleProgress = [
    "PREICO",
    "GOALSUCCESS",
    "GOALFAILED"
  ];

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock()
  })

  beforeEach(async function () {
    this.startTime = latestTime() + duration.weeks(1);
    this.endTime =   this.startTime + duration.weeks(1);
    this.afterEndTime = this.endTime + duration.seconds(1);

    this.crowdsale = await KryptopyCrowdsale.new(this.startTime, this.endTime, rate, goal, cap, wallet);

    this.token = KryptopyToken.at(await this.crowdsale.token());
  });

  describe('upon construction', function () {

    it('should return the correct state and bonus values after construction', async function () {
      let preICOBonus = new web3.BigNumber(200000000000000000)
      // let icoBonus = new web3.BigNumber(125000000000000000)
      // let bonusStepMin = new web3.BigNumber(25000000000000000)
      let progressIndex = new web3.BigNumber(CrowdsaleProgress.indexOf("PREICO"))

      let initPreICOBonus = await this.crowdsale.initPreICOBonus()
      initPreICOBonus.should.be.bignumber.equal(preICOBonus)

      // let initICOBonus = await this.crowdsale.initICOBonus()
      // initICOBonus.should.be.bignumber.equal(icoBonus)
      //
      // let initBonusStepMin = await this.crowdsale.bonusStepMin()
      // initBonusStepMin.should.be.bignumber.equal(bonusStepMin)

      let crowdsaleProgress = await this.crowdsale.crowdsaleProgress();
      crowdsaleProgress.should.be.bignumber.equal(progressIndex)
    })
  })

  describe('during PRE-ICO event', function () {

    it('should accept token purchases during pre-sale', async function () {
      let progressIndex = new web3.BigNumber(CrowdsaleProgress.indexOf("PREICO"))

      await increaseTimeTo(this.startTime)
      await this.crowdsale.send(value).should.be.fulfilled
      await this.crowdsale.buyTokens(investor, {value: value, from: purchaser}).should.be.fulfilled

      let crowdsaleProgress = await this.crowdsale.crowdsaleProgress();
      crowdsaleProgress.should.be.bignumber.equal(progressIndex)
    })

    it('should accept token purchases during pre-sale after goal has been met', async function () {
      let progressIndex = new web3.BigNumber(CrowdsaleProgress.indexOf("GOALSUCCESS"))

      await increaseTimeTo(this.startTime)
      await this.crowdsale.send(goal).should.be.fulfilled
      await this.crowdsale.buyTokens(investor, {value: goal, from: purchaser}).should.be.fulfilled

      let crowdsaleProgress = await this.crowdsale.crowdsaleProgress();
      crowdsaleProgress.should.be.bignumber.equal(progressIndex)

      await this.crowdsale.send(value).should.be.fulfilled
      await this.crowdsale.buyTokens(investor, {value: value, from: purchaser}).should.be.fulfilled

    })

    it('should reject token purchases after pre-ico supply has been exhausted', async function () {
      let progressIndex = new web3.BigNumber(CrowdsaleProgress.indexOf("GOALSUCCESS"))

      await increaseTimeTo(this.startTime)
      await this.crowdsale.send(cap).should.be.fulfilled
      await this.crowdsale.buyTokens(investor, {value: cap, from: purchaser}).should.be.fulfilled

      let crowdsaleProgress = await this.crowdsale.crowdsaleProgress();
      crowdsaleProgress.should.be.bignumber.equal(progressIndex)

      await this.crowdsale.send(value).should.be.rejectedWith(EVMThrow)
      await this.crowdsale.buyTokens(investor, {value: value, from: purchaser}).should.be.rejectedWith(EVMThrow)
    })

    // it('should log purchase', async function () {
    //   const {logs} = this.crowdsale.buyTokens(investor, {value: value, from: purchaser})
    //
    //   const event = logs.find(e => e.event === 'TokenPurchase')
    //   console.log(event)
    //   should.exist(event)
    //   event.args.purchaser.should.equal(investor)
    //   event.args.beneficiary.should.equal(investor)
    //   event.args.value.should.be.bignumber.equal(value)
    //   event.args.amount.should.be.bignumber.equal(expectedTokenAmount)
    // })

    // it('should log purchase', async function () {
    //   const {logs} = await this.crowdsale.sendTransaction({value: value, from: investor})
    //
    //   const event = logs.find(e => e.event === 'TokenPurchase')
    //   console.log(event)
    //   should.exist(event)
    //   event.args.purchaser.should.equal(investor)
    //   event.args.beneficiary.should.equal(investor)
    //   event.args.value.should.be.bignumber.equal(value)
    //   event.args.amount.should.be.bignumber.equal(expectedTokenAmount)
    // })
  })

  describe('druing ICO event', function() {

  })

  // send money

  // should move through events

  // should finalize

  // should refund

});
