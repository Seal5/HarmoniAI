from rest_framework.test import APITestCase
from django.urls import reverse

class AnxietyClassificationTest(APITestCase):
    def test_anxiety_case(self):
        url = reverse('classify_conversation')
        data = {
            "user_id": "test_user_anxiety",
            "session_id": "session_anxiety",
            "initial_message": "I've been feeling really anxious lately. I can't stop worrying about work and my heart races when I think about upcoming presentations. I'm having trouble sleeping because my mind won't stop racing.",
            "clinical_scores": {
                "gad7": 15,
                "phq9": 8,
                "pcl5": 5
            }
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['category'], 'anxiety') 