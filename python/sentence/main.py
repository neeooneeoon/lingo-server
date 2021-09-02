import spacy
from sentence import Sentence
from python.sentence.drive import database


def long_sentences():
    cursor = database['sentences'].find()
    data = list()
    for s in cursor:
        if 9 < s['bookNId'] <= 17 and len(s['contentSplit']) >= 8 and s['wordBaseIndex'] != -1:
            data.append({
                '_id': s['_id'],
                'content': s['content'],
                'baseWord': s['contentSplit'][s['wordBaseIndex']]['text']
            })
        elif s['bookNId'] > 17 and len(s['contentSplit']) >= 11 and s['wordBaseIndex'] != -1:
            data.append({
                '_id': s['_id'],
                'content': s['content'],
                'baseWord': s['contentSplit'][s['wordBaseIndex']]['text']
            })

    return data


def main():
    print('Start chunking...')
    nlp = spacy.load('en_core_web_sm')
    sentences = long_sentences()
    if sentences:
        for s in sentences:
            sentence = Sentence(_id=s['_id'], content=s['content'], base_word=s['baseWord'], nlp=nlp)
            phrase = sentence.chunking()
            if phrase is not None:
                database['sentences'].update_one(
                    {
                        '_id': s['_id']
                    },
                    {
                        '$set': {'phrase': phrase}
                    }
                )
    print('Finish')


main()
