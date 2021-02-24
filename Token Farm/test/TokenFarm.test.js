const { assert } = require('chai');
const { default: Web3 } = require('web3');

const WalterWhiteToken = artifacts.require("WalterWhiteToken");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether');
}

contract('TokenFarm', ([owner, investor]) => {
    let daiToken, walterWhiteToken, tokenFarm
    before(async() => {
        daiToken = await DaiToken.new()
        walterWhiteToken = await WalterWhiteToken.new()
        tokenFarm = await TokenFarm.new(walterWhiteToken.address, daiToken.address)

        // Transfer all Dapp token to Token Farm
        await walterWhiteToken.transfer(tokenFarm.address, tokens('1000000'))

        await daiToken.transfer(investor, tokens('100'), {from: owner})
    })
    
    describe('Mock Dai Deployment', async() => {
        it('has a name', async() => {
            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token')
        })
    })

    describe('Walter White Token Deployment', async() => {
        it('has a name', async() => {
            const name = await walterWhiteToken.name()
            assert.equal(name, 'Walter White Token')
        })
    })

    describe('Token Farm Deployment', async() => {
        it('has a name', async() => {
            const name = await tokenFarm.name()
            assert.equal(name, 'Dapp Token Farm')
        })

        it('contract has tokens', async() => {
            let balance = await walterWhiteToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('Farming Tokens', async() => {
        it('rewards investors for staking mDai tokens', async() => {
            let result 

            // Check investor balance for staking
            result = await daiToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('100'), 'Correct Investor Balance before Staking')

            // Stake Mock DAI Tokens
            await daiToken.approve(tokenFarm.address, tokens('100'), {from: investor})
            await tokenFarm.stakeToken(tokens('100'), {from: investor})

            // Check staking results
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('0'), 'Correct Investor Balance After Staking')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('100'), 'Correct Token Farm Balance After Staking')

            result = await tokenFarm.stakingBalance(investor);
            assert.equal(result.toString(), tokens('100'), 'Correct Investor Staking Balance After Staking')

            result = await tokenFarm.isStaking(investor);
            assert.equal(result.toString(), 'true', 'Correct Investor Staking Status After Staking')

            await tokenFarm.issueToken({from: owner})

            result = await walterWhiteToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'Investor Dapp Token Wallet Balance Correct After Issuing')
            
            await tokenFarm.issueToken({from: investor}).should.be.rejected;

            await tokenFarm.unstakeToken({from: investor})

            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'Investor Mock Dai Token Wallet Balance Correct After Unstaking')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('0'), 'Correct Token Farm Dai Balance After Unstaking')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('0'), 'Correct Investor Token Farm Balance After Unstaking')

            result = await tokenFarm.isStaking(investor);
            assert.equal(result.toString(), 'false', 'Correct Investor Staking Status After Unstaking')
        })
    })
})