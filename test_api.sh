#!/bin/bash

# Test the new JSON API
# Make sure the server is running with: npm run serve

# Read the photo file and convert to base64
PHOTO_BASE64=$(base64 -i assets/photo.png)


curl -X POST http://localhost:3000/api/generate/html \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Anna Munoz",
    "title": "SAP Cloud Native Developer",
    "summary": "Software Engineer 3+ years of experience delivering enterprise and SAP solutions. Passionate about building scalable applications and learning new technologies.",
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
          "from": "2024-12-31T23:00:00.000Z",
          "to": null,
        "role": "Lead Developer",
        "industry": "E-commerce",
        "tools": ["Docker", "Kubernetes", "AWS"],
        "coreBusinessTopics": "Test",
        "projectMethods": ["Scrum", "TDD"],
        "achievements": ["Led modernization initiative", "Reduced deployment time 40%"]
      },
      {
        "name": "SAP Integration",
          "from": "2024-01-01T00:00:00.000Z",
          "to": "2025-11-23T23:00:00.000Z",
        "role": "Cloud Developer",
        "industry": "E-commerce",
        "tools": ["Docker", "Kubernetes", "AWS"],
        "coreBusinessTopics": "Test",
        "projectMethods": ["Scrum", "TDD"],
        "achievements": ["Refactored legacy systems", "Transitioned to cloud infrastructure"]
      }
    ],
    "lang": "en",
    "photo": "'"$PHOTO_BASE64"'"
  }' \
  --output cv.html