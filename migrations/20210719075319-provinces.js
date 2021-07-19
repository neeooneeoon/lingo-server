module.exports = {
  async up(db, client) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const provinces = require('./provinces.json');
    db.collection('provinces').insertMany(provinces);
  },

  async down(db, client) {
    db.collection('provinces').drop();
  },
};
