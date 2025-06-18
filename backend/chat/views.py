from rest_framework import generics
from .models import Message
from .serializers import MessageSerializer
from rest_framework.permissions import IsAuthenticated
from api.models import Tenant, Apartment


class ChatView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        tenant = Tenant.objects.get(user=user)
        apartment = tenant.apartment
        return Message.objects.filter(apartment=apartment).order_by("timestamp")

    def perform_create(self, serializer):
        if serializer.is_valid():
            user = self.request.user
            tenant = Tenant.objects.get(user=user)
            serializer.save(sender=tenant, apartment=tenant.apartment)
        else:
            print(serializer.error)
