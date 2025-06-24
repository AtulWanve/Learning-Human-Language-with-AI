#ai_agent.py
import os
import google.generativeai as genai
from datetime import datetime

genai.configure(api_key = "AIzaSyBovxapOhPitn1sur0OBryGSLgBPbaApgI")

def get_available_model():
    preferred_models = ["gemini-1.5-flash", "gemini-1.5-pro"]

    print("Checking for preferred models...")
    for preferred_model_name in preferred_models:
        try:
            model_info = genai.get_model(preferred_model_name)
            if "generateContent" in model_info.supported_generation_methods:
                print(f"Found and selecting preferred model: models/{preferred_model_name}")
                return f"models/{preferred_model_name}"
        except Exception:
            pass

    print("Preferred models not found. Searching all models...")
    for m in genai.list_models():
        if "generateContent" in m.supported_generation_methods and \
           "vision" not in m.name.lower() and "deprecated" not in m.name.lower():
            print(f"Found supported model: {m.name}")
            return m.name
    return None


# Generic function to generate content
def content_from_prompt(prompt):
    model_name = get_available_model()
    model = genai.GenerativeModel(model_name, generation_config={"temperature": 0.9})
    try:
        response = model.generate_content(prompt)
        if response.text:
            return response.text.strip()
        return "No text generated (possibly blocked)."
    except Exception as e:
        print(f"Error generating content: {e}")
        return "Error during content generation."


# Specific generators

def ai_lookup_word(word):
    prompt = (
        f"Provide the following information for the English word '{word}':\n"
        f"1. Meaning\n"
        f"2. Example sentence\n"
        f"3. Synonyms (list 3–5)\n"
        f"4. Antonyms (list 2–3)\n"
        f"Format:\n"
        f"Meaning: <meaning>\n"
        f"Example: <example sentence>\n"
        f"Synonyms: <synonym1>, <synonym2>, ...\n"
        f"Antonyms: <antonym1>, <antonym2>, ..."
    )
    response_text = content_from_prompt(prompt)

    # Structured response
    result = {
        "word": word,
        "meaning": "N/A",
        "example_sentence": "N/A",
        "synonyms": [],
        "antonyms": []
    }

    try:
        for line in response_text.splitlines():
            if line.lower().startswith("meaning:"):
                result["meaning"] = line.split(":", 1)[1].strip()
            elif line.lower().startswith("example:"):
                result["example_sentence"] = line.split(":", 1)[1].strip()
            elif line.lower().startswith("synonyms:"):
                synonyms = line.split(":", 1)[1].strip()
                result["synonyms"] = [s.strip() for s in synonyms.split(",") if s.strip()]
            elif line.lower().startswith("antonyms:"):
                antonyms = line.split(":", 1)[1].strip()
                result["antonyms"] = [a.strip() for a in antonyms.split(",") if a.strip()]
    except Exception as e:
        print(f"Parsing error: {e}")

    return result

def phrase_of_the_day():
    prompt = (
        "Give a random and commonly used English idiom or phrase with its meaning and an example sentence. Avoid repeating idioms that are overly common or used recently.\n"
        "Format:\n"
        "Phrase: <phrase>\n"
        "Meaning: <meaning>\n"
        "Example: <example sentence>"
    )
    response_text = content_from_prompt(prompt)

    result = {
        "phrase": "N/A",
        "meaning": "N/A",
        "example": "N/A"
    }

    try:
        for line in response_text.splitlines():
            if line.lower().startswith("phrase:"):
                result["phrase"] = line.split(":", 1)[1].strip()
            elif line.lower().startswith("meaning:"):
                result["meaning"] = line.split(":", 1)[1].strip()
            elif line.lower().startswith("example:"):
                result["example"] = line.split(":", 1)[1].strip()
    except Exception as e:
        print(f"Parsing error (phrase of the day): {e}")

    return result

def this_day_in_language(date_str=None):
    today = date_str or datetime.now().strftime("%B %d")
    prompt = f"Give a historical or fun fact related to language or linguistics that happened on {today} or a general linguistic fact if nothing specific is known for this day."
    return content_from_prompt(prompt)

def word_of_the_day():
    prompt = (
        "Provide a random and interesting English word of the day with its definition and an example sentence. Avoid common words used recently.\n"
        "Format:\n"
        "Word: <word>\n"
        "Meaning: <meaning>\n"
        "Example: <example sentence>"
    )
    response_text = content_from_prompt(prompt)

    result = {
        "word": "N/A",
        "meaning": "N/A",
        "example": "N/A"
    }

    try:
        for line in response_text.splitlines():
            if line.lower().startswith("word:"):
                result["word"] = line.split(":", 1)[1].strip()
            elif line.lower().startswith("meaning:"):
                result["meaning"] = line.split(":", 1)[1].strip()
            elif line.lower().startswith("example:"):
                result["example"] = line.split(":", 1)[1].strip()
    except Exception as e:
        print(f"Parsing error (word of the day): {e}")

    return result

# Test all from terminal
if __name__ == "__main__":
    model = get_available_model()

    if not model:
        print("\n❌ No suitable Gemini model found.")
    else:
        print("\n✅ Generating Word of the Day...")
        print(word_of_the_day())

        print("\n✅ Generating Phrase of the Day...")
        print(phrase_of_the_day())

        # print("\n✅ Generating This Day in Language...")
        # print(this_day_in_language(model))

        print("\n AI Lookup Test")
        word = input("Enter a word: ")
        print(ai_lookup_word(word))
