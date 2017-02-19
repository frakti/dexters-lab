'use strict'

const examples = {
  lodash: {
    data: `[{"city": "Rybnik"}, {"city": "Warszawa"}, {"city": "Katowice"}]`,
    content: `return _(data)
  .map('city')
  .sortBy()
  .value()`
  },
  'lodash/fp': {
    data: `[{"city": "Rybnik"}, {"city": "Warszawa"}, {"city": "Katowice"}]`,
    content: `return _.compose(
  _.sortBy(city => city),
  _.map('city')
)(data)`
  }
}

export default function (libName) {
  return examples[libName]
}
