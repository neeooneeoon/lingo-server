import pymongo

mongo_client = pymongo.MongoClient('mongodb://localhost:27017')
db = mongo_client['tuvungtest']
words_col = db['words']
question_holders_col = db['questionholders']
books_col = db['books']
