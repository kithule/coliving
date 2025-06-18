from rest_framework import serializers
from .models import Message
from api.models import Tenant, Apartment


class MessageSerializer(serializers.ModelSerializer):
    # sender = serializers.PrimaryKeyRelatedField(queryset=Tenant.objects.all())
    # apartment = serializers.PrimaryKeyRelatedField(queryset=Apartment.objects.all())
    class Meta:
        model = Message
        fields = ["id", "sender", "content", "apartment", "timestamp"]
        extra_kwargs = {
            "sender": {"read_only": True},
            "apartment": {"read_only": True},
            "timestamp": {"read_only": True},
        }
