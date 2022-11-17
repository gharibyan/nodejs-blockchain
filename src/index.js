const Client = require('./client')
const grape = require('./grape')
const { isEqual } = require('lodash')

async function run () {
  await grape()
  console.log('grapes: started')

  const buyers = ['Bob', 'John', 'Alice', 'Chris', 'Deborah'].map(b => new Client(b))
  const sellers = ['Jamie', 'Anna', 'Clara', 'Bill', 'Daniel'].map(s => new Client(s))

  const bids = [
    { qty: 50, price: 820 },
    { qty: 100, price: 800 },
    { qty: 75, price: 805 },
    { qty: 150, price: 810 },
    { qty: 30, price: 830 }
  ]

  const asks = [
    { qty: 25, price: 825 },
    { qty: 100, price: 835 },
    { qty: 25, price: 840 },
    { qty: 75, price: 845 },
    { qty: 50, price: 820 }
  ]

  const participants = (
    await Promise.all([
      ...buyers.map(async (b) => {
        await b.init()
        return b
      }),
      ...sellers.map(async (s) => {
        await s.init()
        return s
      })
    ])
  )

  const clients = participants.reduce((acc, val) => {
    const clientName = val.name.toLowerCase()
    acc[clientName] = val
    const otherParticipants = participants.filter(p => p.id !== val.id)
    acc[clientName].addParticipants(otherParticipants)
    return acc
  }, {})

  await Promise.all([
    clients['bob'].bid(bids[0]),
    clients['john'].bid(bids[1]),
    clients['alice'].bid(bids[2]),
    clients['chris'].bid(bids[3]),
    clients['deborah'].bid(bids[4]),
    clients['jamie'].ask(asks[0]),
    clients['anna'].ask(asks[1]),
    clients['clara'].ask(asks[2]),
    clients['bill'].ask(asks[3]),
    clients['daniel'].ask(asks[4])
  ])

  const allOrderBooks = await Promise.all(
    Object.values(clients).map(async (client) => {
      const orderBook = await client.getLatestOrderBook()
      return {
        id: client.id,
        name: client.name,
        orderBook: orderBook.data.data
      }
    })
  )

  for (const client of allOrderBooks) {
    const otherOrderBooks = allOrderBooks.filter(o => o.id !== client.id)
    for (const c of otherOrderBooks) {
      const equal = isEqual(c.orderBook, client.orderBook)
      console.log(`${client.name}/${c.name} Order Books equal:`, equal)
    }
  }
}

run()
  .then((r) => {
    console.log(r)
    process.exit(1)
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
