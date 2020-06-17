# TODOS

- [x] Generate anything while respecting originals
- [x] Generate users
- [x] Generate transactions
- [x] Real city, state, zip combos
- [x] Wrap around json-server for the moment, so I have less implementation work to do
- [x] Add commonly-usable DAOs
- [x] Package it
- [x] Add configuration to run it as a package included in another project
- [x] Pass port number on the command line, or via a config file
- [x] Server should generate some data (id, version, lastUpdated)
- [ ] Post-install script generates initial data (obviating call to generate)
- [ ] Endpoint data can be generated on-the-fly
- [ ] Configure a streaming resource (plugged into Faker or Chance)
- [ ] Original files are backed up at startup
- [ ] Actual images for payees
- [ ] Shutdown (or going to /persist ?) writes data to combined file, splits it back out to individual files
- [ ] Type definitions for DAOs
- [ ] Generate pure JavaScript versions of data (for testing, use before fetch() is covered, etc.)
