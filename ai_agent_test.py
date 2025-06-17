import os
import google.generativeai as genai
from datetime import datetime

genai.configure(api_key = "")

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
def generate_content_from_prompt(prompt, model_name):
    model = genai.GenerativeModel(model_name, generation_config={"temperature": 0.7})
    try:
        response = model.generate_content(prompt)
        if response.text:
            return response.text.strip()
        return "No text generated (possibly blocked)."
    except Exception as e:
        print(f"Error generating content: {e}")
        return "Error during content generation."


# Specific generators

def generate_example_sentence(word, model_name):
    prompt = f"Give a natural and clear example sentence using the word '{word}' in context."
    return generate_content_from_prompt(prompt, model_name)

def generate_phrase_of_the_day(model_name):
    prompt = (
        "Give a commonly used English idiom or phrase, its meaning, and an example sentence. "
        "Format it as:\nPhrase: <phrase>\nMeaning: <meaning>\nExample: <sentence>"
    )
    return generate_content_from_prompt(prompt, model_name)

def generate_this_day_in_language(model_name, date_str=None):
    today = date_str or datetime.now().strftime("%B %d")
    prompt = f"Give a historical or fun fact related to language or linguistics that happened on {today}."
    return generate_content_from_prompt(prompt, model_name)

def generate_word_of_the_day(model_name):
    prompt = (
        "Provide an interesting English word of the day, its definition, and an example sentence. "
        "Format it as:\nWord: <word>\nDefinition: <definition>\nExample: <sentence>"
    )
    return generate_content_from_prompt(prompt, model_name)


# Test all from terminal
if __name__ == "__main__":
    model = get_available_model()

    if not model:
        print("\n❌ No suitable Gemini model found.")
    else:
        print("\n✅ Generating Word of the Day...")
        print(generate_word_of_the_day(model))

        print("\n✅ Generating Phrase of the Day...")
        print(generate_phrase_of_the_day(model))

        print("\n✅ Generating This Day in Language...")
        print(generate_this_day_in_language(model))

        print("\n📝 Example Sentence")
        word = input("Enter a word: ")
        print(generate_example_sentence(word, model))
