# Profile Generator

A CLI tool and API server to generate professional CVs in PDF, HTML, or DOCX format.

## Features

- Generate CVs in PDF (default), HTML, or DOCX format
- REST API with JSON and multipart/form-data support (file upload or base64 photo)
- Customizable CV layout with photo, summary, IT skills, and projects
- Multi-language support (English and German)

## Installation

```bash
npm install
npm run build
```

## API Usage

### Starting the Server

```bash
npm run serve
```

The server will start on `http://localhost:3000` (or the port specified in the `PORT` environment variable). In Docker Compose, the default host port is `3111` (`HOST_PORT:CONTAINER_PORT` mapping).

### API Endpoints

#### POST /api/generate

Generates a CV in PDF format (default). The schema has been extended to support a 2-column first page and detailed multi-page projects. 

**Photo:**
- JSON: provide `photo` as a **base64** string (optionally with `data:image/...;base64,` prefix)
- multipart/form-data: provide `photo` as a **file field** (`-F "photo=@assets/photo.png"`)

**New Schema (JSON):**

```jsonc
{
  "name": "John Doe",
  "photo": "<base64>",               
  "summary": "Software Engineer 5+ years...",
  "education": ["B.Sc. Computer Science", "M.Sc. Data Engineering"],
  "methods": ["Scrum", "Agile Software Engineering"],
  "languages": ["English (C1)", "German (B2)", "Spanish (A2)"],
  "expertise": ["Backend Development", "Cloud Deployment", "Database Modeling"],
  "industryKnowHow": ["Oil & Gas", "Healthcare", "Enterprise Software"],
  "itSkills": ["TypeScript", "Java", "Python", "C#", "SQL"],
  "itTools": ["Jira/Confluence", "SAP BTP", "Docker", "GitHub Actions"],
  "projects": [
    {
      "from": "2024-12-31T23:00:00.000Z",
      "to": "2025-12-31T23:00:00.000Z",
      "name": "Developing SAP applications",
      "industry": "SAP",
      "role": "SAP Cloud Native Developer",
      "coreBusinessTopics": ["Custom SAP applications", "Front-end/back-end integration"],
      "projectMethods": ["Scrum", "Agile Software Engineering"],
      "tools": ["SAP BTP", "SAP Fiori", "OData", "Node.js", "CDS"],
      "achievements": [
        "Developed SAP applications using Fiori, OData, and SAP BTP for enterprise business needs",
        "Prototyped custom solutions to meet specific customer requirements",
        "Configured user authentication via SAP IAS",
        "Developed OData services for front-end interaction with databases",
        "Researched and implemented solutions for unique SAP customer scenarios"
      ]
    }
  ],
  "lang": "en"
}
```

**Field Descriptions:**
- `education`: Array of education entries (simple strings).
- `methods`: Array of methodologies practiced (global list).
- `languages`: Human languages with proficiency.
- `expertise`: High-level areas of expertise (tags).
- `industryKnowHow`: Industry domains experienced in.
- `itSkills`: Programming languages / frameworks / core technical skills.
- `itTools`: Tooling platforms and products.
- `projects`: Detailed project pages (one page per project). Each supports:
  - `from`, `to`: Date range.
  - `industry`, `role`: Meta descriptors.
  - `coreBusinessTopics`: Business topic tags.
  - `projectMethods`: Methods used specifically in this project.
  - `tools`: Technology / tools for this project.
  - `achievements`: Bullet list of accomplishments.

**Response:** PDF file (application/pdf).

#### POST /api/generate/html

Same as above, but generates HTML instead of PDF.

**Response:** HTML file (text/html)

#### POST /api/generate/docx

Generates a CV in DOCX format using the same payload as `/api/generate`.

**Response:** DOCX file (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`).

### Example API Call

Using cURL (JSON):

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "summary": "Software Engineer 5+ years...",
    "education": ["B.Sc. Computer Science"],
    "methods": ["Scrum"],
    "languages": ["English (C1)"],
    "expertise": ["Backend Development"],
    "industryKnowHow": ["Healthcare"],
    "itSkills": ["TypeScript", "Node.js"],
    "itTools": ["Docker"],
    "projects": [
      {
        "from": "2024-12-31T23:00:00.000Z",
        "to": "2025-12-31T23:00:00.000Z",
        "name": "Platform Modernization",
        "role": "Lead Developer",
        "achievements": ["Led modernization initiative", "Reduced deployment time 40%"]
      }
    ],
    "lang": "en"
  }' \
  --output cv.pdf

# HTML output
curl -X POST http://localhost:3000/api/generate/html \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","summary":"...","projects":[{"name":"Proj","description":"Line1\nLine2"}]}' \
  --output cv.html

# DOCX output
curl -X POST http://localhost:3000/api/generate/docx \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","summary":"...","projects":[{"name":"Proj","description":"Line1\nLine2"}]}' \
  --output cv.docx

Using cURL (multipart/form-data with file photo):

```bash
curl -X POST http://localhost:3111/api/generate \
  -F "name=John Doe" \
  -F "summary=Software Engineer" \
  -F "education=[\"B.Sc. Computer Science\"]" \
  -F "projects=[{\"name\":\"Platform Modernization\",\"achievements\":[\"Led modernization\"]}]" \
  -F "lang=en" \
  -F "photo=@assets/photo.png" \
  --output cv_formdata.pdf
```
```

See `test_api.sh` for a complete example with photo encoding.

## CLI Usage

```bash
npm run dev -- \
  -n "John Doe" \
  -p assets/photo.png \
  -s "Experienced software developer with 5+ years in full-stack development." \
  -k "JavaScript, TypeScript, React, Node.js, Python" \
  -j test_projects.json \
  -o out/cv.pdf \
  -l en \
  -f pdf
```

## Docker

Build and run with Docker:

```bash
docker compose up --build profile-gen
```

The API will be available at `http://localhost:3111` by default (or the host port you map).

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run CLI
npm run dev -- [options]

# Start API server
npm run serve
```

## License

MIT
