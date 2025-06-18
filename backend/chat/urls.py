# urls.py
from django.urls import path
from .views import ChatView

urlpatterns = [
    path("<int:apartment_id>/", ChatView.as_view(), name="chat-history"),
]