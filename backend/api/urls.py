from django.urls import path
from . import views

urlpatterns = [
    path("notes/", views.NoteListCreate.as_view(), name="note-list"),
    path("notes/delete/<int:pk>/", views.NoteDelete.as_view(), name="delete-note"),
    path("tenant/", views.GetTenantView.as_view(), name="get-tenant"),
    path(
        "apartment/create/", views.CreateApartmentView.as_view(), name="join-apartment"
    ),
    path("apartment/join/", views.JoinApartmentView.as_view(), name="join-apartment"),
]
