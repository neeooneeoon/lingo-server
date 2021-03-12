import { Word, WordDocument } from './schema/word.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { Model } from 'mongoose';
import { WordDataOfLesson } from './dto/word.dto';
import { getReplaceCharacter } from 'src/helper/textFormat';
import { Question } from 'src/libs/question-holders/schema/question-holder.schema';
import { SentenceDocument } from 'src/libs/sentences/schema/sentence.schema';

type CreateFakeWordsType = {
  errorWords: WordDataOfLesson[],
  choices: string[]
}

@Injectable()
export class WordsService {

  constructor(@InjectModel(Word.name) private readonly wordModel: Model<WordDocument>) { }

  create(createWordDto: CreateWordDto) {
    return 'This action adds a new word';
  }

  findAll() {
    return `This action returns all words`;
  }

  findOne(id: number) {
    return `This action returns a #${id} word`;
  }

  update(id: number, updateWordDto: UpdateWordDto) {
    return `This action updates a #${id} word`;
  }

  remove(id: number) {
    return `This action removes a #${id} word`;
  }
  findWords(wordIds: Set<string>) {
    return this.wordModel.find({ _id: { $in: Array.from(wordIds) } })
  }
  createFakeWords(questionId: string, word: Word, wordIds: Array<string>): CreateFakeWordsType {
    const choicesContent: string[] = [];
    const errorWords: WordDataOfLesson[] = [];
    for (let wordIdIndex = 0; wordIdIndex < wordIds.length; wordIdIndex++) {
      if (wordIds[wordIdIndex] == "ERROR") {
        const content = word.content;
        const loop = true;
        while (loop) {
          const characters = content.split("");
          const random = Math.floor(Math.random() * characters.length);
          if (["?", "!", "-", ".", ",", "'", "`", "_"].includes(characters[random])) {
            continue;
          }
          if (Math.random() <= 0.3) {
            const replaceCharacter = getReplaceCharacter(characters[random]);
            characters[random] = replaceCharacter;
          }
          else if (Math.random() > 0.3 && Math.random() <= 0.6) {
            characters.splice(random, 1);
          }
          else {
            const addCharacter = characters[random].toLowerCase();
            characters.splice(random, 0, addCharacter);
          }
          if (choicesContent.includes(characters.join(""))) {
            continue;
          }
          choicesContent.push(characters.join(""));
          const errorWord: WordDataOfLesson = {
            _id: questionId + "Index" + wordIdIndex,
            content: characters.join(""),
            meaning: word.meaning,
            types: word.types,
            pronunciations: word.pronunciations,
            imageRoot: word.imageRoot,
          };
          wordIds[wordIdIndex] = errorWord._id;
          errorWords.push(errorWord);
          break;

        }
      }
      else if (wordIds[wordIdIndex].includes("@")) {
        const content = wordIds[wordIdIndex].split("@")[1];
        const errorWord: WordDataOfLesson = {
          _id: questionId + "@" + wordIdIndex,
          content: content,
          meaning: content,
          types: [],
          pronunciations: [],
          imageRoot: "",
        };
        wordIds[wordIdIndex] = errorWord._id;
        errorWords.push(errorWord);
      }
    }
    return {
      errorWords: errorWords,
      choices: wordIds
    };
  }
  createFakeWordContent(question: Question, sentence: SentenceDocument, wordsContent: Array<string>): Array<string> {
    const choices: Array<string> = [];
    const hiddenWord = sentence.contentSplit[question.hiddenIndex].text;
    for (let sentenceIdIndex = 0; sentenceIdIndex < question.choices.length; sentenceIdIndex++) {
      if (question.choices[sentenceIdIndex] == "ERROR") {
        if (Math.random() > 0.5) {
          const content = hiddenWord;
          const loop = true;
          while (loop) {
            const characters = content.split("");
            const random = Math.floor(Math.random() * characters.length);
            if (["?", "!", "-", ".", ",", "'", "`", "_"].includes(characters[random])) {
              continue;
            }
            if (Math.random() <= 0.3) {
              const replaceCharacter = getReplaceCharacter(characters[random]);
              characters[random] = replaceCharacter;
            }
            else if (Math.random() > 0.3 && Math.random() <= 0.6) {
              characters.splice(random, 1);
            }
            else {
              const addCharacter = characters[random].toLowerCase();
              characters.splice(random, 0, addCharacter);
            }
            if (choices.includes(characters.join(""))) {
              continue;
            }
            let status = false;
            for (const character of ["?", "!", ",", "."]) {
              if (hiddenWord.includes(character) && hiddenWord.indexOf(character) == hiddenWord.length - 1) {
                choices.push(characters.join("") + character);
                status = true;
              }
            }
            if (status) {
              break;
            }
            choices.push(characters.join(""));
            break;
          }
        }
        else {
          const loop = true;
          while (loop) {
            const content = wordsContent[Math.floor(Math.random() * wordsContent.length)];
            if (content != hiddenWord && content != hiddenWord.replace(/\?|\.|,|!/g, "")) {
              let status = false;
              for (const character of ["?", "!", ",", "."]) {
                if (hiddenWord.includes(character) && hiddenWord.indexOf(character) == hiddenWord.length - 1) {
                  choices.push(content + character);
                  status = true;
                }
              }
              if (status == true)
                break;
              choices.push(content);
              break;
            }
          }
        }
      }
      else if (question.choices[sentenceIdIndex].includes("@")) {
        choices.push(question.choices[sentenceIdIndex].split("@")[1]);
      }
      else {
        choices.push(question.choices[sentenceIdIndex]);
      }
    }
    return choices;
  }
}
