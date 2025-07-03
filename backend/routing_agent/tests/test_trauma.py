from rest_framework.test import APITestCase
from django.urls import reverse

class TraumaClassificationTest(APITestCase):
    def test_trauma_case(self):
        url = reverse('classify_conversation')
        data = {
            "user_id": "test_user_trauma",
            "session_id": "session_trauma",
            "initial_message": "I keep having flashbacks to the accident. I can't sleep because of the nightmares. Every time I hear a loud noise, I jump and feel like I'm back there. I avoid driving now because it triggers memories. I feel like I'm always on edge.",
            "clinical_scores": {
                "pcl5": 28,
                "phq9": 12,
                "gad7": 14
            }
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['category'], 'trauma') 