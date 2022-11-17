
'use strict'

const { Grape: Index } = require('grenache-grape')

function start (instance) {
  return new Promise((resolve, reject) => {
    instance.start((error) => {
      if (error) return reject(error)
      return resolve(true)
    })
  })
}

const g1 = new Index({
  host: '127.0.0.1',
  dht_port: 20001,
  dht_bootstrap: [
    '127.0.0.1:20002'
  ],
  api_port: 30001
})

const g2 = new Index({
  host: '127.0.0.1',
  dht_port: 20002,
  dht_bootstrap: [
    '127.0.0.1:20001'
  ],
  api_port: 40001
})

module.exports = () => {
  return Promise.all([
    start(g1),
    start(g2)
  ])
}
