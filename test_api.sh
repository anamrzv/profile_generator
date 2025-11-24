#!/bin/bash

# Test the new JSON API
# Make sure the server is running with: npm run serve

# Read the photo file and convert to base64
PHOTO_BASE64=$(base64 -i assets/photo.png)


curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "summary": "Software Engineer 5+ years experience in backend development and cloud computing. Passionate about building scalable applications and learning new technologies.",
    "education": ["B.Sc. Computer Science"],
    "methods": ["Scrum", "Kanban", "TDD", "CI/CD"],
    "languages": ["English (C1)", "German (B2)"],
    "expertise": ["Backend Development", "Cloud Computing", "DevOps", "Microservices"],
    "industryKnowHow": ["Healthcare", "Finance", "E-commerce", "Automotive", "Telecommunications"],
    "itSkills": ["TypeScript", "Node.js", "AWS", "Kubernetes", "Terraform"],
    "itTools": ["Docker", "Jenkins", "Git", "JIRA", "Postman"],
    "projects": [
      {
        "name": "E-commerce Platform",
        "timeRange": "2024 – Present",
        "role": "Lead Developer",
        "industry": "E-commerce",
        "duration": "Ongoing",
        "tools": ["Docker", "Kubernetes", "AWS"],
        "coreBusinessTopics": "Test",
        "projectMethods": ["Scrum", "TDD"],
        "achievements": ["Led modernization initiative", "Reduced deployment time 40%"]
      },
      {
        "name": "SAP Integration",
        "timeRange": "2022 – 2023",
        "role": "Cloud Developer",
        "industry": "E-commerce",
        "duration": "1.5 years",
        "tools": ["Docker", "Kubernetes", "AWS"],
        "coreBusinessTopics": "Test",
        "projectMethods": ["Scrum", "TDD"],
        "achievements": ["Refactored legacy systems", "Transitioned to cloud infrastructure"]
      }
    ],
    "lang": "en",
    "photo": "'"$PHOTO_BASE64"'"
  }' \
  --output cv.pdf