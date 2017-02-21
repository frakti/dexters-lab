/* eslint-env mocha */
'use strict'

const _ = require('lodash')
const expect = require('chai').expect
const LodashWrapper = require('../client/wrappers/Lodash')
const TEST_DATA = require('./fixtures')

describe('wrapper: Lodash ()', function () {
  it('SHOULD return single step for _.map', function () {
  it('SHOULD return single step stats for _.map', function () {
  it('SHOULD record single step stats for _.map invocation', function () {
    const wrapper = new LodashWrapper(_)
    const data = [{city: 'Rybnik'}]

    wrapper.lodash.map(data, 'city')

    expect(wrapper.stats)
      .to.be.eql([{
        step: 1,
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
