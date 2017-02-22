'use strict'

import map from 'lodash/map'
import beautify from 'json-beautify'

export default function (steps) {
  return map(steps, step => {
    const {funcName, isChained, args, result} = step

    const stringifiedArgs = beautify(args, (key, value) => {
      if (typeof (value) === 'function') return 'function'
      return value
    }, 2, 50)

    let inputDataPrefix = ''

    if (isChained) {
      inputDataPrefix = args.length > 0 ? ' input,' : ' input '
    }

    return Object.assign({}, step, {
      execution: `${funcName}(${inputDataPrefix}${stringifiedArgs.slice(1, -1).replace(/"function"/, 'function')})`,
      args: stringifiedArgs,
      result: beautify(result, null, 2, 50)
    })
  })
}
