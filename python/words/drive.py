import pymongo

client = pymongo.MongoClient("mongodb://localhost:27017/")
database = client["tuvungtest"]
words_collection = database["words"]