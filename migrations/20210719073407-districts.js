module.exports = {
  async up(db, client) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const districts = require('./districts.json');
    db.collection('districts').insertMany(districts);
  },

  async down(db, client) {
    db.collection('districts').drop();
  },
};
