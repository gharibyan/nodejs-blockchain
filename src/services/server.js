const { PeerRPCServer } = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')
const { sortBy, last } = require('lodash')
const generateInstanceName = require('../utils/generate-instance-name')
const { LINK_HOST_URL } = require('../constants')

const sleep = (ms) => {
  return new Promise(resolve => {
    return setTimeout(() => {
      return resolve(true)
    }, ms)
  })
}

const setupService = (props) => {
  const link = new Link({ grape: LINK_HOST_URL })
  link.start()
  const peer = new PeerRPCServer(link, { timeout: 300000 })
  peer.init()
  const port = 1024 + Math.floor(Math.random() * 1000)
  const service = peer.transport('server')
  service.listen(port)
  link.announce(props.instanceName, service.port, {})
  return {
    link,
    service
  }
}

class Server {
  constructor (props) {
    this.bids = new Set()
    this.asks = new Set()
    this.orderBook = []
    this.instanceName = generateInstanceName(props)
    this.service = setupService({
      ...props, instanceName: this.instanceName
    })
  }

  upgradeOrderBook () {
    const bids = [...this.bids]
    const asks = [...this.asks]

    const filteredBids = bids.filter(b => !asks.find((a) => a.price === b.price && a.qty === b.qty))
    const filteredAsks = asks.filter(b => !bids.find((a) => a.price === b.price && a.qty === b.qty))
    this.orderBook.push({
      ts: Date.now(),
      data: { bid: filteredBids, ask: filteredAsks }
    })
  }

  handleRequest (payload) {
    const { type, qty, price, sender, ts } = payload
    const data = { qty, price, sender, ts }
    let response = null
    switch (type) {
      case 'bid':
        this.bids.add(data)
        this.upgradeOrderBook()
        break
      case 'ask':
        this.asks.add(data)
        this.upgradeOrderBook()
        break
      case 'latestOrderBook':
        const sorted = sortBy(this.orderBook, 'ts')
        response = last(sorted)
        break
      case 'orderBooks':
        response = this.orderBook
        break
      default:
        console.warn(`Invalid type`)
    }
    return response
  }

  async init (timeout) {
    await sleep(timeout || 1000)
    this.service.service.on('request', (rid, key, payload, handler) => {
      const response = this.handleRequest({ ...payload })
      handler.reply(null, { msg: 'ok', data: response })
    })
    return Promise.resolve(this)
  }
}

module.exports = async (props) => {
  const server = new Server(props)
  return server.init(props.sleep)
}
