import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

async function main() {
  const result = dotenv.config();
  if (result.error) {
    throw result.error;
  }
  const envConfig = result.parsed;

  const URI = envConfig.DB_URL;
  const DB_NAME = envConfig.DB_NAME;

  const client = new MongoClient(URI, { useUnifiedTopology: true });
  await client.connect();
  const database = client.db(DB_NAME);
  const booksCollection = database.collection('books');
  const sentencesCollection = database.collection('sentences');
  const wordsCollection = database.collection('words');
  const rollbackUnit = [
    {
      bookNId: 1900,
      unitNId: [1770000, 1770100],
    },
    // {
    //   bookNId: 1200,
    //   unitNId: [640000, 640100],
    // },
  ];
  const rollbackWordSentenceId = async (input: {
    bookNId: number;
    unitNId: number[];
  }) => {
    for (const unitNId of input.unitNId) {
      await Promise.all([
        wordsCollection.updateMany(
          {
            bookNId: input.bookNId,
            unitNId: unitNId,
          },
          { $set: { bookNId: input.bookNId / 100, unitNId: unitNId / 100 } },
        ),
        sentencesCollection.updateMany(
          {
            bookNId: input.bookNId,
            unitNId: unitNId,
          },
          { $set: { bookNId: input.bookNId / 100, unitNId: unitNId / 100 } },
        ),
      ]);
    }
  };
  await Promise.all(rollbackUnit.map((input) => rollbackWordSentenceId(input)));
  console.log('Done');
  // const newBookIds = ['tienganh10tap2demo'];
  // const updateWordAndSentenceDemo = async (
  //   bookNId: number,
  //   unitNId: number,
  // ) => {
  //   await Promise.all([
  //     wordsCollection.updateMany(
  //       {
  //         bookNId: bookNId,
  //         unitNId: unitNId,
  //       },
  //       {
  //         $set: {
  //           bookNId: bookNId * 10,
  //           unitNId: unitNId * 10,
  //         },
  //       },
  //     ),
  //     sentencesCollection.updateMany(
  //       {
  //         bookNId: bookNId,
  //         unitNId: unitNId,
  //       },
  //       {
  //         $set: {
  //           bookNId: bookNId * 10,
  //           unitNId: unitNId * 10,
  //         },
  //       },
  //     ),
  //   ]);
  // };

  // const updateDemoBook = async (book: any) => {
  //   const units = book.units.map((element) => {
  //     const nId = element.nId;
  //     return { ...element, nId: nId * 10 };
  //   });
  //   await booksCollection.updateOne(
  //     {
  //       _id: book._id,
  //     },
  //     {
  //       $set: {
  //         nId: book.nId * 10,
  //         units: units,
  //       },
  //     },
  //   );
  // };
  // const demoBooks = await booksCollection
  //   .find({ _id: { $in: newBookIds } })
  //   .toArray();
  // await Promise.all(demoBooks.map((book) => updateDemoBook(book)));

  // for (const book of demoBooks) {
  //   const units = book.units;
  //   for (const unit of units) {
  //     await updateWordAndSentenceDemo(book.nId, unit.nId);
  //   }
  // }
  // console.log('Done');

  await client.close();
}

main();
