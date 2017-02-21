'use strict'

import map from 'lodash/map'

export default function (steps) {
  return map(steps, step => {
    const {funcName, isChained, args, result} = step

    const stringifiedArgs = JSON.stringify(args, (key, value) => {
      if (typeof (value) === 'function') return '<function>'
      return value
    }, 2)

    let inputDataPrefix = ''

    if (isChained) {
      inputDataPrefix = args.length > 0 ? '\n  <input>,' : '<input>'
    }

    return Object.assign({}, step, {
      execution: `${funcName}(${inputDataPrefix}${stringifiedArgs.slice(1, -1).replace(/"<function>"/, '<function>')})`,
      args: stringifiedArgs,
      result: JSON.stringify(result, null, 2)
    })
  })
}
