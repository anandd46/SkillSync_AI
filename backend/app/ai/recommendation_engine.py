"""
Recommendation Engine: Generates personalized learning recommendations.
Rule-based + gap-driven recommendations with XAI explanations.
"""
import logging
from typing import List, Dict, Optional
from app.ai.gap_detector import GapStatus

logger = logging.getLogger(__name__)

# Curated learning resources per skill
LEARNING_RESOURCES_DB = {
    "Python": [
        {"title": "Python for Everybody (Coursera)", "type": "course", "provider": "Coursera", "url": "https://coursera.org/specializations/python", "hours": 40, "free": False},
        {"title": "Python Official Tutorial", "type": "tutorial", "provider": "Python.org", "url": "https://docs.python.org/3/tutorial/", "hours": 10, "free": True},
        {"title": "Build a REST API with FastAPI", "type": "project", "provider": "Practice", "url": "", "hours": 8, "free": True},
        {"title": "Python Data Science Handbook", "type": "book", "provider": "O'Reilly", "url": "https://jakevdp.github.io/PythonDataScienceHandbook/", "hours": 30, "free": True},
    ],
    "Machine Learning": [
        {"title": "Machine Learning Specialization (Andrew Ng)", "type": "course", "provider": "Coursera", "url": "https://coursera.org/specializations/machine-learning-introduction", "hours": 90, "free": False},
        {"title": "Hands-On ML with Scikit-Learn & TensorFlow", "type": "book", "provider": "O'Reilly", "url": "https://github.com/ageron/handson-ml3", "hours": 60, "free": True},
        {"title": "Kaggle ML Competitions", "type": "project", "provider": "Kaggle", "url": "https://kaggle.com/competitions", "hours": 20, "free": True},
        {"title": "Google ML Crash Course", "type": "tutorial", "provider": "Google", "url": "https://developers.google.com/machine-learning/crash-course", "hours": 15, "free": True},
    ],
    "SQL": [
        {"title": "SQL for Data Science (Coursera)", "type": "course", "provider": "Coursera", "url": "https://coursera.org/learn/sql-for-data-science", "hours": 20, "free": False},
        {"title": "SQLZoo Interactive Tutorials", "type": "tutorial", "provider": "SQLZoo", "url": "https://sqlzoo.net", "hours": 8, "free": True},
        {"title": "LeetCode SQL Problems", "type": "project", "provider": "LeetCode", "url": "https://leetcode.com/problemset/database/", "hours": 15, "free": True},
        {"title": "Mode SQL Tutorial", "type": "tutorial", "provider": "Mode", "url": "https://mode.com/sql-tutorial/", "hours": 5, "free": True},
    ],
    "Docker": [
        {"title": "Docker & Kubernetes: The Practical Guide", "type": "course", "provider": "Udemy", "url": "https://udemy.com", "hours": 25, "free": False},
        {"title": "Docker Official Get Started", "type": "tutorial", "provider": "Docker", "url": "https://docs.docker.com/get-started/", "hours": 4, "free": True},
        {"title": "Containerize Your FastAPI App", "type": "project", "provider": "Practice", "url": "", "hours": 5, "free": True},
        {"title": "Play with Docker", "type": "tutorial", "provider": "Docker", "url": "https://labs.play-with-docker.com/", "hours": 3, "free": True},
    ],
    "AWS": [
        {"title": "AWS Cloud Practitioner (Coursera)", "type": "course", "provider": "AWS/Coursera", "url": "https://coursera.org/learn/aws-cloud-practitioner-essentials", "hours": 15, "free": False},
        {"title": "AWS Free Tier Practice", "type": "project", "provider": "AWS", "url": "https://aws.amazon.com/free/", "hours": 20, "free": True},
        {"title": "Deploy ML Model on AWS SageMaker", "type": "project", "provider": "Practice", "url": "", "hours": 10, "free": True},
        {"title": "A Cloud Guru - AWS Fundamentals", "type": "course", "provider": "A Cloud Guru", "url": "https://acloudguru.com", "hours": 20, "free": False},
    ],
    "React": [
        {"title": "React Official Tutorial", "type": "tutorial", "provider": "React", "url": "https://react.dev/learn", "hours": 10, "free": True},
        {"title": "Full Stack Open (React + Node)", "type": "course", "provider": "Helsinki University", "url": "https://fullstackopen.com", "hours": 80, "free": True},
        {"title": "Build a Dashboard App with React", "type": "project", "provider": "Practice", "url": "", "hours": 12, "free": True},
    ],
    "Deep Learning": [
        {"title": "Deep Learning Specialization (Andrew Ng)", "type": "course", "provider": "Coursera", "url": "https://coursera.org/specializations/deep-learning", "hours": 100, "free": False},
        {"title": "Fast.ai Practical Deep Learning", "type": "course", "provider": "Fast.ai", "url": "https://course.fast.ai", "hours": 60, "free": True},
        {"title": "PyTorch Tutorials", "type": "tutorial", "provider": "PyTorch", "url": "https://pytorch.org/tutorials/", "hours": 15, "free": True},
    ],
    "Git": [
        {"title": "Git Handbook", "type": "tutorial", "provider": "GitHub", "url": "https://guides.github.com/introduction/git-handbook/", "hours": 3, "free": True},
        {"title": "Learn Git Branching", "type": "tutorial", "provider": "Interactive", "url": "https://learngitbranching.js.org", "hours": 4, "free": True},
    ],
    "default": [
        {"title": "Search on Coursera", "type": "course", "provider": "Coursera", "url": "https://coursera.org/search?query=", "hours": 20, "free": False},
        {"title": "Free resources on YouTube", "type": "video", "provider": "YouTube", "url": "https://youtube.com", "hours": 10, "free": True},
        {"title": "Practice project", "type": "project", "provider": "Practice", "url": "", "hours": 8, "free": True},
    ],
}


class RecommendationEngine:
    """
    Generates personalized learning recommendations based on skill gaps.
    """

    def generate_recommendations(
        self,
        gaps: List[Dict],
        career_goal: str = "",
        max_recommendations: int = 10,
    ) -> List[Dict]:
        """
        Generate prioritized learning recommendations from skill gaps.
        """
        recommendations = []
        priority_counter = 1

        # Sort gaps: missing > major_gap > partial_gap
        sorted_gaps = sorted(
            gaps,
            key=lambda g: (g["priority"], -g["gap_level"]),
        )

        for gap in sorted_gaps:
            if gap["status"] in (GapStatus.MATCHED, GapStatus.EXCEEDS):
                continue  # No recommendation needed

            skill_name = gap["skill_name"]
            status = gap["status"]
            gap_level = gap["gap_level"]
            required_name = gap["required_level_name"]
            current_name = gap["current_level_name"]

            # Get resources for this skill
            resources = LEARNING_RESOURCES_DB.get(skill_name, LEARNING_RESOURCES_DB["default"])

            # Generate explanation for why this is recommended
            if status == GapStatus.MISSING:
                explanation = (
                    f"{skill_name} was recommended because it is required for the target role "
                    f"(at {required_name} level), but no evidence of this skill was found in your profile. "
                    f"This is a priority gap to address."
                )
                rec_type = "course"
                title_prefix = f"Learn {skill_name}: "
            elif status == GapStatus.MAJOR_GAP:
                explanation = (
                    f"{skill_name} was recommended because your current proficiency ({current_name}) "
                    f"is {gap_level} levels below the required level ({required_name}). "
                    f"This requires a structured learning plan."
                )
                rec_type = "course"
                title_prefix = f"Advance {skill_name}: "
            else:  # partial_gap
                explanation = (
                    f"{skill_name} was recommended to bridge the gap from {current_name} to {required_name}. "
                    f"A focused practice project or advanced course can close this quickly."
                )
                rec_type = "project"
                title_prefix = f"Practice {skill_name}: "

            # Add top resource recommendation
            for resource in resources[:2]:  # top 2 resources per gap skill
                recommendations.append({
                    "priority": priority_counter,
                    "skill_name": skill_name,
                    "gap_status": status,
                    "recommendation_type": resource["type"],
                    "title": resource["title"],
                    "description": f"Improve your {skill_name} skills from {current_name} toward {required_name}.",
                    "explanation": explanation,
                    "resource_url": resource["url"],
                    "provider": resource["provider"],
                    "estimated_hours": resource["hours"],
                    "is_free": resource["free"],
                })
                priority_counter += 1

                if len(recommendations) >= max_recommendations:
                    break

            if len(recommendations) >= max_recommendations:
                break

        return recommendations[:max_recommendations]


# Singleton
_recommendation_instance: Optional[RecommendationEngine] = None


def get_recommendation_engine() -> RecommendationEngine:
    global _recommendation_instance
    if _recommendation_instance is None:
        _recommendation_instance = RecommendationEngine()
    return _recommendation_instance
