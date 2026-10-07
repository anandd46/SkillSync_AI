
"""
Seed script — populates the database with realistic demo data.
Run: python seed.py
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings
from app.core.security import hash_password
from app.ai.taxonomy import SKILL_TAXONOMY, PROFICIENCY_LEVELS
from datetime import datetime, timedelta
import random

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSession_ = async_sessionmaker(engine, expire_on_commit=False)


async def seed():
    from app.models import *  # Import all models
    async with engine.begin() as conn:
        from app.core.database import Base
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSession_() as db:
        print("🌱 Seeding database...")

        # ── 1. Skill Categories ──────────────────────────────────
        from app.models.skill import SkillCategory, Skill, SkillAlias, SkillLevel
        categories = {}
        category_names = set(s["category"] for s in SKILL_TAXONOMY)
        for cat_name in category_names:
            cat = SkillCategory(name=cat_name)
            db.add(cat)
            await db.flush()
            categories[cat_name] = cat
        print(f"  ✓ {len(categories)} skill categories")

        # ── 2. Skills + Aliases ──────────────────────────────────
        skill_map = {}
        for skill_def in SKILL_TAXONOMY:
            cat = categories.get(skill_def["category"])
            skill = Skill(
                name=skill_def["name"],
                category_id=cat.id if cat else None,
                description=skill_def.get("description"),
                skill_type=skill_def.get("skill_type", "technical"),
                difficulty=skill_def.get("difficulty", "intermediate"),
            )
            db.add(skill)
            await db.flush()
            skill_map[skill.name] = skill

            for alias in skill_def.get("aliases", []):
                db.add(SkillAlias(skill_id=skill.id, alias=alias))

        await db.flush()
        print(f"  ✓ {len(skill_map)} skills seeded")

        # ── 3. Skill Levels ──────────────────────────────────────
        for level, info in PROFICIENCY_LEVELS.items():
            db.add(SkillLevel(level=level, name=info["name"], min_score=info["min_score"], max_score=info["max_score"]))
        await db.flush()

        # ── 4. Institution ───────────────────────────────────────
        from app.models.institution import Institution, Department, Program, Course
        inst = Institution(
            name="Indian Institute of Technology Demo",
            code="IIT-DEMO",
            address="Technology Park, Bengaluru, Karnataka 560001",
            website="https://iitdemo.ac.in",
            contact_email="admin@iitdemo.ac.in",
        )
        db.add(inst)
        await db.flush()

        # Departments
        dept_cs = Department(institution_id=inst.id, name="Computer Science & Engineering", code="CSE")
        dept_ds = Department(institution_id=inst.id, name="Data Science & AI", code="DSAI")
        dept_ec = Department(institution_id=inst.id, name="Electronics & Communication", code="ECE")
        db.add_all([dept_cs, dept_ds, dept_ec])
        await db.flush()

        # Programs
        prog_btech = Program(department_id=dept_cs.id, name="B.Tech Computer Science", code="BTECH-CS", duration_years=4, degree_type="B.Tech")
        prog_mtech = Program(department_id=dept_ds.id, name="M.Tech Data Science", code="MTECH-DS", duration_years=2, degree_type="M.Tech")
        db.add_all([prog_btech, prog_mtech])
        await db.flush()

        # Courses
        courses_data = [
            ("CS101", "Introduction to Programming", "Python programming fundamentals", 4, 1, ["Python", "Problem Solving"]),
            ("CS201", "Data Structures & Algorithms", "Arrays, linked lists, trees, graphs", 4, 3, ["Python", "Problem Solving"]),
            ("CS301", "Database Management Systems", "SQL, relational databases, normalization", 3, 5, ["SQL", "Database Design", "PostgreSQL"]),
            ("CS302", "Web Technologies", "HTML, CSS, JavaScript, React basics", 3, 5, ["JavaScript", "React"]),
            ("CS401", "Machine Learning", "Supervised, unsupervised learning, neural networks", 4, 7, ["Machine Learning", "Python", "Statistics"]),
            ("CS402", "Cloud Computing", "AWS, cloud architecture, deployment", 3, 7, ["AWS", "Cloud Computing"]),
            ("CS403", "Software Engineering", "SDLC, agile, version control", 3, 6, ["Git", "Problem Solving"]),
            ("DS101", "Statistics for Data Science", "Probability, hypothesis testing", 3, 1, ["Statistics", "R", "Data Analysis"]),
            ("DS201", "Data Analysis & Visualization", "Pandas, NumPy, Matplotlib", 3, 3, ["Data Analysis", "Pandas", "NumPy", "Data Visualization"]),
            ("DS301", "Deep Learning", "Neural networks, CNNs, RNNs", 4, 5, ["Deep Learning", "TensorFlow", "PyTorch"]),
        ]

        courses = []
        for code, name, desc, credits, sem, skills in courses_data:
            c = Course(
                program_id=prog_btech.id,
                name=name,
                code=code,
                description=desc,
                credits=credits,
                semester=sem,
            )
            db.add(c)
            await db.flush()
            courses.append((c, skills))

        # Course skills
        from app.models.system import CourseSkill
        for course, skill_names in courses:
            for i, sname in enumerate(skill_names):
                sk = skill_map.get(sname)
                if sk:
                    db.add(CourseSkill(
                        course_id=course.id,
                        skill_id=sk.id,
                        coverage_level=random.randint(3, 5),
                        is_primary=(i == 0),
                    ))
        await db.flush()
        print(f"  ✓ Institution, 3 departments, 2 programs, {len(courses_data)} courses")

        # ── 5. Users (Admin, Faculty) ────────────────────────────
        from app.models.user import User
        from app.models.faculty import Faculty

        admin_user = User(email="admin@example.com", hashed_password=hash_password("Demo@1234"),
                         full_name="Dr. Ananya Krishnan", role="admin", is_active=True, is_verified=True)
        db.add(admin_user)
        await db.flush()

        faculty_users_data = [
            ("faculty@example.com", "Prof. Rajesh Sharma", dept_cs.id),
            ("faculty2@example.com", "Dr. Priya Nair", dept_ds.id),
            ("faculty3@example.com", "Prof. Suresh Kumar", dept_ec.id),
        ]
        faculty_list = []
        for email, name, dept_id in faculty_users_data:
            fu = User(email=email, hashed_password=hash_password("Demo@1234"),
                      full_name=name, role="faculty", is_active=True, is_verified=True)
            db.add(fu)
            await db.flush()
            fp = Faculty(user_id=fu.id, institution_id=inst.id, department_id=dept_id,
                         designation="Associate Professor")
            db.add(fp)
            await db.flush()
            faculty_list.append(fu)
        print(f"  ✓ 1 admin, {len(faculty_users_data)} faculty accounts")

        # ── 6. Industries ────────────────────────────────────────
        from app.models.industry import Industry, JobRole, JobSkill, JobDescription
        from app.models.user import User as UserModel

        industry_user = User(email="industry@example.com", hashed_password=hash_password("Demo@1234"),
                             full_name="TechCorp HR", role="industry", is_active=True, is_verified=True)
        db.add(industry_user)
        await db.flush()

        industries_data = [
            (industry_user.id, "TechCorp Solutions", "Technology", "enterprise"),
            (None, "DataInsight Analytics", "Analytics", "sme"),
            (None, "CloudNine Systems", "Cloud & DevOps", "enterprise"),
            (None, "AI Ventures", "Artificial Intelligence", "startup"),
            (None, "SecureNet Technologies", "Cybersecurity", "sme"),
        ]

        industry_objects = []
        for uid, name, sector, size in industries_data:
            ind = Industry(user_id=uid, name=name, sector=sector, size=size,
                           location="Bengaluru, Karnataka", is_active=True)
            db.add(ind)
            await db.flush()
            industry_objects.append(ind)
        print(f"  ✓ {len(industry_objects)} industries seeded")

        # ── 7. Job Roles + Skills ─────────────────────────────────
        job_roles_data = [
            (industry_objects[0].id, "AI/ML Engineer", "Engineering",
             [("Python", 4), ("Machine Learning", 4), ("Deep Learning", 3), ("SQL", 3), ("Docker", 3), ("AWS", 3)]),
            (industry_objects[0].id, "Backend Developer", "Engineering",
             [("Python", 4), ("FastAPI", 3), ("SQL", 4), ("Docker", 3), ("REST APIs", 4), ("Git", 3)]),
            (industry_objects[0].id, "Frontend Developer", "Engineering",
             [("JavaScript", 4), ("React", 4), ("TypeScript", 3), ("Git", 3)]),
            (industry_objects[1].id, "Data Scientist", "Data Science",
             [("Python", 4), ("Machine Learning", 4), ("Statistics", 4), ("SQL", 3), ("Data Visualization", 3)]),
            (industry_objects[1].id, "Data Analyst", "Data Science",
             [("SQL", 4), ("Python", 3), ("Data Analysis", 4), ("Data Visualization", 3), ("Statistics", 3)]),
            (industry_objects[2].id, "Cloud Engineer", "Cloud",
             [("AWS", 4), ("Docker", 4), ("Kubernetes", 3), ("DevOps", 3), ("Python", 3)]),
            (industry_objects[2].id, "DevOps Engineer", "DevOps",
             [("Docker", 4), ("Kubernetes", 4), ("DevOps", 4), ("AWS", 3), ("Git", 4)]),
            (industry_objects[3].id, "NLP Engineer", "AI",
             [("Python", 4), ("Natural Language Processing", 4), ("Machine Learning", 4), ("Deep Learning", 3)]),
            (industry_objects[4].id, "Cybersecurity Analyst", "Security",
             [("Cybersecurity", 4), ("Python", 3), ("Networking", 3)]),
            (industry_objects[0].id, "Data Engineer", "Data Engineering",
             [("Python", 4), ("SQL", 4), ("Data Engineering", 4), ("AWS", 3), ("Docker", 3)]),
        ]

        job_role_list = []
        for ind_id, title, category, skills in job_roles_data:
            jr = JobRole(industry_id=ind_id, title=title, category=category,
                         description=f"{title} role requiring strong technical skills.", is_active=True)
            db.add(jr)
            await db.flush()

            for sname, level in skills:
                sk = skill_map.get(sname)
                if sk:
                    db.add(JobSkill(job_role_id=jr.id, skill_id=sk.id,
                                    required_level=level, is_mandatory=level >= 3))

            # Add a sample JD
            jd_text = f"""
We are looking for a {title} to join our team.

Requirements:
- {', '.join(s for s, _ in skills[:4])} experience required
- Strong problem-solving and analytical skills
- Experience working in agile teams
- Good communication skills

Responsibilities:
- Design and implement {title.lower()} solutions
- Collaborate with cross-functional teams
- Write clean, maintainable code
- Participate in code reviews
"""
            db.add(JobDescription(job_role_id=jr.id, raw_text=jd_text, processing_status="done",
                                  extracted_skills=[{"skill_name": s, "confidence": 0.9} for s, _ in skills]))
            job_role_list.append(jr)
        await db.flush()
        print(f"  ✓ {len(job_role_list)} job roles seeded")

        # ── 8. Students ──────────────────────────────────────────
        from app.models.student import Student
        from app.models.skill import StudentSkill, StudentSkillEvidence
        from app.models.evidence import Project, Certificate, Internship
        from app.models.ai_models import SkillGap, Recommendation, LearningResource
        from app.models.assessment import Assessment, AssessmentQuestion, AssessmentAttempt

        student_profiles = [
            ("student@example.com", "Demo@1234", "Arjun Mehta", 2022, "AI/ML Engineer", job_role_list[0].id),
            ("student2@example.com", "Demo@1234", "Priya Sharma", 2022, "Data Scientist", job_role_list[3].id),
            ("student3@example.com", "Demo@1234", "Rahul Gupta", 2023, "Backend Developer", job_role_list[1].id),
            ("student4@example.com", "Demo@1234", "Anjali Patel", 2022, "Data Analyst", job_role_list[4].id),
            ("student5@example.com", "Demo@1234", "Karthik Reddy", 2021, "Cloud Engineer", job_role_list[5].id),
            ("student6@example.com", "Demo@1234", "Sneha Iyer", 2023, "Frontend Developer", job_role_list[2].id),
            ("student7@example.com", "Demo@1234", "Vikram Singh", 2022, "DevOps Engineer", job_role_list[6].id),
            ("student8@example.com", "Demo@1234", "Deepa Krishnan", 2021, "Data Engineer", job_role_list[9].id),
            ("student9@example.com", "Demo@1234", "Aditya Joshi", 2023, "NLP Engineer", job_role_list[7].id),
            ("student10@example.com", "Demo@1234", "Meera Nambiar", 2022, "AI/ML Engineer", job_role_list[0].id),
        ]

        # Also add 20 more generic students
        for i in range(11, 31):
            student_profiles.append((
                f"student{i}@example.com", "Demo@1234",
                random.choice(["Ravi", "Neha", "Amit", "Pooja", "Sanjay", "Lakshmi"]) + f" Student{i}",
                random.choice([2021, 2022, 2023]),
                random.choice(["AI/ML Engineer", "Data Scientist", "Backend Developer"]),
                random.choice(job_role_list[:5]).id,
            ))

        all_skills = list(skill_map.values())

        student_users = []
        for email, pwd, name, batch, goal, target_role in student_profiles:
            su = User(email=email, hashed_password=hash_password(pwd),
                      full_name=name, role="student", is_active=True, is_verified=True)
            db.add(su)
            await db.flush()

            sp = Student(
                user_id=su.id,
                institution_id=inst.id,
                department_id=random.choice([dept_cs.id, dept_ds.id]),
                program_id=prog_btech.id,
                roll_number=f"CS{batch % 100:02d}{random.randint(100, 999)}",
                batch_year=batch,
                current_semester=random.randint(4, 8),
                cgpa=round(random.uniform(6.5, 9.5), 2),
                bio=f"Passionate {goal} aspirant with strong technical foundation.",
                career_goal=goal,
                target_role_id=target_role,
                github_url=f"https://github.com/{name.split()[0].lower()}",
                profile_completion=random.uniform(60, 95),
            )
            db.add(sp)
            await db.flush()

            # Assign skills with evidence
            num_skills = random.randint(4, 9)
            assigned_skills = random.sample(all_skills, min(num_skills, len(all_skills)))

            for skill in assigned_skills:
                level = random.randint(1, 5)
                score = random.uniform(level * 15, min(level * 25, 100))
                ss = StudentSkill(
                    student_id=sp.id, skill_id=skill.id,
                    proficiency_level=level, proficiency_score=round(score, 1),
                    is_verified=random.choice([True, False]),
                    evidence_count=random.randint(1, 4),
                )
                db.add(ss)

                for _ in range(random.randint(1, 3)):
                    src = random.choice(["resume", "project", "certificate", "assessment", "self_declared"])
                    db.add(StudentSkillEvidence(
                        student_id=sp.id, skill_id=skill.id,
                        source_type=src,
                        confidence=round(random.uniform(0.5, 0.95), 2),
                        weight=0.1,
                        proficiency_indicated=level,
                        is_verified=random.choice([True, False]),
                    ))

            # Projects
            project_names = [
                ("ML Price Predictor", "ML pipeline for real estate price prediction using scikit-learn",
                 "Python, Machine Learning, Pandas", "https://github.com/demo/ml-predictor"),
                ("E-Commerce API", "REST API backend with FastAPI and PostgreSQL",
                 "Python, FastAPI, PostgreSQL, Docker", "https://github.com/demo/ecommerce-api"),
                ("Data Dashboard", "Interactive analytics dashboard with React and Recharts",
                 "React, TypeScript, Data Visualization", "https://github.com/demo/dashboard"),
            ]
            for title, desc, tech, url in random.sample(project_names, min(2, len(project_names))):
                db.add(Project(
                    student_id=sp.id, title=title, description=desc,
                    tech_stack=tech, github_url=url,
                    start_date=datetime.utcnow() - timedelta(days=random.randint(60, 365)),
                    is_verified=random.choice([True, False]),
                ))

            # Certificates
            certs = [
                ("AWS Cloud Practitioner", "Amazon Web Services", "https://aws.amazon.com/certification"),
                ("Google Data Analytics", "Google", "https://coursera.org/google-data-analytics"),
                ("TensorFlow Developer", "Google", "https://www.tensorflow.org/certificate"),
            ]
            for cert_title, issuer, url in random.sample(certs, 1):
                db.add(Certificate(
                    student_id=sp.id, title=cert_title, issuer=issuer,
                    credential_url=url,
                    issue_date=datetime.utcnow() - timedelta(days=random.randint(30, 200)),
                ))

            await db.flush()
            student_users.append((su, sp))

        print(f"  ✓ {len(student_users)} students seeded with skills, projects, certificates")

        # ── 9. Assessments ───────────────────────────────────────
        assessment_data = [
            {
                "title": "Python Fundamentals", "skill": "Python", "difficulty": "beginner",
                "questions": [
                    ("What is the output of print(type([]))?", "mcq", ["<class 'list'>", "<class 'array'>", "<class 'tuple'>", "Error"], "<class 'list'>"),
                    ("Which keyword defines a function in Python?", "mcq", ["func", "def", "function", "define"], "def"),
                    ("Python is an interpreted language.", "true_false", ["True", "False"], "True"),
                    ("What data structure stores key-value pairs?", "mcq", ["List", "Tuple", "Dictionary", "Set"], "Dictionary"),
                    ("Which method removes the last item from a list?", "mcq", ["remove()", "delete()", "pop()", "discard()"], "pop()"),
                    ("What is the result of 7 // 2?", "mcq", ["3.5", "3", "4", "2"], "3"),
                    ("Lambda functions are anonymous functions.", "true_false", ["True", "False"], "True"),
                    ("Which library is used for numerical computation?", "mcq", ["Pandas", "NumPy", "SciPy", "Matplotlib"], "NumPy"),
                    ("What is the output of len('hello')?", "mcq", ["4", "5", "6", "Error"], "5"),
                    ("Which loop is used for iterating over a sequence?", "mcq", ["while", "for", "do-while", "repeat"], "for"),
                ],
            },
            {
                "title": "Machine Learning Fundamentals", "skill": "Machine Learning", "difficulty": "intermediate",
                "questions": [
                    ("Which algorithm is used for classification?", "mcq", ["Linear Regression", "K-Means", "Logistic Regression", "PCA"], "Logistic Regression"),
                    ("Overfitting occurs when model performs well on training but poorly on test data.", "true_false", ["True", "False"], "True"),
                    ("Which metric is used for regression evaluation?", "mcq", ["Accuracy", "F1-Score", "RMSE", "Precision"], "RMSE"),
                    ("What does 'k' represent in k-Nearest Neighbors?", "mcq", ["Kernel size", "Number of neighbors", "Learning rate", "Number of epochs"], "Number of neighbors"),
                    ("Cross-validation helps prevent overfitting.", "true_false", ["True", "False"], "True"),
                    ("Which technique reduces model complexity?", "mcq", ["Boosting", "Regularization", "Augmentation", "Sampling"], "Regularization"),
                    ("Decision trees can be used for both classification and regression.", "true_false", ["True", "False"], "True"),
                    ("What is the purpose of a validation set?", "mcq", ["Train model", "Tune hyperparameters", "Test final performance", "Clean data"], "Tune hyperparameters"),
                    ("Which algorithm is ensemble-based?", "mcq", ["SVM", "Random Forest", "K-Means", "PCA"], "Random Forest"),
                    ("PCA is used for dimensionality reduction.", "true_false", ["True", "False"], "True"),
                ],
            },
            {
                "title": "SQL Essentials", "skill": "SQL", "difficulty": "intermediate",
                "questions": [
                    ("Which SQL clause filters results?", "mcq", ["ORDER BY", "GROUP BY", "WHERE", "HAVING"], "WHERE"),
                    ("JOIN combines rows from two or more tables.", "true_false", ["True", "False"], "True"),
                    ("Which aggregate function counts rows?", "mcq", ["SUM()", "MAX()", "COUNT()", "AVG()"], "COUNT()"),
                    ("Which JOIN returns all records from left table?", "mcq", ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "CROSS JOIN"], "LEFT JOIN"),
                    ("HAVING is used to filter aggregate results.", "true_false", ["True", "False"], "True"),
                    ("Which command adds new records?", "mcq", ["UPDATE", "INSERT INTO", "ALTER", "MODIFY"], "INSERT INTO"),
                    ("Primary key must be unique and not null.", "true_false", ["True", "False"], "True"),
                    ("Which keyword removes duplicate rows?", "mcq", ["UNIQUE", "DISTINCT", "DIFFERENT", "SEPARATE"], "DISTINCT"),
                    ("What does DDL stand for?", "mcq", ["Data Definition Language", "Data Display Language", "Data Delete Language", "Data Driven Logic"], "Data Definition Language"),
                    ("Indexes improve query performance.", "true_false", ["True", "False"], "True"),
                ],
            },
            {
                "title": "Docker Basics", "skill": "Docker", "difficulty": "intermediate",
                "questions": [
                    ("What is a Docker container?", "mcq", ["Virtual Machine", "Lightweight isolated process", "OS kernel", "Network switch"], "Lightweight isolated process"),
                    ("Dockerfile defines how to build a Docker image.", "true_false", ["True", "False"], "True"),
                    ("Which command runs a container?", "mcq", ["docker build", "docker run", "docker start", "docker exec"], "docker run"),
                    ("Docker Compose manages multi-container apps.", "true_false", ["True", "False"], "True"),
                    ("Which command lists running containers?", "mcq", ["docker list", "docker ps", "docker show", "docker containers"], "docker ps"),
                    ("What is a Docker registry?", "mcq", ["Container runtime", "Storage for images", "Network layer", "Volume manager"], "Storage for images"),
                    ("Containers share the host OS kernel.", "true_false", ["True", "False"], "True"),
                    ("Which command stops a container?", "mcq", ["docker end", "docker stop", "docker kill", "docker pause"], "docker stop"),
                    ("Docker Hub is a public registry.", "true_false", ["True", "False"], "True"),
                    ("What is the purpose of docker-compose.yml?", "mcq", ["Build images", "Define multi-service configs", "Manage networks", "Monitor containers"], "Define multi-service configs"),
                ],
            },
            {
                "title": "Data Analysis with Python", "skill": "Data Analysis", "difficulty": "intermediate",
                "questions": [
                    ("Which library is used for DataFrames?", "mcq", ["NumPy", "Pandas", "Matplotlib", "Seaborn"], "Pandas"),
                    ("df.describe() shows statistical summary.", "true_false", ["True", "False"], "True"),
                    ("Which method handles missing values?", "mcq", ["df.clean()", "df.fillna()", "df.remove()", "df.fix()"], "df.fillna()"),
                    ("GroupBy aggregates data by categories.", "true_false", ["True", "False"], "True"),
                    ("Which function reads CSV files?", "mcq", ["pd.open_csv()", "pd.read_csv()", "pd.load_csv()", "pd.import_csv()"], "pd.read_csv()"),
                    ("Matplotlib is used for plotting.", "true_false", ["True", "False"], "True"),
                    ("Which method merges DataFrames?", "mcq", ["df.join()", "df.concat()", "pd.merge()", "All of the above"], "All of the above"),
                    ("What is EDA?", "mcq", ["Exploratory Data Analysis", "Enhanced Data Algorithm", "Extended Data Access", "External Data Analytics"], "Exploratory Data Analysis"),
                    ("Seaborn is built on top of Matplotlib.", "true_false", ["True", "False"], "True"),
                    ("df.shape returns rows and columns count.", "true_false", ["True", "False"], "True"),
                ],
            },
        ]

        for asmnt_data in assessment_data:
            skill = skill_map.get(asmnt_data["skill"])
            a = Assessment(
                title=asmnt_data["title"],
                skill_id=skill.id if skill else None,
                total_questions=len(asmnt_data["questions"]),
                time_limit_minutes=30,
                passing_score=60.0,
                difficulty=asmnt_data["difficulty"],
                is_active=True,
            )
            db.add(a)
            await db.flush()

            for i, (q_text, q_type, opts, correct) in enumerate(asmnt_data["questions"]):
                db.add(AssessmentQuestion(
                    assessment_id=a.id, skill_id=skill.id if skill else None,
                    question_type=q_type, question_text=q_text,
                    options=opts, correct_answer=correct, points=1,
                    order_index=i, is_active=True,
                ))
        await db.flush()
        print(f"  ✓ {len(assessment_data)} assessments with 10 questions each")

        # ── 10. Learning Resources ───────────────────────────────
        from app.models.ai_models import LearningResource
        resources_to_seed = [
            ("Python for Everybody", "Python", "course", "Coursera", "https://coursera.org/specializations/python", 40, False),
            ("Machine Learning Specialization", "Machine Learning", "course", "Coursera", "https://coursera.org/specializations/machine-learning-introduction", 90, False),
            ("SQL Tutorial", "SQL", "tutorial", "W3Schools", "https://www.w3schools.com/sql/", 5, True),
            ("Docker Get Started", "Docker", "tutorial", "Docker", "https://docs.docker.com/get-started/", 4, True),
            ("AWS Free Tier", "AWS", "project", "AWS", "https://aws.amazon.com/free/", 20, True),
            ("React Official Docs", "React", "tutorial", "React", "https://react.dev/learn", 10, True),
            ("Deep Learning Specialization", "Deep Learning", "course", "Coursera", "https://coursera.org/specializations/deep-learning", 100, False),
            ("Git Handbook", "Git", "tutorial", "GitHub", "https://guides.github.com/introduction/git-handbook/", 3, True),
            ("FastAPI Docs", "FastAPI", "tutorial", "FastAPI", "https://fastapi.tiangolo.com/tutorial/", 8, True),
            ("Kaggle Python Course", "Python", "course", "Kaggle", "https://kaggle.com/learn/python", 5, True),
        ]
        for title, sname, rtype, provider, url, hours, is_free in resources_to_seed:
            sk = skill_map.get(sname)
            db.add(LearningResource(
                skill_id=sk.id if sk else None,
                title=title, resource_type=rtype, provider=provider,
                url=url, estimated_hours=hours, is_free=is_free, is_active=True,
            ))

        # ── 11. Industry Feedback ────────────────────────────────
        from app.models.system import IndustryFeedback
        feedbacks = [
            (industry_objects[0].id, "We need students with stronger cloud and Docker skills. Python proficiency is good but deployment skills are lacking.", "skill_demand", 4.0),
            (industry_objects[1].id, "SQL and data visualization skills from graduates are improving. We need more real-world project experience.", "student_quality", 3.5),
            (industry_objects[2].id, "Kubernetes and DevOps practices are barely covered in curriculum. This is a major gap.", "curriculum_gap", 3.0),
            (industry_objects[3].id, "NLP and LLM skills are in high demand. Students need exposure to transformer models.", "skill_demand", 4.5),
            (industry_objects[4].id, "Cybersecurity curriculum needs more hands-on labs and real attack-defense scenarios.", "curriculum_gap", 3.5),
        ]
        for ind_id, text, ftype, rating in feedbacks:
            db.add(IndustryFeedback(
                industry_id=ind_id, institution_id=inst.id,
                feedback_text=text, feedback_type=ftype, rating=rating,
            ))

        # ── 12. Notifications for demo student ───────────────────
        from app.models.system import Notification
        demo_student_user = student_users[0][0]
        notifs = [
            ("New Skill Gap Identified", "Docker has been identified as a major skill gap for your target role.", "skill_gap"),
            ("Recommendation Available", "5 new learning recommendations have been generated for you.", "recommendation"),
            ("Assessment Ready", "Python Fundamentals assessment is available. Test your skills!", "assessment"),
            ("Industry Feedback", "TechCorp Solutions has provided feedback on student skill requirements.", "info"),
            ("Readiness Score Updated", "Your readiness score has been updated based on your latest activity.", "progress"),
        ]
        for title, msg, ntype in notifs:
            db.add(Notification(user_id=demo_student_user.id, title=title, message=msg, notification_type=ntype))

        await db.commit()
        print(f"  ✓ Learning resources, feedback, notifications seeded")
        print()
        print("✅ Database seeded successfully!")
        print()
        print("Demo Accounts:")
        print("  👤 student@example.com    / Demo@1234  (Student)")
        print("  👨‍🏫 faculty@example.com    / Demo@1234  (Faculty)")
        print("  🔧 admin@example.com      / Demo@1234  (Admin)")
        print("  🏢 industry@example.com   / Demo@1234  (Industry)")


if __name__ == "__main__":
    asyncio.run(seed())
