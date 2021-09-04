from python.distractor.distractor import Distractor
import nltk
from nltk.corpus import wordnet as wn

nltk.download('wordnet')


def main():
    original_word = "brother"
    word_synsets_one = wn.synsets(original_word)
    word_synsets_two = wn.synsets('fox')
    for w1 in word_synsets_one:
        for w2 in word_synsets_two:
            rate = w1.wup_similarity(w2, verbose=False, simulate_root=False)
            print(rate)
    print(word_synsets_one)
    print(word_synsets_two)
    synset_to_use = wn.synsets(original_word)[0]
    distractors_calculated = Distractor.get_distractors_wordnet(synset_to_use, original_word)
    print(distractors_calculated)


main()
