"""Lingo sentence for grammar dependency and phrase"""
import re
import spacy
import nltk


class Sentence:
    def __init__(self, _id: str, content: str, base_word: str, nlp: spacy.Language):
        self._id = _id
        self.content = content
        self.base_word = base_word
        self.nlp = nlp

    def chunking(self):
        phrase, chunks = self.noun_phrase()
        if phrase is not None:
            return phrase
        return self.clause_phrase(chunks=chunks)

    def noun_phrase(self):
        content = re.sub("[!@#$%^&*)(+=.<>{}:;|~`_?,'’]", '', self.content)
        base_word = re.sub("[!@#$%^&*)(+=.<>{}:;|~`_?,'’]", '', self.base_word)
        doc = self.nlp(content)
        chunks = list(doc.noun_chunks)
        phrases = [chunk.text for chunk in chunks if base_word in chunk.text]
        if not phrases:
            if len(base_word.split(' ')) > 1:
                return base_word, chunks
            return None, chunks
        return phrases[0], chunks

    def clause_phrase(self, chunks):
        content = re.sub("[!@#$%^&*)(+=.<>{}:;|~_?,”“]", '', self.content)
        content = re.sub("[’`]", "'", content)
        base_word = re.sub("[!@#$%^&*)(+=.<>{}:;|~`_?,”“]", '', self.base_word)
        for chunk in chunks:
            if len(chunk.text.split(' ')) > 1:
                segmentation = chunk.text.replace(' ', '_')
                content = content.replace(chunk.text, segmentation)
        text = nltk.word_tokenize(content)
        list_tags = list(nltk.pos_tag(text))
        matcher = dict()
        for i in range(len(list_tags)):
            word, _ = list_tags[i]
            if base_word in word:
                matcher = {
                    'index': i,
                    'value': list_tags[i]
                }
                break
        if matcher:
            value = matcher['value']
            index = matcher['index']
            word, tag = value
            result = word
            if tag == 'PRP' or tag[0] == 'N':
                for item in list_tags[index+1:]:
                    if item[1][0] == 'N' or 'JJ' in item[1][1]:
                        result += ' ' + item[0]
                        break
                    else:
                        result += ' ' + item[0]
            if tag[0] == 'N' and index == len(list_tags) - 1:
                for item in reversed(list_tags[:index]):
                    if item[1][0] == 'N' or item[1] == 'PRP':
                        result = item[0] + ' ' + result
                        break
                    else:
                        result = item[0] + ' ' + result
            if 'JJ' in tag or tag[0] == 'V':
                for item in reversed(list_tags[:index]):
                    if item[1][0] == 'N' or item[1] == 'PRP':
                        result = item[0] + ' ' + result
                        break
                    else:
                        result = item[0] + ' ' + result
            if 'RB' in tag:
                for item in reversed(list_tags[:index]):
                    if item[1][0] == 'N' or item[1][0] == 'V':
                        result = item[0] + ' ' + result
                        break
                    else:
                        result = item[0] + ' ' + result
                for item in list_tags[index + 1:]:
                    if 'JJ' in item[1]:
                        result = item[0] + ' ' + result
                        break
                    else:
                        result = item[0] + ' ' + result

            if result == word:
                return None
            result = result.replace(" '", "'").replace('_', ' ')
            return result
        return None
