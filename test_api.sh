#!/bin/bash

# Test the new JSON API
# Make sure the server is running with: npm run serve

# Read the photo file and convert to base64
PHOTO_BASE64=$(base64 -i assets/photo.png)

# Make POST request with JSON payload
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "summary": "Experienced software developer with 5+ years in full-stack development. Passionate about building scalable applications and solving complex problems.",
    "skills": "JavaScript, TypeScript, React, Node.js, Python, Docker, Kubernetes, AWS, MongoDB, PostgreSQL",
    "projects": [
      {
        "name": "E-commerce Platform",
        "description": "Developed a scalable e-commerce platform using React, Node.js, and MongoDB. Implemented features including user authentication, product catalog, shopping cart, and payment integration with Stripe."
      },
      {
        "name": "Task Management App",
        "description": "Built a real-time task management application with React and Firebase. Features include team collaboration, task assignments, deadline tracking, and push notifications."
      },
      {
        "name": "Data Analytics Dashboard",
        "description": "Created an interactive data visualization dashboard using D3.js and Python Flask. Processes large datasets and presents insights through various chart types and filtering options."
      }
    ],
    "lang": "en",
    "photo": "'"$PHOTO_BASE64"'"
  }' \
  --output test_cv.pdf

echo "PDF generated: test_cv.pdf"

# Alternative: Generate HTML instead
curl -X POST http://localhost:3000/api/generate/html \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "summary": "Experienced software developer with 5+ years in full-stack development.",
    "skills": "JavaScript, TypeScript, React, Node.js, Python",
    "projects": [
      {
        "name": "E-commerce Platform",
        "description": "Developed a scalable e-commerce platform."
      }
    ],
    "lang": "en",
    "photo": "'"$PHOTO_BASE64"'"
  }' \
  --output test_cv.html

echo "HTML generated: test_cv.html"
