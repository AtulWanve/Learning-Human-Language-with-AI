# database/dictionary.py
import requests
import nltk
from nltk.corpus import wordnet
import logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


try:
    wordnet.synsets("car")  # Check if WordNet is downloaded
except LookupError:
    nltk.download('wordnet')
try:
    wordnet.langs()  # Check if omw-1.4 is downloaded
except LookupError:
    nltk.download('omw-1.4')

# Free Dictionary API URL
FREE_DICT_API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/"

# Datamuse API URL
DATAMUSE_API_URL = "https://api.datamuse.com/words"

# Function to fetch word data from Free Dictionary API
def fetch_freedict(word):
    url = f"{FREE_DICT_API_URL}{word}"
    try:
        response = requests.get(url, timeout=0.5)

        response.raise_for_status()  # Check for request errors
        logger.info(f"Free Dictionary API response: {response.json()}")
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching from Free Dictionary API: {e}")
        print(f"Error fetching from Free Dictionary API: {e}")
        return None

# Function to fetch related words from Datamuse API
def fetch_datamuse(word):
    url = f"{DATAMUSE_API_URL}?rel_syn={word}"
    try:
        response = requests.get(url, timeout=1.5)
        response.raise_for_status()  # Check for request errors
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching from Datamuse API: {e}")
        return []

# Function to fetch word data from WordNet (NLTK)
def get_wordnet(word):
    synsets = wordnet.synsets(word)
    word_data = {}

    if synsets:
        # Extract first synset's definition, synonyms, and antonyms
        first_synset = synsets[0]
        word_data["meaning"] = first_synset.definition()
        word_data["synonyms"] = [lem.name() for lem in first_synset.lemmas()]
        word_data["antonyms"] = [ant.name() for lem in first_synset.lemmas() for ant in lem.antonyms()]

    return word_data

# Main function to get all word data (API first, then fallback to WordNet)
def lookup_word(word):
    # First try to fetch from Free Dictionary API
    data = fetch_freedict(word)

    if not data:  # If Free Dictionary API fails, try Datamuse API for synonyms/related words
        related_words = fetch_datamuse(word)
        synonyms = [item["word"] for item in related_words]
        antonyms = []  # Datamuse doesn’t give antonyms
        word_data = {"meaning": "", "example_sentence": "", "synonyms": synonyms, "antonyms": antonyms}
    else:
        # Otherwise, extract the necessary fields from the Free Dictionary API
        word_data = {
            "meaning": data[0].get("meanings", [{}])[0].get("definitions", [{}])[0].get("definition", ""),
            "example_sentence": data[0].get("meanings", [{}])[0].get("definitions", [{}])[0].get("example", ""),
            "synonyms": data[0].get("meanings", [{}])[0].get("synonyms", []),
            "antonyms": data[0].get("meanings", [{}])[0].get("antonyms", []),
        }


    # If no definition from APIs, try WordNet as fallback
    if not word_data.get("meaning"):
        word_data_wn = get_wordnet(word)
        word_data["meaning"] = word_data_wn.get("meaning", "")
        if not word_data.get("synonyms"):
            word_data["synonyms"] = word_data_wn.get("synonyms", [])
        if not word_data.get("antonyms"):
            word_data["antonyms"] = word_data_wn.get("antonyms", [])

    return word_data

# Main logic to test the functions
if __name__ == "__main__":
    search_word = input("Enter a word to search: ")
    word_info = lookup_word(search_word)

    if word_info:
        print(f"\nInformation for '{search_word}':")
        if word_info.get("meaning"):
            print(f"Meaning: {word_info['meaning']}")
        if word_info.get("example_sentence"):
            print(f"Example: {word_info['example_sentence']}")
        if word_info.get("synonyms"):
            print(f"Synonyms: {', '.join(word_info['synonyms'])}")
        if word_info.get("antonyms"):
            print(f"Antonyms: {', '.join(word_info['antonyms'])}")
        if not any(word_info.values()):
            print("No information found for this word.")
    else:
        print("Could not retrieve word information.")
