import verbs from './irregularVerbs.json';
import { WORD_CLASSIFY_MAPPING } from '@lingo/tools/src/constants';

export function extendedWords(content: string, irregular = false) {
  const irregularVerbs = irregular ? verbs : [];
  const wordExtends = new Set([
    content,
    `${content}s`,
    `${content}ing`,
    `${content}ed`,
    `${content}er`,
    `${content}est`,
    `${content}es`,
    ...irregularVerbs,
  ]);
  const contentLength = content.length;
  const str1 = content.slice(contentLength - 1);
  const str2 = content.slice(contentLength - 2);
  const vowels = ['u', 'e', 'o', 'a', 'i'];
  const unExtractedConsonants = ['h', 'w', 'x', 'y'];
  const lastConsonant = content[content.length - 1];
  const lastVowel = content[content.length - 2];

  if (str1 == 'y') {
    const slicedContent = content.slice(0, contentLength - 1);
    const temp1 = slicedContent.concat('ies');
    const temp2 = slicedContent.concat('ied');
    wordExtends.add(temp1);
    wordExtends.add(temp2);
  } else if (str1 == 'e') {
    const temp = content.slice(0, contentLength - 1).concat('ing');
    wordExtends.add(temp);
    wordExtends.add(content.concat('d'));
  }
  if (str2 == 'ie') {
    const temp = content.slice(0, contentLength - 2).concat('ying');
    wordExtends.add(temp);
  }
  if (
    lastVowel &&
    !unExtractedConsonants.includes(lastConsonant) &&
    vowels.includes(lastVowel)
  ) {
    const temp = content.concat(`${lastConsonant}ing`);
    wordExtends.add(temp);
    wordExtends.add(content.concat(`${lastConsonant}ed`));
    wordExtends.add(content.concat(`${lastConsonant}er`));
  }
  if (
    lastVowel &&
    !unExtractedConsonants.includes(lastConsonant) &&
    vowels.includes(lastVowel)
  ) {
    const temp = content.concat(`${lastConsonant}ing`);
    wordExtends.add(temp);
  }
  return [...wordExtends];
}

export function wordClassification(signature: string) {
  const label = WORD_CLASSIFY_MAPPING.get(signature.toUpperCase());
  return label;
}

export function getID(alias: string): string {
  let str = alias;
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<| |\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    '',
  );
  str = str.replace(/ + /g, '');
  str = str.trim();
  return str;
}
