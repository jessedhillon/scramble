import random

import scramble.dictionary as dictionary


def get_word(root, request):
    return {
        'word': random.choice(dictionary.words),
    }
