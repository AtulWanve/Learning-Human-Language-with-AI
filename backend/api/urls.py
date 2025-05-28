# api/urls.py
from django.urls import path
from .views import add_flashcard, get_flashcards, delete_flashcard, search_flashcards, login_user, signup_user  # Direct import
from . import views

urlpatterns = [
    path("add/", add_flashcard, name="add_flashcard"),
    path("all/", get_flashcards, name="get_flashcards"),
    path("delete/", delete_flashcard, name="delete_flashcard"),
    path("search/", search_flashcards, name="search_flashcards"),
    path("login/", login_user, name="login_user"),
    path("signup/", signup_user, name="signup_user"),
    path('lookup-word/', views.lookup_word, name='lookup_word'),
]
