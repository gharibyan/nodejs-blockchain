const Client = require('./client')
const grape = require('./grape')
const createServer = require('./services/server')

async function run () {
  await grape()
  console.log('grapes: started')
  const server = await createServer({id: 'pool'})
  // buyers
  const bob = new Client('Bob', server)
  const john = new Client('John', server)
  const alice = new Client('Alice', server)
  const chris = new Client('Chris', server)
  const deborah = new Client('Deborah', server)

  // sellers
  const jamie = new Client('Jamie', server)
  const anna = new Client('Anna', server)
  const clara = new Client('Clara', server)
  const bill = new Client('Bill', server)
  const daniel = new Client('Daniel', server)

  await Promise.all([
    bob.bid({ qty: 50, price: 820 }),
    john.bid({ qty: 100, price: 800 }),
    alice.bid({ qty: 75, price: 805 }),
    chris.bid({ qty: 150, price: 810 }),
    deborah.bid({ qty: 30, price: 830 }),
    jamie.ask({ qty: 50, price: 820 }),
    anna.ask({ qty: 25, price: 825 }),
    clara.ask({ qty: 100, price: 835 }),
    bill.ask({ qty: 25, price: 840 }),
    daniel.ask({ qty: 75, price: 845 })
  ])

  const orderBook = await bob.getOrderBook()
  console.log(orderBook)

  /* await bob.bid({ qty: 50, price: 820 })
  await john.bid({ qty: 100, price: 800 })
  await alice.bid({ qty: 75, price: 805 })
  await chris.bid({ qty: 150, price: 810 })
  await deborah.bid({ qty: 30, price: 830 })

  await jamie.ask({ qty: 50, price: 820 })
  await anna.ask({ qty: 25, price: 825 })
  await clara.ask({ qty: 100, price: 835 })
  await bill.ask({ qty: 25, price: 840 })
  await daniel.ask({ qty: 75, price: 845 }) */
}

run()
  .then((r) => {
    console.log(r)
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
