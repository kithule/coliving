# chat/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from api.models import Apartment, Tenant
from .models import Message
from channels.db import database_sync_to_async

from django.contrib.auth.models import User

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self): #triggered by new WebSocket creation
        self.apartment_id = self.scope['url_route']['kwargs']['apartment_id']
        self.room_group_name = f"chat_{self.apartment_id}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code): #triggered when page closed/refreshed
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data): #triggered by socket.send
        data = json.loads(text_data)
        await self.save_message(data['sender'], data['content'], data['timestamp'])
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'content': data['content'],
                'sender': data['sender'],
                'timestamp':data['timestamp'],
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'content': event['content'],
            'sender': event['sender'],
            'timestamp':event['timestamp'],
        }))

    @database_sync_to_async
    def save_message(self, sender, content, timestamp):
        tenant = Tenant.objects.get(id=sender)
        apartment = Apartment.objects.get(id=self.apartment_id)
        return Message.objects.create(
            sender=tenant,
            apartment=apartment,
            content=content,
            timestamp=timestamp
        )
