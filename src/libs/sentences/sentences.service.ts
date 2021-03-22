import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateSentenceDto } from './dto/create-sentence.dto';
import { UpdateSentenceDto } from './dto/update-sentence.dto';
import { Sentence, SentenceDocument } from './schema/sentence.schema';
import { WordDocument } from 'src/libs/words/schema/word.schema';
import { SentenceDataOfLesson } from './dto/sentence.dto';
import { getReplaceCharacter } from 'src/helper/textFormat';

type CreateFakeSentencesType = {
  errorSentences: Array<SentenceDataOfLesson>,
  choices: Array<string>
}
@Injectable()
export class SentencesService {

  constructor(@InjectModel(Sentence.name) private readonly sentenceModel: Model<SentenceDocument>) { }

  findSentences(sentenceIds: Set<string>) {
    return this.sentenceModel.find({ _id: { $in: Array.from(sentenceIds) } });
  }

  findById(id: string) {
    return this.sentenceModel.findById(id);
  }

  createFakeSentences(questionId: string, sentence: SentenceDocument, words: Array<WordDocument>, sentenceIds: string[]): CreateFakeSentencesType {
    const errorSentences: Array<SentenceDataOfLesson> = [];
    let randomIndexes: Array<number> = Array.from(Array(sentence.contentSplit.length).keys()).sort(() => Math.random() - 0.5);
    let wordIndexes: Array<number> = Array.from(Array(words.length).keys()).sort(() => Math.random() - 0.5);
    for (let sentenceIdIndex = 0; sentenceIdIndex < sentenceIds.length; sentenceIdIndex++) {
      if (sentenceIds[sentenceIdIndex] == "ERROR") {
        let fakeSentenceContent = "";
        if (sentence.wordBaseIndex >= 0) {
          const focusChangeWord = words.find(word => word._id == sentence._id.slice(0, sentence._id.length - 2));
          const sameGroupWordIds = focusChangeWord.noImageWords.concat(focusChangeWord.haveImageWords);
          let replaceWords: WordDocument[];

          if (sameGroupWordIds)
            replaceWords = words.filter(word => sameGroupWordIds.includes(word._id));

          if (replaceWords.length == 0) {
            if (focusChangeWord.types.length > 0) {
              replaceWords = words.filter(word => {
                for (let i = 0; i < focusChangeWord.types.length; i++)
                  if (word.types.includes(focusChangeWord.types[i]))
                    return word;
              });
            }
          }

          if (replaceWords.length == 0)
            replaceWords = words;
          const replaceWord = replaceWords[Math.floor(Math.random() * replaceWords.length)].content;

          for (let swIndex = 0; swIndex < sentence.contentSplit.length; swIndex++) {
            if (swIndex == sentence.wordBaseIndex) {
              for (const character of ["?", "!", ",", "."]) {
                const currentContent = sentence.contentSplit[sentence.wordBaseIndex].text;
                if (currentContent.includes(character) && currentContent.indexOf(character) == currentContent.length - 1) {
                  fakeSentenceContent += replaceWord + character + " ";
                  continue;
                }
              }
              fakeSentenceContent += replaceWord + " ";
            } else
              fakeSentenceContent += sentence.contentSplit[swIndex].text + " ";
          }
        } else {
          if (randomIndexes.length == 0)
            randomIndexes = Array.from(Array(sentence.contentSplit.length).keys()).sort(() => Math.random() - 0.5);
          if (wordIndexes.length == 0)
            wordIndexes = Array.from(Array(words.length).keys()).sort(() => Math.random() - 0.5);
          const randomIndex = randomIndexes.pop();
          for (let swIndex = 0; swIndex < sentence.contentSplit.length; swIndex++) {
            if (swIndex == randomIndex) {
              const content = sentence.contentSplit[randomIndex].text;
              const loop = true;
              while (loop) {
                const characters = content.split("");
                const random = Math.floor(Math.random() * characters.length);
                if (["?", "!", "-", ".", ",", "'", "`", "_"].includes(characters[random]))
                  continue;
                if (Math.random() <= 0.3) {
                  const replaceCharacter = getReplaceCharacter(characters[random]);
                  characters[random] = replaceCharacter;
                } else if (Math.random() > 0.3 && Math.random() <= 0.6) {
                  characters.splice(random, 1);
                } else {
                  const addCharacter = characters[random].toLowerCase();
                  characters.splice(random, 0, addCharacter);
                }
                let status = false;
                for (const character of ["?", "!", ",", "."]) {
                  if (characters.join("").includes(character) &&
                    characters.join("").indexOf(character) == characters.length - 1) {
                    fakeSentenceContent += characters.join("") + character + " ";
                    status = true;
                  }
                }
                if (status)
                  break;
                fakeSentenceContent += characters.join("") + " ";
                break;
              }
            } else
              fakeSentenceContent += sentence.contentSplit[swIndex].text + " ";
          }
        }
        const fakeSentence: SentenceDataOfLesson = {
          _id: questionId + "ERROR" + sentenceIdIndex,
          audio: sentence.audio,
          enText: fakeSentenceContent.trim(),
          vnText: sentence.translate,
          vn: sentence.translateSplit.map(val => ({ _id: val._id, text: val.text, wordId: "" })),
          en: sentence.contentSplit.map(val => ({ _id: val._id, text: val.text, wordId: val.wordId }))
        };
        sentenceIds[sentenceIdIndex] = fakeSentence._id;
        errorSentences.push(fakeSentence);
      }
      else if (sentenceIds[sentenceIdIndex].includes("@")) {
        const content = sentenceIds[sentenceIdIndex].split("@")[1];
        const fakeSentence: SentenceDataOfLesson = {
          _id: questionId + "@" + sentenceIdIndex,
          audio: sentence.audio,
          enText: content.trim(),
          vnText: sentence.translate,
          vn: sentence.translateSplit.map(val => ({ _id: val._id, text: val.text, wordId: "" })),
          en: sentence.contentSplit.map(val => ({ _id: val._id, text: val.text, wordId: val.wordId }))
        };
        sentenceIds[sentenceIdIndex] = fakeSentence._id;
        errorSentences.push(fakeSentence);
      }
    }
    return {
      errorSentences: errorSentences,
      choices: sentenceIds
    }
  }
}
