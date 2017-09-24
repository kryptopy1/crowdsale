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

  const rate = new BigNumber(1000);
  const cap = new web3.BigNumber(12500000000000000000000);
  const goal = new web3.BigNumber(2500000000000000000000);
  const lessThanCap = ether(1);

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

  it('should return the correct state and bonus values after construction', async function () {
    let preICOBonus = await this.crowdsale.initPreICOBonus();

    let icoBonus = await this.crowdsale.initICOBonus();

    let bonusStepMin = await this.crowdsale.bonusStepMin();

    let progess = await this.crowdsale.crowdsaleProgress();

    // await this.crowdsale.send(lessThanCap).should.be.fulfilled;
  });

  // send money

  // should move through events

  // should finalize

  // should refund



  // it('should start PreICO', async function () {
  //   await this.crowdsale.startPreICO();
  //   const progress = await this.crowdsale.crowdsaleProgress();
  //   progress.should.equal('2');
  // });

});
