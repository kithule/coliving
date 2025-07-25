from django.urls import path
from . import views

urlpatterns = [
    path("notes/", views.NoteListCreate.as_view(), name="note-list"),
    path("notes/delete/<int:pk>/", views.NoteDelete.as_view(), name="delete-note"),
    path("tenant/", views.GetTenantView.as_view(), name="get-tenant"),
    path("tenants/", views.GetFlatmatesView.as_view(), name="get-flatmates"),
    path("tenant/<int:pk>/", views.GetTenantByIdView.as_view(), name="get-tenant-by-id"),
    path(
        "apartment/create/", views.CreateApartmentView.as_view(), name="join-apartment"
    ),
    path("apartment/join/", views.JoinApartmentView.as_view(), name="join-apartment"),
    path("tasks/", views.TaskListCreate.as_view(), name="task-list"),
    path("tasks/delete/<int:pk>/", views.TaskDelete.as_view(), name="delete-task"),
    path("tasks/update/<int:pk>/", views.TaskUpdateView.as_view(), name="update-task"),
]
