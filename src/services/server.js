const { PeerRPCServer } = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')
const { sortBy, last } = require('lodash')
const generateInstanceName = require('../utils/generate-instance-name')

const sleep = (ms) => {
  return new Promise(resolve => {
    return setTimeout(() => {
      return resolve(true)
    }, ms)
  })
}

const setupService = (props) => {
  const link = new Link({ grape: 'http://127.0.0.1:30001' })
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
    this.bids = []
    this.asks = []
    this.orderBook = []
    this.instanceName = generateInstanceName(props)
    this.service = setupService({
      ...props, instanceName: this.instanceName
    })
  }

  upgradeOrderBook () {
    const bids = [...this.bids]
    const asks = [...this.asks]

    for (const [i, val] of bids.entries()) {
      const findMatch = asks.findIndex(a => a.price === val.price && a.qty === val.qty)
      if (findMatch > -1) {
        bids.splice(i, 1)
        asks.splice(findMatch, 1)
      }
    }
    this.orderBook.push({
      ts: Date.now(),
      data: { bid: bids, ask: asks }
    })
  }

  handleRequest (payload) {
    const { type, qty, price, sender, ts } = payload
    const data = { qty, price, sender, ts }
    let response = null
    switch (type) {
      case 'bid':
        this.bids.unshift(data)
        this.upgradeOrderBook()
        break
      case 'ask':
        this.asks.unshift(data)
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
