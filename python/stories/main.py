import nltk
from nltk.stem.wordnet import WordNetLemmatizer
from nltk.tokenize import word_tokenize
from nltk.corpus import wordnet as wn
from drive import database
from python.common.main import QuestionTypeCode, unused_books, story_question_codes


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


def same_semantic(a: str, b: str) -> bool:
    w_a = a.replace(" ", "_")
    w_b = b.replace(" ", "_")

    wa_synsets = wn.synsets(w_a)
    wb_synsets = wn.synsets(w_b)

    if wa_synsets and wb_synsets:
        for ss1 in wa_synsets:
            for ss2 in wb_synsets:
                rate = ss1.path_similarity(ss2, simulate_root=False)
                if rate == 1.0:
                    return True
                if rate is None:
                    return False
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


def stories_in_unit(book_id: str, unit_id: str) -> list:
    cursor = database["stories"].find({
        "bookId": book_id,
        "unitId": unit_id,
    })
    return [doc for doc in cursor]


def book(book_nId: int):
    book = database["words"].find_one({
        "nId": book_nId
    })
    return book


def prev_books(curr_grade: int, curr_nId: int) -> list:
    cursor = database["books"].find({
        "grade": {
            "$lte": curr_grade
        },
        "nId": {
            "$lt": curr_nId
        },
        "_id": {
            "$nin": unused_books
        }
    }).sort("nId", -1)
    books = [doc for doc in cursor]
    return books


def words_in_unit(book_nId: int, unit_nId: int) -> list:
    cursor = database["words"].find({
        "bookNId": book_nId,
        "unitNId": unit_nId,
    })
    return [doc for doc in cursor]


def words_in_book(nId: int) -> list:
    cursor = database["words"].find({
        "bookNId": nId,
    }).sort("unitNId", -1)
    return [doc for doc in cursor]


def words_in_prev_unit(book_nId: int, unit_nId: int) -> list:
    cursor = database["words"].find({
        "unitNId": {
            "$lt": unit_nId
        },
        "bookNId": book_nId,
    })
    return [doc for doc in cursor]


def get_choices(word_id: str, choices: list, question_type: int) -> list:
    clone_choices = list(choices)
    word = database["words"].find_one({"_id": word_id})
    if word:
        word_content = word["content"].lower().strip()
        word_meaning = word["meaning"].lower().strip()
        correct_choice = {"rate": 2.0, "content": word_content, "meaning": word_meaning}
        clone_choices.append(correct_choice)
        words_unit = words_in_unit(book_nId=int(word["bookNId"]), unit_nId=int(word["unitNId"]))
        curr_book = book(book_nId=int(word["bookNId"]))
        max_choices = 11
        if curr_book["grade"] <= 3:
            max_choices = 6
        if words_unit:
            for w in words_unit:
                content = w["content"].lower().strip()
                meaning = w["meaning"].lower().strip()
                item = {"content": content, "meaning": meaning}
                if not in_choices(clone_choices, item) and not same_semantic(word_content, content):
                    clone_choices.append({
                        "_id": w["_id"],
                        "content": content,
                        "meaning": meaning,
                        "rate": 2.0,
                    })
        if len(clone_choices) < max_choices:
            words_prev_unit = words_in_prev_unit(book_nId=int(word["bookNId"]), unit_nId=int(word["unitNId"]))
            if words_prev_unit:
                hypernyms = lowest_common_hypernyms(words_prev_unit, word, clone_choices)
                clone_choices.extend(hypernyms)
        if len(clone_choices) < max_choices:
            books = prev_books(curr_grade=curr_book["grade"], curr_nId=curr_book["nId"])
            if books:
                for book in books:
                    if len(clone_choices) >= max_choices:
                        break
                    words_prev_book = words_in_book(book["nId"])
                    if words_prev_book:
                        hypernyms = lowest_common_hypernyms(words_prev_book, word, clone_choices)
                        clone_choices.extend(hypernyms)
        if len(clone_choices) < max_choices:
            words_prev_unit


def main():
    pass
