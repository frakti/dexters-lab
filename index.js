'use strict'

const _ = require('lodash')

const lodashFunctions = _.functions(_)

const newLo = _.runInContext().mixin(_(lodashFunctions)
  .keyBy()
  .mapValues(function (funcName) {

    return function (...args) {
      console.info(`Invoked ${funcName} with args ${JSON.stringify(args)}`)
      const result = _[funcName](...args)

      console.info(`With result: ${JSON.stringify(result)}`)
      return result
    }

  })
  .value()
)

const [,, scriptPath, testDataPath] = process.argv

// dangerous for acceptable for first iteration
const func = require(scriptPath)
const data = require(testDataPath)

console.info(func(newLo, data))