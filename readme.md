### Install and run

1. run `npm ci` or `npm install`
2. run `npm start`

### How it works

Once is script running it will activate two grapes.
By default, it's create actors (buyers and sellers)
* Buyers: `'Bob', 'John', 'Alice', 'Chris', 'Deborah'`
* Sellers: `'Jamie', 'Anna', 'Clara', 'Bill', 'Daniel'`

Every Actor (Client) will initiate it's own Client And Server (instance.
Once bid happens it will spread across clients. once.
From every bid ask request i'm generating new order book to avoid race condition.
Ideally last generated order book will most accurate based on that current state.

Trading logic for now is very dummy. It's just getting matching pair from 
`bids, asks` and removing it from order book.

for instance
```js
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

/// for this case final order book should be 

const orderBook = {
  bids:[
    { qty: 100, price: 800 },
    { qty: 75, price: 805 },
    { qty: 150, price: 810 },
    { qty: 30, price: 830 }
  ],
  asks:[
    { qty: 25, price: 825 },
    { qty: 100, price: 835 },
    { qty: 25, price: 840 },
    { qty: 75, price: 845 }
  ]
}

// This { qty: 50, price: 820 } bid should not be  
```
As a result script will compare every client order book data with each other
they should be equal and distributed.
