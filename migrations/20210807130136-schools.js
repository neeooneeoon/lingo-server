module.exports = {
  async up(db, client) {
    let fs = require('fs');
    let truongs = [...new Set(fs
          .readFileSync('migrations/TRUONG.txt', { encoding: 'utf-8' })
          .trim()
          .split('\n'),
      ),
    ];
    let tinh_huyens = [...new Set(fs
          .readFileSync('migrations/TINH_HUYEN.txt', { encoding: 'utf8' })
          .trim()
          .split('\n'),
      ),
    ];

    let provinceNames = [
      ...new Set(tinh_huyens.map((i) => i.trim().split('|')[0])),
    ];
    let provinces = provinceNames.map((i) => {
      return {
        _id: provinceNames.indexOf(i) + 1,
        name: i,
      };
    });
    let districts = [];
    let schools = [];
    for (const item of tinh_huyens) {
      districts.push({
        _id: 100 + tinh_huyens.indexOf(item) + 1,
        province: provinceNames.indexOf(item.trim().split('|')[0]) + 1,
        name: item.trim().split('|')[1],
      });
    }
    for (const item of truongs) {
      const itemSplit = item.trim().split('|');
      const provinceId = provinceNames.indexOf(itemSplit[0]) + 1;
      let district;
      if (provinceId) {
        district = districts.find(
          (element) =>
            element.province === provinceId &&
            element.name.trim() === itemSplit[1].trim(),
        );
        if (!district) {
          continue;
        }
      } else {
        continue;
      }
      schools.push({
        _id: 1000 + truongs.indexOf(item),
        name: itemSplit[4],
        province: district.province,
        district: district._id,
      });
    }
    await db.collection('schools').insertMany(schools);
    db.collection('provinces').insertMany(provinces);
    db.collection('districts').insertMany(districts);
  },

  async down(db, client) {
    db.collection('provinces').drop();
    db.collection('districts').drop();
    db.collection('schools').drop()
  }
};
