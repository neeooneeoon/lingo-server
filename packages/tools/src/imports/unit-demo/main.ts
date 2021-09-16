// import { MongoClient } from 'mongodb';
// import * as dotenv from 'dotenv';
// import {
//   NewBookDemo,
//   WordInSheet,
//   SentenceInSheet,
//   ContentSplitType,
//   TranslateSplitType,
// } from '../types';
// import {
//   GoogleSpreadsheetService,
//   GoogleAuthorization,
// } from '@lingo/tools/src/google/services';
// import md5 from 'md5';
// import verbs from './irregularVerbs.json';

// async function run() {
//   const result = dotenv.config();
//   if (result.error) {
//     throw result.error;
//   } else {
//     const envConfig = result.parsed;
//     const uri = envConfig.DB_URL;
//     const dbName = envConfig.DB_NAME;
//     const SHEET_ID = envConfig.DATA_DEMO;
//     const client = new MongoClient(uri, { useUnifiedTopology: true });
//     await client.connect();
//     const database = client.db(dbName);

//     const booksCollection = database.collection('books');
//     const wordsCollection = database.collection('words');
//     const sentencesCollection = database.collection('sentences');

//     // Insert many demo books
//     const insertBooks = async (input: NewBookDemo[]) => {
//       try {
//         const rawDocs = input.map((element) => {
//           return { ...element, createdAt: new Date(), updatedAt: new Date() };
//         });
//         await booksCollection.insertMany(rawDocs);
//       } catch (error) {
//         throw error;
//       }
//     };

//     // Authorize google and spreadsheetService
//     const auth = await GoogleAuthorization.authorize();
//     const spreadsheetService = new GoogleSpreadsheetService(SHEET_ID, auth);

//     // Read data from sheet
//     const readSheet = (sheetName: string) => {
//       return spreadsheetService.getSheet(sheetName);
//     };

//     // Sheet analysis
//     const spreadsheetAnalysis = (
//       rows: string[][],
//       bookNId: number,
//       unitNId: number,
//       imageRoot: string,
//     ) => {
//       const words: WordInSheet[] = [];
//       const sentences: SentenceInSheet[] = [];
//       rows.forEach((row) => {
//         if (row[2]) {
//           let kindOfVocabulary = '';
//           const wordContent = row[2]
//             .trim()
//             .replace('\n', '')
//             .normalize('NFKD')
//             .split(' ');
//           const wordId = `${imageRoot}-${md5(row[2].replace('\n', ''))}`;

//           if (row[3]) {
//             const regex = new RegExp(
//               /[\!\@\#\$\%\^\&\*\)\(\+\=\.\<\>\{\}\[\]\:\;\~\_]/g,
//             );
//             switch (row[3].replace('\n', '').replace(regex, '').toLowerCase()) {
//               case 'n':
//                 kindOfVocabulary = 'noun';
//                 break;
//               case 'v':
//                 kindOfVocabulary = 'verb';
//                 break;
//               case 'adj':
//                 kindOfVocabulary = 'adjective';
//                 break;
//               case 'adv':
//                 kindOfVocabulary = 'adverb';
//                 break;
//               default:
//                 break;
//             }
//           }
//           words.push({
//             _id: wordId,
//             meanings: [row[6].replace('\n', '')],
//             pronunciations: [row[5].replace('\n', '')],
//             types: kindOfVocabulary ? [kindOfVocabulary] : [],
//             haveImageWords: [],
//             noImageWords: [],
//             bookNId: bookNId,
//             unitNId: unitNId,
//             content: row[2].replace('\n', ''),
//             meaning: row[6].replace('\n', ''),
//             imageRoot: imageRoot,
//             isUseToMakeQuestion: true,
//           });
//           function getWordExtends(content: string): Array<string> {
//             const wordExtends = new Set([
//               content,
//               `${content}s`,
//               `${content}ing`,
//               `${content}ed`,
//               `${content}er`,
//               `${content}est`,
//               `${content}es`,
//               ...verbs,
//             ]);
//             const contentLength = content.length;
//             const str1 = content.slice(contentLength - 1);
//             const str2 = content.slice(contentLength - 2);
//             const vowels = ['u', 'e', 'o', 'a', 'i'];
//             const unExtractedConsonants = ['h', 'w', 'x', 'y'];
//             const lastConsonant = content[content.length - 1];
//             const lastVowel = content[content.length - 2];

//             if (str1 == 'y') {
//               const slicedContent = content.slice(0, contentLength - 1);
//               const temp1 = slicedContent.concat('ies');
//               const temp2 = slicedContent.concat('ied');
//               wordExtends.add(temp1);
//               wordExtends.add(temp2);
//             }

//             if (str1 == 'e') {
//               const temp = content.slice(0, contentLength - 1).concat('ing');
//               wordExtends.add(temp);
//               wordExtends.add(content.concat('d'));
//             }
//             if (str2 == 'ie') {
//               const temp = content.slice(0, contentLength - 2).concat('ying');
//               wordExtends.add(temp);
//             }
//             if (
//               lastVowel &&
//               !unExtractedConsonants.includes(lastConsonant) &&
//               vowels.includes(lastVowel)
//             ) {
//               const temp = content.concat(`${lastConsonant}ing`);
//               wordExtends.add(temp);
//               wordExtends.add(content.concat(`${lastConsonant}ed`));
//               wordExtends.add(content.concat(`${lastConsonant}er`));
//             }
//             if (
//               lastVowel &&
//               !unExtractedConsonants.includes(lastConsonant) &&
//               vowels.includes(lastVowel)
//             ) {
//               const temp = content.concat(`${lastConsonant}ing`);
//               wordExtends.add(temp);
//             }
//             return [...wordExtends];
//           }

//           function getBaseExtensions(content: string): Array<string> {
//             const wordExtends = new Set([
//               content,
//               `${content}s`,
//               `${content}ing`,
//               `${content}ed`,
//               `${content}er`,
//               `${content}est`,
//               `${content}es`,
//             ]);
//             const contentLength = content.length;
//             const str1 = content.slice(contentLength - 1);
//             const str2 = content.slice(contentLength - 2);
//             const vowels = ['u', 'e', 'o', 'a', 'i'];
//             const unExtractedConsonants = ['h', 'w', 'x', 'y'];
//             const lastConsonant = content[content.length - 1];
//             const lastVowel = content[content.length - 2];

//             if (str1 == 'y') {
//               const slicedContent = content.slice(0, contentLength - 1);
//               const temp1 = slicedContent.concat('ies');
//               const temp2 = slicedContent.concat('ied');
//               wordExtends.add(temp1);
//               wordExtends.add(temp2);
//             }

//             if (str1 == 'e') {
//               const temp = content.slice(0, contentLength - 1).concat('ing');
//               wordExtends.add(temp);
//               wordExtends.add(content.concat('d'));
//             }
//             if (str2 == 'ie') {
//               const temp = content.slice(0, contentLength - 2).concat('ying');
//               wordExtends.add(temp);
//             }
//             if (
//               lastVowel &&
//               !unExtractedConsonants.includes(lastConsonant) &&
//               vowels.includes(lastVowel)
//             ) {
//               const temp = content.concat(`${lastConsonant}ing`);
//               wordExtends.add(temp);
//               wordExtends.add(content.concat(`${lastConsonant}ed`));
//               wordExtends.add(content.concat(`${lastConsonant}er`));
//             }
//             if (
//               lastVowel &&
//               !unExtractedConsonants.includes(lastConsonant) &&
//               vowels.includes(lastVowel)
//             ) {
//               const temp = content.concat(`${lastConsonant}ing`);
//               wordExtends.add(temp);
//             }
//             return [...wordExtends];
//           }
//           function importSentences() {
//             const phrases = row[7]
//               .split('\n')
//               .map((phrase) => phrase.trim().normalize('NFKD'))
//               .filter((el) => el?.length > 0);
//             const contents = row[8]
//               .split('\n')
//               .map((content) => content.trim().normalize('NFKD'))
//               .filter((el) => el?.length > 0);
//             const meanings = row[9]
//               .split('\n')
//               .map((meaning) => meaning.trim().normalize('NFKD'))
//               .filter((el) => el?.length > 0);
//             const audios = row[10].split('\n').map((audio) => audio.trim());
//             const deepRegex = new RegExp(
//               /[\!\@\#\$\%\^\&\*\)\(\+\=\.\<\>\{\}\[\]\:\;\~\`\_\?\,\”\’\‘\“\"\’\']/g,
//             );
//             for (let i = 0; i < contents.length; i++) {
//               let wordBaseIndex = -1;
//               const splitQuestionMark = contents[i].split('?');
//               let isConversation = false;
//               if (splitQuestionMark[1]?.length > 0) {
//                 isConversation = true;
//               }
//               const texts: string[] = [];
//               const textsWithDR: string[] = [];
//               contents[i].split(' ').forEach((element) => {
//                 const formatted = element.trim();
//                 texts.push(formatted);
//                 const formattedWithDR = formatted.replace(deepRegex, '');
//                 textsWithDR.push(formattedWithDR);
//               });
//               const baseExtensions = getBaseExtensions(wordContent[0]);
//               wordBaseIndex = textsWithDR.findIndex((element) =>
//                 baseExtensions.includes(element),
//               );
//               if (wordBaseIndex === -1) {
//                 const wordExts = getWordExtends(
//                   wordContent[0].normalize('NFKD'),
//                 );
//                 wordBaseIndex = textsWithDR.findIndex((text) =>
//                   wordExts.includes(text),
//                 );
//               }
//               const contentSplit: ContentSplitType[] = [];
//               for (let j = 0; j < textsWithDR.length; j++) {
//                 if (j !== wordBaseIndex) {
//                   contentSplit.push({
//                     _id: `${wordId}${i}en${j}`,
//                     text: texts[j],
//                     types: [],
//                     wordId: '',
//                   });
//                 } else {
//                   const multipleWords = texts
//                     .slice(j, j + wordContent.length)
//                     .join(' ');
//                   contentSplit.push({
//                     _id: `${wordId}${i}en${j}`,
//                     text: multipleWords,
//                     wordId: wordId,
//                     types: [],
//                   });
//                   j = j + wordContent.length - 1;
//                 }
//               }
//               if (!meanings[i]) {
//                 console.log(wordContent);
//                 console.log(meanings);
//                 console.log(contents);
//                 console.log(i);
//               }
//               let translates = meanings[i].split('|');
//               const translateSplit: TranslateSplitType[] = translates[0]
//                 .split(' ')
//                 .map((element, index) => {
//                   return {
//                     _id: `${wordId}${i}vn${index}`,
//                     isFocus: element.includes('_'),
//                     text: element.split('_').join(' ').trim(),
//                   };
//                 });
//               const translate = translates[0]
//                 .split(' ')
//                 .map((el) => el.split('_').join(' ').trim())
//                 .join(' ');
//               translates = translates.map((element) => {
//                 return element
//                   .split(' ')
//                   .map((item) => item.split('_').join(' ').trim())
//                   .join(' ');
//               });
//               //   if (isConversation) {
//               //     let [question, context] = contents[i].split('?');
//               //     question = question.trim();
//               //     context = context.trim();
//               //   }
//               let [lowerBound, upperBound] = [0, 0];
//               if (texts.length > 10) {
//                 lowerBound = 2;
//                 upperBound = 8;
//               }
//               sentences.push({
//                 _id: `${wordId}S${i}`,
//                 audio: audios[i],
//                 baseId: wordId,
//                 bookNId: bookNId,
//                 unitNId: unitNId,
//                 content: contents[i],
//                 contentSplit: contentSplit,
//                 contextSection: '',
//                 isConversation: isConversation,
//                 lowerBound: lowerBound,
//                 upperBound: upperBound,
//                 phrase: phrases[i] ? phrases[i] : '',
//                 position: i,
//                 questionSection: '',
//                 replaceWords: [],
//                 tempTranslates: [],
//                 translate: translate,
//                 translates: translates,
//                 translateSplit: translateSplit,
//                 wordBaseIndex: wordBaseIndex,
//               });
//             }
//           }
//           importSentences();
//         }
//       });
//       return [words, sentences];
//     };

//     const SHEET_NAME = 'Tiếng Anh 3 (Unit 10-demo) Mới';
//     const rows = await readSheet(SHEET_NAME);
//     const [words, sentences] = spreadsheetAnalysis(
//       rows.slice(3),
//       4,
//       3800,
//       '/TA3-DEMO',
//     );
//     await Promise.all([
//       wordsCollection.insertMany(words),
//       sentencesCollection.insertMany(sentences),
//     ]);
//     // const unit = {
//     //   _id: 'whatdoyoudoatbreaktime',
//     //   nId: 3800,
//     //   unitIndex: 1100,
//     //   key: '-LHGyzTkBIlJwOHLFOgK',
//     //   name: `U10. What do you do at break time?`,
//     //   description: 'Tiếng Anh 3 Demo',
//     //   grammar:
//     //     'https://docs.google.com/document/d/1j_viB6zz_anWZy-60R1piWE9gPXQf8HpMITurzEC7Yw/preview',
//     //   tips: 'https://docs.google.com/document/d/1j_viB6zz_anWZy-60R1piWE9gPXQf8HpMITurzEC7Yw/preview',
//     //   wordIds: words.map((w) => w._id),
//     //   sentenceIds: sentences.map((s) => s._id),
//     //   normalImage:
//     //     'https://s.saokhuee.com/lingo/anhunit/Tiếng Anh 3 Tập 1/normal/breaktime.svg',
//     //   blueImage:
//     //     'https://s.saokhuee.com/lingo/anhunit/Tiếng Anh 3 Tập 1/blue/breaktime.svg',
//     //   stories: [69, 73],
//     //   level: [],
//     // };

//     const unit = {
//       _id: 'whatdoyoudoatbreaktime',
//       description: 'Tiếng Anh 3 Tập 1',
//       wordIds: words.map((e) => e._id),
//       sentenceIds: sentences.map((e) => e._id),
//       normalImage:
//         'https://s.saokhuee.com/lingo/anhunit/Tiếng Anh 3 Tập 1/normal/breaktime.svg',
//       blueImage:
//         'https://s.saokhuee.com/lingo/anhunit/Tiếng Anh 3 Tập 1/blue/breaktime.svg',
//       stories: [69, 73],
//       nId: 3800,
//       unitIndex: 1100,
//       key: '-LHGyzTkBIlJwOHLFOgK',
//       name: 'U10. What do you do at break time?',
//       grammar:
//         'https://docs.google.com/document/d/e/2PACX-1vT5w_ssY9G2tu5_pyV3Mrg_upUjfHUBa4Ide9n2Z7UMshe4wUcgwaoVj3QR6bMCHYcbYbhbTbRxff6n/pub',
//       tips: 'https://docs.google.com/document/d/1j_viB6zz_anWZy-60R1piWE9gPXQf8HpMITurzEC7Yw/preview',
//       levels: [],
//       totalLevels: 0,
//       totalLessons: 0,
//       totalQuestions: 0,
//       updatedAt: new Date(),
//       createdAt: new Date(),
//     };

//     // const book = {
//     //   _id: getID('Tiếng Anh 3 Demo'),
//     //   nId: 40,
//     //   key: '',
//     //   cover: '',
//     //   description: '',
//     //   grade: 3,
//     //   name: 'Tiếng Anh 3 Demo',
//     //   number: 23,
//     //   imgName: 'TA3-DEMO',
//     //   totalLessons: 0,
//     //   totalQuestions: 0,
//     //   totalSentences: sentences.length,
//     //   totalWords: words.length,
//     //   units: [{...unit, }],
//     //   createdAt: new Date(),
//     //   updatedAt: new Date(),
//     // };
//     await booksCollection.updateOne(
//       { _id: 'tienganh3tap1' },
//       { $push: { units: unit } },
//     );

//     function getID(alias: string): string {
//       let str = alias;
//       str = str.toLowerCase();
//       str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
//       str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
//       str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
//       str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
//       str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
//       str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
//       str = str.replace(/đ/g, 'd');
//       str = str.replace(
//         /!|@|%|\^|\*|\(|\)|\+|\=|\<| |\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
//         '',
//       );
//       str = str.replace(/ + /g, '');
//       str = str.trim();
//       return str;
//     }
//     console.log(getID('Tiếng Anh 3 Demo'));
//     await client.close();
//   }
// }

// run().then();
import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { SentenceService } from '@lingo/tools/src/imports/services';
import { WordsService } from '@lingo/tools/src/imports/services';
import { BookService } from '@lingo/tools/src/imports/services';
import {
  GoogleAuthorization,
  GoogleSpreadsheetService,
} from '@lingo/tools/src/google/services';
import { SentenceSmoothingParam, WordSmoothingParam } from '../types';
import md5 from 'md5';

const main = async () => {
  const result = dotenv.config();
  if (result.error) {
    throw result.error;
  }
  const envConfig = result.parsed;

  const URI = envConfig.DB_URL;
  const DB_NAME = envConfig.DB_NAME;
  const SHEET_ID = envConfig.DATA_DEMO;

  const client = new MongoClient(URI, { useUnifiedTopology: true });
  await client.connect();
  const database = client.db(DB_NAME);
  const sentencesCollection = database.collection('sentences');
  const wordsCollection = database.collection('words');
  const booksCollection = database.collection('books');

  const auth = await GoogleAuthorization.authorize();
  const spreadsheetService = new GoogleSpreadsheetService(SHEET_ID, auth);
  const sentencesService = new SentenceService(sentencesCollection);
  const wordsService = new WordsService(wordsCollection);
  const booksService = new BookService(booksCollection);

  const demos = [
    {
      bookNId: 4,
      unitNId: 3800,
      imageRoot: 'TA3-DEMO',
      sheetName: 'Tiếng Anh 3 (Unit 10-demo) Mới',
    },
    {
      bookNId: 12,
      unitNId: 6400,
      imageRoot: 'TA7-DEMO',
      sheetName: 'Tiếng Anh 7 (Unit 4-demo) Mới',
    },
  ];

  const closureFunc = async (input: {
    bookNId: number;
    unitNId: number;
    imageRoot: string;
    sheetName: string;
  }) => {
    const SHEET_NAME = input.sheetName;
    const rows = await spreadsheetService.getSheet(SHEET_NAME);
    const usefulRowsSentences: SentenceSmoothingParam[] = [];
    const usefulRowsWords: WordSmoothingParam[] = [];
    const bookNId = input.bookNId;
    const unitNId = input.unitNId;
    const formatUsefulRows = () => {
      const HEADER_MAPPING = new Map<string, number>();
      HEADER_MAPPING.set('STT', 0);
      HEADER_MAPPING.set('UNIT', 1);
      HEADER_MAPPING.set('CONTENT', 2);
      HEADER_MAPPING.set('KINDOF', 3);
      HEADER_MAPPING.set('IMAGE', 4);
      HEADER_MAPPING.set('PHONETICS', 5);
      HEADER_MAPPING.set('MEANING', 6);
      HEADER_MAPPING.set('PHRASE', 7);
      HEADER_MAPPING.set('SENTENCES_CONTENT', 8);
      HEADER_MAPPING.set('SENTENCE_MEANING', 9);
      HEADER_MAPPING.set('AUDIO', 10);

      // await Promise.all(demos.map(()))

      rows.slice(3).forEach((row) => {
        if (row[2]) {
          const wordId = `${input.imageRoot}-`.concat(
            md5(row[HEADER_MAPPING.get('CONTENT')].trim()),
          );
          const sentenceParam: SentenceSmoothingParam = {
            baseIdCol: wordId,
            wordBaseCol: row[HEADER_MAPPING.get('CONTENT')],
            bookNIdCol: bookNId,
            unitNIdCol: unitNId,
            contentCol: row[HEADER_MAPPING.get('SENTENCES_CONTENT')],
            meaningCol: row[HEADER_MAPPING.get('SENTENCE_MEANING')],
            phraseCol: row[HEADER_MAPPING.get('PHRASE')],
            audioCol: row[HEADER_MAPPING.get('AUDIO')],
            grade: 3,
          };
          const wordParam: WordSmoothingParam = {
            wordIdCol: wordId,
            contentCol: row[HEADER_MAPPING.get('CONTENT')],
            meaningCol: row[HEADER_MAPPING.get('MEANING')],
            signature: row[HEADER_MAPPING.get('KINDOF')],
            pronunciationCol: row[HEADER_MAPPING.get('PHONETICS')],
            bookNIdCol: bookNId,
            unitNIdCol: unitNId,
            imageRootCol: row[4].replace(/[\n]/g, '').trim()
              ? input.imageRoot
              : '',
          };
          usefulRowsSentences.push(sentenceParam);
          usefulRowsWords.push(wordParam);
        }
      });
    };
    formatUsefulRows();
    await Promise.all([
      sentencesService.smoothingFromSheet(usefulRowsSentences),
      wordsService.smoothingFromSheet(usefulRowsWords),
    ]);
  };
  await Promise.all(demos.map((element) => closureFunc(element)));
  await client.close();
};

main().then();
