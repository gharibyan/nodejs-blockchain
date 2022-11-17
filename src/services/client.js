const { PeerRPCClient } = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')
const generateInstanceName = require('../utils/generate-instance-name')

const PEER_DEFAULT_CONFIGS = {
  timeout: 10000,
  retry: 20
}
class Client {
  constructor (props) {
    const link = new Link({ grape: 'http://127.0.0.1:30001' })
    link.start()
    const peer = new PeerRPCClient(link, {})
    peer.init()
    this.peer = peer
    this.id = props.id
    this.instanceName = props.serverName || generateInstanceName(props)
  }

  doRequest (endpoint, data) {
    return new Promise((resolve, reject) => {
      return this.peer.request(endpoint, data, PEER_DEFAULT_CONFIGS, (error, data) => {
        if (error) return reject(error)
        return resolve(data)
      })
    })
  }

  request (data) {
    return this.doRequest(this.instanceName, data)
  }
}

module.exports = (data) => {
  return new Client(data)
}
