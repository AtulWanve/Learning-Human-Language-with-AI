# api/urls.py
from django.urls import path
from .views import add_flashcard, get_flashcards, delete_flashcard

urlpatterns = [
    path("add/", add_flashcard, name="add_flashcard"),
    path("all/", get_flashcards, name="get_flashcards"),
    path("delete/", delete_flashcard, name="delete_flashcard"),
]
