import { Word, WordDocument } from './schema/word.schema';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WordDataOfLesson } from './dto/word.dto';
import { getReplaceCharacter } from 'src/helper/textFormat';
import { Question } from 'src/libs/question-holders/schema/question-holder.schema';
import { SentenceDocument } from 'src/libs/sentences/schema/sentence.schema';
import { Result } from 'src/libs/works/dto/result.dto';
import { SentencesService } from 'src/libs/sentences/sentences.service';
type CreateFakeWordsType = {
  errorWords: WordDataOfLesson[],
  choices: string[]
}

@Injectable()
export class WordsService {

  constructor(
    @InjectModel(Word.name) private readonly wordModel: Model<WordDocument>,
    private readonly sentenceService: SentencesService
    ) { }

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
  async checkAnswer(result: Result, question: Question): Promise<boolean> {
    try {
      if (question.group == "word") {
        switch (question.type) {
          case 9:
            {
              if (Array.isArray(result.answer)) {
                for (const answer of result.answer) {
                  if (typeof answer !== "string" && answer.first !== answer.second)
                    return false;
                }
              }
              return true;
            }
          case 1:
          case 2:
          case 3:
          case 4:
          case 6:
          case 6.6:
          case 6.4:
          case 13:
          case 13.4:
          case 7:
          case 8:
          case 11:
          case 14:
            {
              if (typeof result.answer === "string") {
                if ([2, 3, 4, 6, 6.6, 6.4, 6.6, 13, 13.4].includes(question.type))
                  return question.focus === result.answer;
                const word = await this.wordModel.findById(question.focus)
                if (question.type != 8)
                  return word.content.trim().toLowerCase() === result.answer.trim().toLowerCase();
                return word.meaning.trim().toLowerCase() === result.answer.trim().toLowerCase();
              }
              return true;
            }
          case 12:
            {
              return typeof result.answer === "boolean" && result.answer === true;
            }
          default:
            {
              return true;
            }
        }
      } else
        // 1 2 4 7 10 12 14 15 16 17 18 
        switch (question.type) {
          case 1:
          case 2:
          case 12:
          case 17:
            {
              if (Array.isArray(result.answer)) {
                const sentence = await this.sentenceService.findById(question.focus);
                if (result.answer.length != sentence.contentSplit.length)
                  return false;
                for (let i = 0; i < sentence.contentSplit.length; i++) {
                  const answerText = result.answer[i];
                  const correctText = sentence.contentSplit[i].text.trim().toLowerCase();
                  if (typeof answerText === "string" && answerText.trim().toLowerCase() !== correctText)
                    return false;
                }
              }
              return true;
            }
          case 4:
            {
              return typeof result.answer === "boolean" && question.type === 4;
            }
          case 7:
          case 10:
          case 14:
          case 15:
          case 18:
            {
              if (typeof result.answer === "string") {
                if (question.type === 10)
                  return question.focus === result.answer;
                const sentence = await this.sentenceService.findById(question.focus);
                if (question.type === 7 || question.type === 15) {
                  const correctAnswer = sentence.contentSplit[question.hiddenIndex].text.trim().toLowerCase();
                  if (question.type === 15)
                    return result.answer.toLowerCase().trim() === correctAnswer ? true : false;
                  return correctAnswer === result.answer.trim().toLowerCase();
                } else if (question.type == 14 || question.type === 18)
                  return result.answer.trim().toLowerCase() === sentence.content.trim().toLowerCase();
              }
              return true;
            }
          case 16:
            {
              return true;
            }
          default:
            {
              return true;
            }
        }

    }
    catch (e) {
      throw new InternalServerErrorException(e)
    }
  }
}
