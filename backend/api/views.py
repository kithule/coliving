from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, status, views
from .serializers import (
    UserSerializer,
    NoteSerializer,
    TenantSerializer,
    ApartmentSerializer,
)
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note, Tenant, Apartment
from rest_framework.response import Response


# Create your views here. (imagine all api calls that frontend needs)
# Need: serializer class, permission classes, query_set
class NoteListCreate(generics.ListCreateAPIView):
    # 2 functionalities: get notes and create note
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        address = self.request.address
        return Note.objects.filter(address=address)

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


class GetTenantView(generics.RetrieveAPIView):
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
    permission_class = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.tenant
        return Tenant.objects.filter(user=user)


class CreateUserView(generics.CreateAPIView):
    queryset = (
        User.objects.all()
    )  # return all rows in User table, technically we don't need this but best practices
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # anyone can use the view to create new user


class CreateTenantView(generics.CreateAPIView):
    queryset = (
        Tenant.objects.all()
    )  # return all rows in User table, technically we don't need this but best practices
    serializer_class = TenantSerializer
    permission_classes = [AllowAny]  # anyone can use the view to create new user


# for first time users without address registered, they have to either create an apartment or join an existing one


class CreateApartmentView(generics.CreateAPIView):
    queryset = Apartment.objects.all()
    serializer_class = ApartmentSerializer
    permission_classes = [IsAuthenticated]


class JoinApartmentView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        address = request.data.get("address")
        doorkey = request.data.get("doorkey")

        if not address or not doorkey:
            return Response(
                {"error": "Address and doorkey are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            apartment = Apartment.objects.get(address=address)
            if apartment.doorkey != doorkey:
                return Response(
                    {"error": "Doorkey is incorrect"}, status=status.HTTP_403_FORBIDDEN
                )
            else:
                tenant = Tenant.objects.get(user=request.user)
                tenant.address = address
                tenant.save()

        except Apartment.DoesNotExist:
            return Response(
                {"error": "Apartment does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )
