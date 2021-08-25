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


def word_pronunciation(content: str):
    pronunciation = p.convert(content)
    return pronunciation


