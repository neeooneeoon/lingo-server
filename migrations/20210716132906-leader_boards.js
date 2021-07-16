module.exports = {
  async up(db, client) {
    const listRankings = [
      'Legend',
      'Diamond',
      'Gold',
      'Silver',
      'Bronze',
      'None',
    ].map((rank, index) => {
      return {
        index,
        group: 1,
        rank,
        champions: [],
      };
    });
    db.collection('leaderboards').insertMany(listRankings);
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
  },

  async down(db, client) {
    db.collection('leaderboards').remove();
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
