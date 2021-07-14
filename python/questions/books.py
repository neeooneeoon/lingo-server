from connect_db import books_col
from constants import notExtractBookIds


def get_prev_books(current_grade: int, nId: int):
    cursor = books_col.find(
        {
            "grade": {
                "$lte": current_grade
            },
            "nId": {
                "$lt": nId
            },
            "_id": {
                "$nin": notExtractBookIds
            }
        }
    ).sort("nId", -1)
    return [doc for doc in cursor]

