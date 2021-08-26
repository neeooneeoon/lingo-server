import word_service
from drive import words_collection


def main():
    words = word_service.lack_words()
    for w in words:
        content = w['content'].replace(' ', '_').strip()
        pronunciations = list()
        list_types = ()
        if not w['pronunciations']:
            pronunciation = word_service.word_pronunciation(content)
            if pronunciation:
                pronunciations.append('/' + pronunciation +'/')
        if not w['types']:
            list_types =  word_service.word_types(content)
        if not list_types:
            list_types = w['types']
        if not pronunciations:
            pronunciations = w['pronunciations']
        words_collection.update_one(
            {
                '_id': w['_id'],
            },
            {
                '$set': {
                    'types': list_types,
                    'pronunciations': pronunciations,
                }
            }
        )


main()
