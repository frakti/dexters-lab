module.exports = function (_, data) {
  return _(data)
    .map('city')
    .sort()
    .value()
}