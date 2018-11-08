'use strict'

function validId(id) {
  if (id) return id + ''
  return id
}

module.exports = {
  validId: validId
}
