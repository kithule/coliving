from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note, Apartment, Tenant
from django.contrib.auth.hashers import make_password


class UserSerializer(serializers.ModelSerializer):
    class Meta:  # inner class to configure serializer
        model = User
        fields = ["id", "username", "password"]  # fiels to be serialized/deserialized
        extra_kwargs = {
            "password": {"write_only": True}
        }  # do not expose in API response

    def create(self, validated_data):
        # use User.objects.create_user() to overwrite Model.objects.create() to hash pwd
        user = User.objects.create_user(
            **validated_data
        )  # ** splits data into arguments
        return user


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        extra_kwargs = {"author": {"read_only": True}}


class ApartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Apartment
        fields = ["id", "address", "doorkey"]
        extra_kwargs = {"doorkey": {"write_only": True}}

    def create(self, validated_data):
        validated_data["doorkey"] = make_password(validated_data["doorkey"])
        apartment = Apartment.objects.create(**validated_data)
        return apartment


class TenantSerializer(serializers.ModelSerializer):  # nested serializer
    user = UserSerializer()

    class Meta:
        model = Tenant
        fields = ["user"]

    def create(self, validated_data):
        user_data = validated_data.pop("user")
        user = User.objects.create_user(**user_data)
        tenant = Tenant.objects.create(user=user)
        return tenant
