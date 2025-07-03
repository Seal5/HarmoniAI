from rest_framework.test import APITestCase
from django.urls import reverse

class LifestyleClassificationTest(APITestCase):
    def test_lifestyle_case(self):
        url = reverse('classify_conversation')
        data = {
            "user_id": "test_user_lifestyle",
            "session_id": "session_lifestyle",
            "initial_message": "I'm generally doing well, but I'd like to improve my work-life balance and reduce stress. I want to be more mindful and present in my daily life. I'm looking for ways to optimize my wellness routine and be more productive.",
            "clinical_scores": {
                "phq9": 3,
                "gad7": 2,
                "pcl5": 1
            }
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['category'], 'lifestyle') 