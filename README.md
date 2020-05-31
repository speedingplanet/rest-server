# Speeding Planet's REST server

Eventually intended to be an easily reusable and configurable REST server with data appropriate for demonstration use in class.

## Generating data

### From the command line

`node src/generate.js users <amount> transactions <amount>`

Even just running `node src/generate.js` will give you hints on how to run the generator file.

The number of transactions should, generally, be bigger than the number of users.

Loads users from the `data/seeds` folder. If the user amount is greater than the number of seed users, new users will be generated to fill out the needed number of users.

Transactions are generated as mostly payments, with some charges. Charges are then either paid (with corresponding transactions) or unpaid (and thus, open).

## Running the server

Currently `node src/server.js` but planning to add easier capabilities, particularly for inclusion in projects, soon.
