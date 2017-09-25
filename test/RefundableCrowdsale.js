import ether from './helpers/ether'
import {advanceBlock} from './helpers/advanceToBlock'
import {increaseTimeTo, duration} from './helpers/increaseTime'
import latestTime from './helpers/latestTime'
import EVMThrow from './helpers/EVMThrow'

const BigNumber = web3.BigNumber

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

const RefundableCrowdsale = artifacts.require('./helpers/KryptopyCrowdsaleMock.sol')

contract('KryptopyCrowdsale: RefundableCrowdsale', function ([_, owner, wallet, investor]) {

  const rate = new BigNumber(1000);
  const cap = ether(12500);
  const goal = ether(2500);
  const lessThanGoal = ether(2);
  const lessThanCap = ether(1);


  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock()
  })

  beforeEach(async function () {
    this.startTime = latestTime() + duration.weeks(1)
    this.endTime =   this.startTime + duration.weeks(1)
    this.afterEndTime = this.endTime + duration.seconds(1)

    this.crowdsale = await RefundableCrowdsale.new(this.startTime, this.endTime, rate, goal, cap, wallet, {from: owner})
  })

  describe('creating a valid crowdsale', function () {

    it('should fail with zero goal', async function () {
      await RefundableCrowdsale.new(this.startTime, this.endTime, rate, 0, wallet, cap, {from: owner}).should.be.rejectedWith(EVMThrow);
    })

  });

  it('should deny refunds before end', async function () {
    await this.crowdsale.claimRefund({from: investor}).should.be.rejectedWith(EVMThrow)
    await increaseTimeTo(this.startTime)
    await this.crowdsale.claimRefund({from: investor}).should.be.rejectedWith(EVMThrow)
  })

  // it('should deny refunds after end if goal was reached', async function () {
  //   await increaseTimeTo(this.startTime)
  //   await this.crowdsale.sendTransaction({value: goal, from: investor})
  //   await increaseTimeTo(this.afterEndTime)
  //   await this.crowdsale.claimRefund({from: investor}).should.be.rejectedWith(EVMThrow)
  // })

  it('should allow refunds after end if goal was not reached', async function () {
    await increaseTimeTo(this.startTime)
    await this.crowdsale.sendTransaction({value: lessThanGoal, from: investor})
    await increaseTimeTo(this.afterEndTime)

    await this.crowdsale.finalize({from: owner})

    const pre = web3.eth.getBalance(investor)
    await this.crowdsale.claimRefund({from: investor, gasPrice: 0})
			.should.be.fulfilled
    const post = web3.eth.getBalance(investor)

    post.minus(pre).should.be.bignumber.equal(lessThanGoal)
  })

  // it('should forward funds to wallet after end if goal was reached', async function () {
  //   await increaseTimeTo(this.startTime)
  //   await this.crowdsale.sendTransaction({value: goal, from: investor})
  //   await increaseTimeTo(this.afterEndTime)
  //
  //   const pre = web3.eth.getBalance(wallet)
  //   await this.crowdsale.finalize({from: owner})
  //   const post = web3.eth.getBalance(wallet)
  //
  //   post.minus(pre).should.be.bignumber.equal(goal)
  // })

})
