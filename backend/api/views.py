from django.contrib.auth.models import User
from rest_framework import generics, status, views
from .serializers import (
    UserSerializer,
    NoteSerializer,
    TenantSerializer,
    ApartmentSerializer,
    TaskSerializer,
)
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note, Tenant, Apartment, Task
from rest_framework.response import Response


# Create your views here. (imagine all api calls that frontend needs)
# Need: serializer class, permission classes, query_set
class NoteListCreate(generics.ListCreateAPIView):
    # 2 functionalities: get notes and create note
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        tenant = Tenant.objects.get(user=user)
        apartment = tenant.apartment
        return Note.objects.filter(apartment=apartment)

    def perform_create(self, serializer):
        if serializer.is_valid():
            user = self.request.user
            tenant = Tenant.objects.get(user=user)
            serializer.save(author=tenant, apartment=tenant.apartment)
        else:
            print(serializer.error)


class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        tenant = Tenant.objects.get(user=user)
        return Note.objects.filter(author=tenant)

class GetTenantByIdView(generics.RetrieveAPIView):
    queryset=Tenant.objects.all()
    serializer_class = TenantSerializer
    permission_classes = [IsAuthenticated]


class GetTenantView(generics.RetrieveAPIView):
    serializer_class = TenantSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user
        return Tenant.objects.get(user=user)
    
class GetFlatmatesView(generics.ListAPIView):
    serializer_class=TenantSerializer
    permission_classes=[IsAuthenticated]

    def get_queryset(self):
        user=self.request.user
        tenant=Tenant.objects.get(user=user)
        apartment=tenant.apartment
        return Tenant.objects.filter(apartment=apartment)
    
class CreateUserView(generics.CreateAPIView):
    queryset = (
        User.objects.all()
    )  # return all rows in User table, technically we don't need this but best practices
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # anyone can use the view to create new user


class CreateTenantView(generics.CreateAPIView):
    serializer_class = TenantSerializer
    permission_classes = [AllowAny]  # anyone can use the view to create new user


# for first time users without apartment registered, they have to either create an apartment or join an existing one


class CreateApartmentView(generics.CreateAPIView):
    queryset = Apartment.objects.all()
    serializer_class = ApartmentSerializer
    permission_classes = [IsAuthenticated]

    # Create and automatically join creator to newly created apartment
    def perform_create(self, serializer):
        if serializer.is_valid():
            user = self.request.user
            apartment = serializer.save()
            tenant = Tenant.objects.get(user=user)
            tenant.apartment = apartment
            tenant.save()
        else:
            print(serializer.error)


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
                tenant.apartment = apartment
                tenant.save()
                return Response(
                    {"message": "Joined apartment successfully"},
                    status=status.HTTP_200_OK,
                )

        except Apartment.DoesNotExist:
            return Response(
                {"error": "Apartment does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class TaskListCreate(generics.ListCreateAPIView):
    # 2 functionalities: get notes and create note
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        tenant = Tenant.objects.get(user=user)
        apartment = tenant.apartment
        return Task.objects.filter(apartment=apartment)

    def perform_create(self, serializer):
        if serializer.is_valid():
            user = self.request.user
            tenant = Tenant.objects.get(user=user)
            serializer.save(apartment=tenant.apartment)
        else:
            print(serializer.error)

class TaskDelete(generics.DestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]


class TaskUpdateView(generics.UpdateAPIView):
    queryset=Task.objects.all()
    serializer_class=TaskSerializer

