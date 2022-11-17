'use strict'
const { v4 } = require('uuid')
const createClient = require('../services/client')
const createServer = require('../services/server')

const REQUEST_TYPE = {
  bid: 'bid',
  ask: 'ask'
}

class Client {
  constructor (name, server, id) {
    this.name = name
    this.server = server || null
    this.id = id || v4()
    this.participants = []
  }

  async init () {
    this.server = await createServer({id: this.id, name: this.name})
    this.client = createClient({ id: this.id, name: this.name, serverName: this.server.instanceName })
  }

  addParticipants (participants) {
    this.participants = [...participants]
  }

  getLatestOrderBook () {
    return this.client.request({ type: 'latestOrderBook' })
  }

  getOrderBooks () {
    return this.client.request({ type: 'orderBooks' })
  }

  doRequest (requestData) {
    const data = {
      ...requestData,
      ts: Date.now(),
      sender: {
        name: this.name,
        id: this.id
      }
    }
    return Promise.all([
      this.client.request(data),
      ...this.participants.map(p => p.client.request(data))
    ])
  }

  bid (data) {
    const requestData = {
      ...data,
      type: REQUEST_TYPE.bid
    }
    return this.doRequest(requestData)
  }

  ask (data) {
    const requestData = {
      ...data,
      type: REQUEST_TYPE.ask
    }
    return this.doRequest(requestData)
  }
}

module.exports = Client
