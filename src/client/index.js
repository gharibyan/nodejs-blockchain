'use strict'
const { v4 } = require('uuid')
const createClient = require('../services/client')

const REQUEST_TYPE = {
  bid: 'bid',
  ask: 'ask'
}

class Client {
  constructor (name, server, id) {
    this.name = name
    this.server = server
    this.id = id || v4()
    this.client = createClient({ id: this.id, name: this.name, serverName: this.server.instanceName })
  }

  getOrderBook () {
    return this.client.request({type: 'orderBook'})
  }

  bid (data) {
    return this.client.request({
      ...data,
      type: REQUEST_TYPE.bid,
      sender: {
        name: this.name,
        id: this.id
      }
    })
  }

  ask (data) {
    return this.client.request({
      ...data,
      type: REQUEST_TYPE.ask,
      sender: {
        name: this.name,
        id: this.id
      }
    })
  }
}

module.exports = Client
