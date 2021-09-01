module.exports = {
  async up(db, client) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    let fs = require('fs');
    let newData = JSON.parse(
      fs.readFileSync('migrations/export.json', { encoding: 'utf-8' }),
    );
    for (const item of newData) {
      item.subContent = normalizeSubContent(item.subContent);
      item.basePhrase = normalizedBasePhrase(item.basePhrase);
      await db.collection('sentences').updateOne(
        { _id: item._id },
        {
          $set: {
            subContent: {
              content: item.subContent,
              audio: '',
            },
            basePhrase: {
              content: item.basePhrase,
              audio: '',
            }
          },
        },
      );
    }
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
function normalizeSubContent(str){
  let normalizedStr;
  let stringsToRemove = ['ll', 's', 'd', 't', 're', 'm'];
  let strSplit = str.split(' ');
  if (stringsToRemove.includes(strSplit[strSplit.length - 1])) {
    strSplit = strSplit.slice(0, strSplit.length - 1).join(' ');
    normalizedStr = strSplit;
  }
  if (stringsToRemove.includes(strSplit[1])) {
    normalizedStr = [
      ...[`${strSplit[0]}'${strSplit[1]}`],
      ...strSplit.slice(2),
    ].join(' ');
  }
  if (!normalizedStr) return deletePunctuation(str);
  return deletePunctuation(normalizedStr);
}
function normalizedBasePhrase(str) {
  let stringsToRemove = ['ll', 's', 'd', 't', 're', 'm'];
  let strSplit = str.split(' ');
  if (stringsToRemove.includes(strSplit[0])) {
    strSplit = strSplit.slice(1);
  }
  return deletePunctuation(strSplit.slice(0, 4).join(' '));

}
function deletePunctuation(str) {
  if (!isLetter(str[str.length - 1])) {
    str = str.slice(0, str.length - 1);
  }
  return str;
}
function isLetter(char) {
  return /[a-zA-Z]/.test(char);
}