import nltk
from nltk.stem.wordnet import WordNetLemmatizer
from nltk.tokenize import word_tokenize
from nltk.corpus import wordnet as wn
from drive import database


def is_noun(tag: str) -> bool:
    return tag in ['NN', 'NNS', 'NNP', 'NNPS']


def is_verb(tag: str) -> bool:
    return tag in ['VB', 'VBD', 'VBG', 'VBN', 'VBP', 'VBZ']


def is_adverb(tag: str) -> bool:
    return tag in ['RB', 'RBR', 'RBS']


def is_adjective(tag):
    return tag in ['JJ', 'JJR', 'JJS']


def penn_to_wn(tag):
    if is_adjective(tag):
        return wn.ADJ
    elif is_noun(tag):
        return wn.NOUN
    elif is_adverb(tag):
        return wn.ADV
    elif is_verb(tag):
        return wn.VERB
    return wn.NOUN


async def stories_in_unit(book_id: str, unit_id: str) -> list:
    cursor = database["stories"].find({
        "bookId": book_id,
        "unitId": unit_id,
    })
    return [doc for doc in cursor]


def main():
    pass
