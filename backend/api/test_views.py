from django.test import TestCase
from .models import *
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from  django.urls import reverse #view=>url
from datetime import datetime


class ViewsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_1 = User.objects.create_user(
            username="username1", password="password1"
        )
        self.user_2 = User.objects.create_user(
            username="username2", password="password2"
        )
        self.user_3 = User.objects.create_user(
            username="username3", password="password3"
        )
        self.apartment_1 = Apartment.objects.create(
            address="address1", doorkey="doorkey1"
        )
        self.apartment_2 = Apartment.objects.create(
            address="address2", doorkey="doorkey2"
        )
        self.tenant_1 = Tenant.objects.create(
            user=self.user_1, apartment=self.apartment_1
        )
        self.tenant_2 = Tenant.objects.create(
            user=self.user_2, apartment=self.apartment_2
        )
        self.tenant_3 = Tenant.objects.create(
            user=self.user_3, apartment=self.apartment_1
        )
        self.client.force_authenticate(user=self.user_1)
        self.note_1 = Note.objects.create(
            title="title1", content="content1", author=self.tenant_1,apartment=self.apartment_1
        )
        self.note_2 = Note.objects.create(
            title="title2", content="content2", author=self.tenant_2,apartment=self.apartment_2
        )

        self.task_1 = Task.objects.create(content="task1", due_at=datetime(2025,10,10), progress="TO DO", apartment=self.apartment_1)
        self.task_2 = Task.objects.create(content="task2", due_at=datetime(2025,10,10), progress="TO DO", apartment=self.apartment_2)

    def test_get_notes_by_apartment(self):
        response = self.client.get("/api/notes/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]["title"], "title1")

    def test_create_note_with_post_method(self):
        payload={
            "title": "title3",
            "content": "content3"
        }
        response=self.client.post("/api/notes/", data=payload)
        
        note= Note.objects.get(title="title3")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(note.author,self.tenant_1)
        self.assertEqual(note.apartment,self.apartment_1)

    def test_delete_own_note(self):
        url=reverse("delete-note", kwargs={'pk':self.note_1.id})
        response=self.client.delete(url)
        self.assertEqual(response.status_code,204)
        self.assertFalse(Note.objects.filter(id=self.note_1.id).exists())

    def test_delete_others_note(self):
        url=reverse("delete-note", kwargs={'pk':self.note_2.id})
        response=self.client.delete(url)
        self.assertEqual(response.status_code,404)
        self.assertTrue(Note.objects.filter(id=self.note_2.id).exists())

    def test_get_tenant_by_id(self):
        url = reverse("get-tenant-by-id",kwargs={'pk':self.tenant_1.id})
        response =self.client.get(url)
        self.assertEqual(response.status_code,200)
        self.assertEqual(response.json()["user"]["username"], self.user_1.username)

    def test_get_tenant(self):
        response = self.client.get("/api/tenant/")
        self.assertEqual(response.status_code,200)
        self.assertEqual(response.json()["user"]["username"], self.user_1.username)

    def test_get_tenant_by_apartment(self):
        response = self.client.get("/api/tenants/")
        self.assertEqual(response.status_code,200)
        self.assertEqual(len(response.json()),2)
        self.assertEqual(response.json()[1]["user"]["username"], "username3")

    def test_create_tenant_with_post_method(self):
        payload =  {
            "user": {
                "username": "username4",
                "password": "password4"
            }
        }
        response = self.client.post("/api/user/register/", data=payload, format="json")
        self.assertEqual(response.status_code,201)
        self.assertEqual(response.json()["user"]["username"], "username4")

        
    def test_create_apartment_with_post_method(self):
        payload={
            "address": "address3",
            "doorkey": "doorkey3"
        }
        response=self.client.post("/api/apartment/create/", data=payload)
        tenant=Tenant.objects.get(user=self.user_1)
        self.assertEqual(response.status_code,201)
        self.assertEqual(response.json()["address"], "address3")
        self.assertEqual(tenant.apartment.address, "address3")

    def test_join_apartment(self):
        payload={
            "address": "address1",
            "doorkey": "doorkey1"
        }
        response=self.client.post("/api/apartment/join/",data=payload)
        tenant=Tenant.objects.get(user=self.user_1)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(tenant.apartment.address,"address1")

    def test_get_tasks(self):
        response = self.client.get("/api/tasks/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]["content"], "task1")

    def test_create_task_with_post_method(self):
        payload={
            "content": "task3",
            "due_at":"2025-10-10",
            "progress":"TO DO"
        }
        response=self.client.post("/api/tasks/", data=payload)
        task = Task.objects.get(content="task3")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(task.apartment,self.apartment_1)

    def test_delete_task(self):
        url = reverse("delete-task",kwargs={'pk':self.task_1.id})
        response=self.client.delete(url)
        self.assertEqual(response.status_code,204)
        self.assertFalse(Task.objects.filter(content="task1"))

    def test_update_task(self):
        url = reverse("update-task",kwargs={'pk':self.task_1.id})
        payload = {"progress": "IN PROGRESS"}
        response=self.client.patch(url, data=payload)
        self.assertEqual(response.status_code, 200)
        self.task_1.refresh_from_db()
        self.assertEqual(self.task_1.progress, "IN PROGRESS")

    def test_unauthenticated_user(self):
        self.client.logout()
        response=self.client.get("/api/notes/")
        self.assertEqual(response.status_code,401)
        
