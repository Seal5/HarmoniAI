from rest_framework.test import APITestCase
from django.urls import reverse

class CrisisClassificationTest(APITestCase):
    def test_crisis_case(self):
        url = reverse('classify_conversation')
        data = {
            "user_id": "test_user_crisis",
            "session_id": "session_crisis",
            "initial_message": "I cannot take it anymore. I have been thinking about ending my life. I feel like everyone would be better off without me. I have a plan and I do not see any reason to keep going.",
            "clinical_scores": {
                "phq9": 22,
                "gad7": 12,
                "pcl5": 8,
                "phq9_9": 3
            }
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['category'], 'crisis')
        self.assertTrue(response.data['requires_immediate_attention']) 