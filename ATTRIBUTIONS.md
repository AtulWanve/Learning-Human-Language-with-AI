# Attributions

This project uses the following third-party data sources and software.
Each section lists the source, how it is used, and its license.

---

## Data Sources

### CEFR-J Vocabulary Profile v1.5

- **Used for:** Expert-assigned CEFR levels (B2) and headword selection
- **Source:** [openlanguageprofiles/olp-en-cefrj](https://github.com/openlanguageprofiles/olp-en-cefrj)
- **License:** Free for commercial use with citation
- **Citation:** Tono, Y. (ed.) (2013). *The CEFR-J Wordlist Version 1.5.*
  Tokyo University of Foreign Studies (TUFS).

### Octanove Vocabulary Profile C1/C2 v1.0

- **Used for:** Expert-assigned CEFR levels (C1, C2) and headword selection
- **Source:** [openlanguageprofiles/olp-en-cefrj](https://github.com/openlanguageprofiles/olp-en-cefrj)
- **License:** [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- **Attribution:** © Octanove Labs. Licensed under the Creative Commons
  Attribution-ShareAlike 4.0 International License.

### Princeton WordNet 3.1

- **Used for:** Definitions, example sentences, synonyms, antonyms,
  hypernyms, hyponyms, and part-of-speech classification
- **Source:** [Princeton WordNet](https://wordnet.princeton.edu/)
- **License:** [WordNet 3.0 License](https://wordnet.princeton.edu/license-and-commercial-use)
  (BSD-like; permits commercial use with attribution)
- **Citation:** Princeton University. "About WordNet."
  *WordNet.* Princeton University, 2010.
- **Access:** Via the [NLTK](https://www.nltk.org/) Python package

### CMU Pronouncing Dictionary

- **Used for:** American English phonetic transcriptions (IPA)
- **Source:** [Carnegie Mellon University](http://www.speech.cs.cmu.edu/cgi-bin/cmudict)
- **License:** BSD-2-Clause
- **Access:** Via the [NLTK](https://www.nltk.org/) `cmudict` corpus

### wordfreq

- **Used for:** Zipf frequency scores and heuristic CEFR estimation
  (used only when no expert CEFR label is available)
- **Source:** [rspeer/wordfreq](https://github.com/rspeer/wordfreq)
- **License:** MIT
- **Citation:** Speer, R., et al. (2018). "LuminosoInsight/wordfreq: v2.2."
  *Zenodo.* doi:10.5281/zenodo.1443582

### Google Gemini API

- **Used for:** AI-generated example sentences (ingestion-time gap-fill),
  live AI word lookup, and daily content generation
- **License:** [Google API Terms of Service](https://developers.google.com/terms)
- **Note:** AI-generated content is served dynamically and is not
  redistributed as a static dataset.

---

## Software Dependencies

Runtime dependencies are listed in `requirements.txt`. Key packages:

| Package              | License     | Purpose                                    |
|----------------------|-------------|--------------------------------------------|
| Django               | BSD-3       | Web framework                              |
| django-cors-headers  | MIT         | CORS handling                              |
| pymongo              | Apache-2.0  | MongoDB driver                             |
| google-genai         | Apache-2.0  | Gemini API client                          |
| nltk                 | Apache-2.0  | NLP toolkit (WordNet, CMUdict access)      |
| python-dotenv        | BSD-3       | Environment variable loading               |
| pydantic             | MIT         | Data validation (ingestion schema)         |
| wordfreq             | MIT         | Word frequency data                        |
| phonecodes           | MIT         | ARPAbet to IPA phonetic conversion         |
| lemminflect          | MIT         | Morphological inflection generation        |
