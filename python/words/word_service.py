from drive import words_collection
import eng_to_ipa as p
import unicodedata as ud
import nltk


def lack_words():
    cursor = words_collection.find({
        "$or": [
            {"types": {"$eq": []}},
            {"pronunciations": {"$eq": []}}
        ]
    })
    return list(cursor)


def word_pronunciation(content):
    pronunciation = p.convert(content)
    return ud.normalize('NFD', pronunciation)


def word_types(content):
    text = nltk.word_tokenize(content)
    [w_content, tag] = nltk.pos_tag(text)[0]
    list_types = list()
    if tag[0] == 'N':
        list_types.append('noun')
        if tag == 'NNS':
            list_types.append('plural noun')
    elif tag[0] == 'V':
        list_types.append('verb')
        if tag[-1] == 'G':
            list_types.append('noun')
    elif tag[0] == 'J':
        list_types.append('adjective')
    elif tag[0] == 'I':
        list_types.append('preposition')
    elif tag[0] == 'R':
        list_types.append('adverb')
    elif tag[0] == 'U':
        list_types.append('exclamation')
    return list_types

