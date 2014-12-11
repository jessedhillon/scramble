import json

words = []


def load_words(path):
    global words
    with open(path, 'rU') as f:
        words = json.loads(f.read())
