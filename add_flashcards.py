from database.db import flashcards_collection

# Example flashcards to insert
flashcards_data = [
    {
        "word": "Apple",
        "meaning": "A round fruit with red or green skin and a white inside.",
        "example_sentence": "I ate an apple for lunch.",
        "synonyms": ["Fruit"],
        "antonyms": []
    },
    {
        "word": "Cat",
        "meaning": "A small, domesticated mammal with fur, a tail, and sharp claws.",
        "example_sentence": "The cat is sleeping on the couch.",
        "synonyms": ["Kitty", "Feline"],
        "antonyms": []
    },
    {
        "word": "Book",
        "meaning": "A set of written, printed, or blank pages fastened together.",
        "example_sentence": "She read a book on the beach.",
        "synonyms": ["Novel", "Text"],
        "antonyms": []
    },
    {
        "word": "Car",
        "meaning": "A road vehicle with four wheels, powered by an engine.",
        "example_sentence": "He drove his car to work.",
        "synonyms": ["Automobile", "Vehicle"],
        "antonyms": []
    },
    {
        "word": "Dog",
        "meaning": "A domesticated carnivorous mammal with a long snout and a barking sound.",
        "example_sentence": "The dog barked at the mailman.",
        "synonyms": ["Pooch", "Canine"],
        "antonyms": []
    },
    {
        "word": "Ball",
        "meaning": "A spherical object used in various games and sports.",
        "example_sentence": "He kicked the ball over the fence.",
        "synonyms": ["Orb", "Sphere"],
        "antonyms": []
    },
    {
        "word": "Tree",
        "meaning": "A perennial plant with an elongated trunk, branches, and leaves.",
        "example_sentence": "The tree provided shade during the summer.",
        "synonyms": ["Plant", "Woodland"],
        "antonyms": []
    },
    {
        "word": "Bird",
        "meaning": "A flying animal with feathers, wings, and a beak.",
        "example_sentence": "The bird chirped in the tree.",
        "synonyms": ["Fowl", "Avian"],
        "antonyms": []
    },
    {
        "word": "House",
        "meaning": "A building used as a place of residence.",
        "example_sentence": "They live in a large house by the lake.",
        "synonyms": ["Home", "Dwelling"],
        "antonyms": []
    },
    {
        "word": "Sun",
        "meaning": "The star at the center of the solar system that provides light and warmth.",
        "example_sentence": "The sun sets behind the mountains.",
        "synonyms": ["Star", "Solar"],
        "antonyms": []
    },
    {
        "word": "School",
        "meaning": "A place where students go to learn.",
        "example_sentence": "She goes to school every day at 8 AM.",
        "synonyms": ["Academy", "Institution"],
        "antonyms": []
    },
    {
        "word": "Water",
        "meaning": "A clear, colorless, odorless liquid essential for life.",
        "example_sentence": "The water in the lake is very cold.",
        "synonyms": ["H2O", "Liquid"],
        "antonyms": []
    },
    {
        "word": "Mountain",
        "meaning": "A large, steep landform that rises prominently above its surroundings.",
        "example_sentence": "We hiked to the top of the mountain.",
        "synonyms": ["Peak", "Hill"],
        "antonyms": []
    },
    {
        "word": "Chair",
        "meaning": "A piece of furniture designed to sit on, typically with a back and legs.",
        "example_sentence": "She sat down on the chair by the desk.",
        "synonyms": ["Seat", "Cushion"],
        "antonyms": []
    },
    {
        "word": "Flower",
        "meaning": "The reproductive structure of a plant, often colorful and fragrant.",
        "example_sentence": "The garden is full of beautiful flowers.",
        "synonyms": ["Blossom", "Petal"],
        "antonyms": []
    },
    {
        "word": "Computer",
        "meaning": "An electronic device used for processing data and performing tasks.",
        "example_sentence": "I use my computer for work and entertainment.",
        "synonyms": ["PC", "Laptop"],
        "antonyms": []
    },
    {
        "word": "Fish",
        "meaning": "A cold-blooded animal that lives in water and has gills.",
        "example_sentence": "The fish swam around the aquarium.",
        "synonyms": ["Aquatic animal", "Sea creature"],
        "antonyms": []
    },
    {
        "word": "Pizza",
        "meaning": "A dish consisting of a flatbread crust topped with sauce, cheese, and other ingredients.",
        "example_sentence": "We had pizza for dinner last night.",
        "synonyms": ["Dish", "Food"],
        "antonyms": []
    },
    {
        "word": "Pen",
        "meaning": "A writing instrument that uses ink to write on paper.",
        "example_sentence": "She used a pen to sign the letter.",
        "synonyms": ["Writing tool", "Marker"],
        "antonyms": []
    }
]

# Insert the example flashcards into MongoDB
flashcards_collection.insert_many(flashcards_data)
print("Example flashcards added to the database.")
