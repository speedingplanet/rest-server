export default {
  endpoints: {
    zippay: {
      version: 1,
      resources: ['users', 'transactions'],
    },
  },
  loadUnconfiguredFiles: false,
  port: 8000,
  dataDir: '../data/generated',
};
