from rest_framework.test import APITestCase
from django.urls import reverse

class DepressionClassificationTest(APITestCase):
    def test_depression_case(self):
        url = reverse('classify_conversation')
        data = {
            "user_id": "test_user_depression",
            "session_id": "session_depression",
            "initial_message": "I feel so sad and hopeless all the time. Nothing brings me joy anymore, not even things I used to love. I'm exhausted all the time and can barely get out of bed.",
            "clinical_scores": {
                "phq9": 18,
                "gad7": 6,
                "pcl5": 3
            }
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['category'], 'depression') 