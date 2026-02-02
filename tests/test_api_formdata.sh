#!/bin/bash

echo "Sending request to http://localhost:3000/api/generate..."

mkdir -p out

curl -X POST http://localhost:3000/api/generate/docx \
  -F "name=Anna Munoz" \
  -F "title=SAP Cloud Native Developer" \
  -F "summary=Software Engineer 3+ years of experience delivering enterprise and SAP solutions. Passionate about building scalable applications and learning new technologies." \
  -F "education=[\"B.Sc. Computer Science\"]" \
  -F "methods=[\"Scrum\", \"Kankan\", \"TDD\", \"CI/CD\"]" \
  -F "languages=[\"English (C1)\", \"German (B2)\"]" \
  -F "expertise=[\"Backend Development\", \"Cloud Computing\", \"DevOps\", \"Microservices\"]" \
  -F "industryKnowHow=[\"Healthcare\", \"Finance\", \"E-commerce\", \"Automotive\", \"Telecommunications\"]" \
  -F "itSkills=[\"TypeScript\", \"Node.js\", \"AWS\", \"Kubernetes\", \"Terraform\"]" \
  -F "itTools=[\"Docker\", \"Jenkins\", \"Git\", \"JIRA\", \"Postman\"]" \
  -F "projects=[{\"name\":\"E-commerce Platform\",\"from\":\"2024-12-31T23:00:00.000Z\",\"to\":null,\"role\":\"Lead Developer\",\"industry\":\"E-commerce\",\"tools\":[\"Docker\",\"Kubernetes\",\"AWS\"],\"coreBusinessTopics\":[\"Test\"],\"projectMethods\":[\"Scrum\",\"TDD\"],\"achievements\":[\"Led modernization initiative\",\"Reduced deployment time 40%\"]},{\"name\":\"SAP Integration\",\"from\":\"2024-01-01T00:00:00.000Z\",\"to\":\"2025-11-23T23:00:00.000Z\",\"role\":\"Cloud Developer\",\"industry\":\"E-commerce\",\"tools\":[\"Docker\",\"Kubernetes\",\"AWS\"],\"coreBusinessTopics\":[\"Test\"],\"projectMethods\":[\"Scrum\",\"TDD\"],\"achievements\":[\"Refactored legacy systems\",\"Transitioned to cloud infrastructure\"]},{\"name\":\"E-commerce Platform\",\"from\":\"2024-12-31T23:00:00.000Z\",\"to\":null,\"role\":\"Lead Developer\",\"industry\":\"E-commerce\",\"tools\":[\"Docker\",\"Kubernetes\",\"AWS\"],\"coreBusinessTopics\":[\"Test\"],\"projectMethods\":[\"Scrum\",\"TDD\"],\"achievements\":[\"Led modernization initiative\",\"Reduced deployment time 40%\"]},{\"name\":\"SAP Integration\",\"from\":\"2024-01-01T00:00:00.000Z\",\"to\":\"2025-11-23T23:00:00.000Z\",\"role\":\"Cloud Developer\",\"industry\":\"E-commerce\",\"tools\":[\"Docker\",\"Kubernetes\",\"AWS\"],\"coreBusinessTopics\":[\"Test\"],\"projectMethods\":[\"Scrum\",\"TDD\"],\"achievements\":[\"Refactored legacy systems\",\"Transitioned to cloud infrastructure\"]},{\"name\":\"E-commerce Platform\",\"from\":\"2024-12-31T23:00:00.000Z\",\"to\":null,\"role\":\"Lead Developer\",\"industry\":\"E-commerce\",\"tools\":[\"Docker\",\"Kubernetes\",\"AWS\"],\"coreBusinessTopics\":[\"Test\"],\"projectMethods\":[\"Scrum\",\"TDD\"],\"achievements\":[\"Led modernization initiative\",\"Reduced deployment time 40%\"]},{\"name\":\"SAP Integration\",\"from\":\"2024-01-01T00:00:00.000Z\",\"to\":\"2025-11-23T23:00:00.000Z\",\"role\":\"Cloud Developer\",\"industry\":\"E-commerce\",\"tools\":[\"Docker\",\"Kubernetes\",\"AWS\"],\"coreBusinessTopics\":[\"Test\"],\"projectMethods\":[\"Scrum\",\"TDD\"],\"achievements\":[\"Refactored legacy systems\",\"Transitioned to cloud infrastructure\"]}]" \
  -F "lang=en" \
  -F "photo=@assets/photo.png" \
  --max-time 30 \
  --progress-bar \
  --output out/cv_NEW_TEMPLATE.docx

if [ $? -eq 0 ]; then
  echo ""
  echo "✓ DOCX generated successfully as out/cv_NEW_TEMPLATE.docx"
  ls -lh out/cv_NEW_TEMPLATE.docx
else
  echo ""
  echo "✗ Request failed or timed out"
  exit 1
fi
