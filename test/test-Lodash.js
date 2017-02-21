/* eslint-env mocha */
'use strict'

const _ = require('lodash')
const expect = require('chai').expect
const LodashWrapper = require('../client/wrappers/Lodash')
const TEST_DATA = require('./fixtures')

describe('wrapper: Lodash ()', function () {
  it('SHOULD record steps of explicit method chain sequences invocation', function () {
    const wrapper = new LodashWrapper(_)
    const data = [{city: 'Rybnik'}, {city: 'Katowice'}]

    wrapper.lodash.chain(data).map('city').sortBy().first().value()

    expect(wrapper.stats)
      .to.be.eql([
        {
          funcName: 'map',
          isChained: true,
          result: ['Rybnik', 'Katowice'],
          args: ['city']
        },
        {
          funcName: 'sortBy',
          isChained: true,
          result: ['Katowice', 'Rybnik'],
          args: []
        },
        {
          funcName: 'first',
          isChained: true,
          result: 'Katowice',
          args: []
        }
      ])
  })

  it('SHOULD record steps of implicit method chain sequences invocation', function () {
    const wrapper = new LodashWrapper(_)
    const data = [{city: 'Rybnik'}, {city: 'Katowice'}]

    wrapper.lodash(data).map('city').sortBy().first()

    expect(wrapper.stats)
      .to.be.eql([
        {
          funcName: 'map',
          isChained: true,
          result: ['Rybnik', 'Katowice'],
          args: ['city']
        },
        {
          funcName: 'sortBy',
          isChained: true,
          result: ['Katowice', 'Rybnik'],
          args: []
        },
        {
          funcName: 'first',
          isChained: false,
          result: 'Katowice',
          args: []
        }
      ])
  })

  it('SHOULD record single step stats for _.map invocation', function () {
    const wrapper = new LodashWrapper(_)
    const data = [{city: 'Rybnik'}]

    wrapper.lodash.map(data, 'city')

    expect(wrapper.stats)
      .to.be.eql([{
        funcName: 'map',
        isChained: false,
        result: ['Rybnik'],
        args: [[{city: 'Rybnik'}], 'city']
      }])
  })

  it('SHOULD return expected lodash transform', function () {
    const wrapper = new LodashWrapper(_)

    const result = wrapper.lodash(TEST_DATA)
    .map(city => wrapper.lodash.assign(
      {},
      city,
      {avg: wrapper.lodash.sum(city.temperatures) / wrapper.lodash.size(city.temperatures)}
    ))
    .reject(city => city.avg < 12.5)
    .sortBy()
    .map('city')
    .first()

    expect(result).to.be.equal('Rybnik')
  })
})
