'use strict'

const _ = require('lodash')

const [,, scriptPath, testDataPath] = process.argv

// dangerous for acceptable for first iteration
const func = require(scriptPath)
const data = require(testDataPath)

console.info(func(_, data))