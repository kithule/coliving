from django.db import models
from api.models import Apartment, Tenant


# Create your models here.
class Message(models.Model):
    sender = models.ForeignKey(
        Tenant, on_delete=models.CASCADE, related_name="messages"
    )
    content = models.TextField()
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name="messages")
    timestamp = models.DateTimeField(auto_now_add=True)
