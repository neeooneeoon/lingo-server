import { extendedWords } from '../../helpers';
import {
  SentenceSmoothingParam,
  ContentSplitType,
  TranslateSplitType,
  SentenceInSheet,
} from '../types';
import { Collection } from 'mongodb';
import fs from 'fs';
import path from 'path';

export class SentenceService {
  private readonly sentencesCollection: Collection<any>;

  constructor(_collection: Collection<any>) {
    this.sentencesCollection = _collection;
  }

  public async smoothingFromSheet(usefulRows: SentenceSmoothingParam[]) {
    const max_words =
      usefulRows[0].grade <= 5 ? 6 : usefulRows[0].grade <= 9 ? 8 : 9;
    const result: SentenceInSheet[] = [];
    for (const row of usefulRows) {
      //Format data
      const listContents = row.contentCol
        .split('\n')
        .filter((element) => element?.trim());
      const listMeanings = row.meaningCol
        .split('\n')
        .filter((element) => element?.trim());
      const listPhrase = row.phraseCol
        .split('\n')
        .filter((element) => element.trim());
      const listAudios = row.audioCol
        .split('\n')
        .filter((element) => element?.trim());
      const baseId = row.baseIdCol.trim();
      const wordBase = row.wordBaseCol.trim();
      const bookNId = row.bookNIdCol;
      const unitNId = row.unitNIdCol;

      const deepRegex = new RegExp(
        /[\!\@\#\$\%\^\&\*\)\(\+\=\.\<\>\{\}\[\]\:\;\~\`\_\?\,\”\’\‘\“\"\’\']/g,
      );

      //Separate sentences
      for (let i = 0; i < listContents.length; i++) {
        if (!listContents[i] || !listMeanings[i] || !wordBase || !baseId)
          continue;
        const contentSplit: Array<ContentSplitType> = [];
        let wordBaseIndex = -1;
        let isConversation = false;

        const [questionSection, contextSection] = listContents[i]
          .split('?')
          .map((element) => element.trim());
        if (questionSection.length > 1 && contextSection?.length > 1) {
          const sectionRegex = /[“”"]/g;
          if (
            !sectionRegex.test(questionSection) &&
            !sectionRegex.test(contextSection)
          ) {
            isConversation = true;
          }
        }
        const textSplit = listContents[i]
          .split(' ')
          .map((element) => element.trim().normalize('NFKD'))
          .filter((element) => element);
        const withDeepRegex = textSplit.map((element) =>
          element.replace(deepRegex, '').toLowerCase(),
        );
        const wordBaseSplit = wordBase.split(' ').filter((item) => item);
        let extendWords = extendedWords(wordBaseSplit[0]);
        wordBaseIndex = withDeepRegex.findIndex((element) =>
          extendWords.includes(element),
        );
        if (wordBaseIndex === -1) {
          extendWords = extendedWords(wordBaseSplit[0], true);
          wordBaseIndex = withDeepRegex.findIndex((element) =>
            extendWords.includes(element),
          );
        }
        for (let j = 0; j < withDeepRegex.length; j++) {
          if (j !== wordBaseIndex) {
            contentSplit.push({
              _id: `${baseId}${i}en${j}`,
              text: textSplit[j],
              types: [],
              wordId: '',
            });
          } else {
            const multipleWords = textSplit
              .slice(j, j + wordBaseSplit.length)
              .join(' ');
            contentSplit.push({
              _id: `${baseId}${i}en${j}`,
              text: multipleWords,
              wordId: baseId,
              types: [],
            });
            j = j + wordBaseSplit.length - 1;
          }
        }
        const translates = [listMeanings[i].replace(/[\_]/g, ' ')];
        const translateSplit: TranslateSplitType[] = [];

        listMeanings[i].split(' ').forEach((element, j) => {
          if (element.includes('_')) {
            translateSplit.push({
              _id: `${baseId}${i}vn${j}`,
              text: element.split('_').join(' ').trim(),
              isFocus: true,
            });
          } else {
            translateSplit.push({
              _id: `${baseId}${i}vn${j}`,
              text: element.trim(),
              isFocus: false,
            });
          }
        });
        const lowerBound = contentSplit.length > max_words ? 2 : 0;
        const upperBound = contentSplit.length > max_words ? max_words : 0;
        result.push({
          _id: `${baseId}S${i}`,
          content: listContents[i],
          bookNId: bookNId,
          unitNId: unitNId[0],
          position: i,
          baseId: baseId,
          tempTranslates: [],
          wordBaseIndex: wordBaseIndex,
          translate: translates[0],
          translates: translates,
          audio: listAudios[i],
          contentSplit: contentSplit,
          translateSplit: translateSplit,
          replaceWords: [],
          lowerBound: lowerBound,
          upperBound: upperBound,
          questionSection: questionSection,
          contextSection: contextSection ? contextSection : '',
          isConversation: isConversation,
          phrase:
            listPhrase[i]?.toUpperCase().length > 0 &&
            listPhrase[i]?.toUpperCase() !== 'NULL'
              ? listPhrase[i].trim()
              : '',
        });
      }
    }
    await Promise.all(
      usefulRows[0].unitNIdCol.map((unitNId) =>
        this.sentencesCollection.updateMany(
          {
            bookNId: usefulRows[0].bookNIdCol,
            unitNId: unitNId,
          },
          {
            $set: {
              bookNId: usefulRows[0].bookNIdCol * 100,
              unitNId: unitNId * 100,
            },
          },
        ),
      ),
    );
    await this.sentencesCollection.insertMany(result);
    // const destinationFile = path.join(__dirname, './sentenceDemo.json');
    // fs.writeFileSync(destinationFile, JSON.stringify(result));
    // console.log(result.length);
  }
}
