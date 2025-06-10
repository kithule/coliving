from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import (
    UserSerializer,
    NoteSerializer,
    TenantSerializer,
    ApartmentSerializer,
)
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note, Tenant, Apartment


# Create your views here.
# Need: serializer class, permission classes, query_set
class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        apartment = self.request.address
        return Note.objects.filter(address=apartment)

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.tenant)
        else:
            print(serializer.error)


class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        tenant = self.request.tenant
        return Note.objects.filter(author=tenant)


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()  # things to serialize(id, pw)
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # anyone can use the view to create new user
