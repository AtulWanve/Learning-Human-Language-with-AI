# api/urls.py
from django.urls import path
from .views import add_flashcard, get_flashcards, delete_flashcard, search_flashcards, login_user, signup_user, word_search, ai_word_search, get_daily_content
from . import views

urlpatterns = [
    path("add/", add_flashcard, name="add_flashcard"),
    path("all/", get_flashcards, name="get_flashcards"),
    path("delete/", delete_flashcard, name="delete_flashcard"),
    path("search/", search_flashcards, name="search_flashcards"),

    path("login/", login_user, name="login_user"),
    path("signup/", signup_user, name="signup_user"),
    
    path("lookup-word/", word_search, name="lookup_word"),
    path("lookup-word/ai/", ai_word_search, name="ai_lookup_word"),

    path("daily-content/", get_daily_content, name="get_daily_content"),

]
