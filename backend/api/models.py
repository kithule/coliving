from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class Apartment(models.Model):
    address = models.CharField(max_length=255)
    doorkey = models.CharField(max_length=255)


class Tenant(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    apartment = models.ForeignKey(
        Apartment, on_delete=models.CASCADE, related_name="tenants"
    )


class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(
        Tenant, on_delete=models.CASCADE, related_name="notes"
    )  # an user can have many notes, if delete user delete note)
    apartment = models.ForeignKey(
        Apartment, on_delete=models.CASCADE, related_name="notes"
    )  # an apartment can have many notes


class Task(models.Model):
    PROGRESS = {"TO DO": "To Do", "IN PROGRESS": "In Progress", "DONE": "Done"}
    content = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    due_at = models.DateTimeField()
    progress = models.CharField(max_length=100, choices=PROGRESS)
    apartment = models.ForeignKey(
        Apartment, on_delete=models.CASCADE, related_name="tasks"
    )
    assignee = models.ForeignKey(
        Tenant, on_delete=models.CASCADE, related_name="tasks", null=True, blank=True
    )
