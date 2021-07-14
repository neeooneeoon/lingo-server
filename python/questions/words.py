from connect_db import words_col


def get_words_in_prev_book(book_nId: int):
    cursor = words_col.find(
        {
            "bookNId": book_nId,
        }
    ).sort("unitNId", -1)
    return [doc for doc in cursor]
