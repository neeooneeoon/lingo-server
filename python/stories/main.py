import nltk
from nltk.stem.wordnet import WordNetLemmatizer
from nltk.tokenize import word_tokenize
from nltk.corpus import wordnet as wn
from drive import database
from python.common.main import QuestionTypeCode


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


def in_unit_words(word_content: str, unit_words: list):
    for word in unit_words:
        if word["content"].strip().lower() == word_content:
            return word
    return None


def in_choices(choices: list, item: dict) -> bool:
    content = item["content"]
    meaning = item["meaning"]
    if not content or not meaning:
        return False
    for choice in choices:
        if choice["content"] == content or choice["meaning"] == meaning:
            return True
    return False


def lowest_common_hypernyms(words: list, word: dict, choices: list):
    clone_choices = list(choices)
    marker_index = len(clone_choices)
    word_synsets = wn.synsets(word["content"].lower().strip().replace(" ", "_"))
    if word_synsets and words:
        for i in range(len(word_synsets)):
            for w in list(words):
                content = w["content"].lower().strip()
                meaning = w["meaning"].lower().strip()
                id = w["_id"]
                choice_item = {"content": content, "meaning": meaning}
                if not in_choices(clone_choices, choice_item):
                    w_synsets = wn.synsets(content.replace(" ", "_"))
                    if w_synsets:
                        for ss in w_synsets:
                            rate = word_synsets[i].path_similarity(ss, simulate_root=False)
                            item = {
                                "content": content,
                                "_id": id,
                                "rate": rate,
                                "meaning": meaning
                            }
                            if rate is None:
                                words.remove(w)
                                break
                            elif 0.2 <= rate < 1.0:
                                clone_choices.append(item)
                                words.remove(w)
                                break
                else:
                    words.remove(w)
    latest = sorted(clone_choices, key=lambda i: i["rate"], reverse=True)
    return latest[marker_index:]


async def stories_in_unit(book_id: str, unit_id: str) -> list:
    cursor = database["stories"].find({
        "bookId": book_id,
        "unitId": unit_id,
    })
    return [doc for doc in cursor]


async def books() -> list:
    cursor = database["books"].find()
    return [doc for doc in cursor]


async def words_in_unit(book_nId: int, unit_nId: int) -> list:
    cursor = database["words"].find({
        "bookNId": book_nId,
        "unitNId": unit_nId,
    })
    return [doc for doc in cursor]


def main():
    pass
