# Profile Generator

A CLI tool and API server to generate professional CVs in PDF or HTML format.

## Features

- Generate CVs in PDF (default) or HTML format
- REST API with JSON payload support
- Customizable CV layout with photo, summary, IT skills, and projects
- Multi-language support (English and German)
- Modern, professional design

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

The server will start on `http://localhost:3000` (or the port specified in the `PORT` environment variable).

### API Endpoints

#### POST /api/generate

Generates a CV in PDF format (default). The schema has been extended to support a 2-column first page and detailed multi-page projects. Legacy fields (`skills`, simple `projects` with `description`) remain supported and are auto-mapped.

**New Schema (JSON):**

```jsonc
{
  "name": "John Doe",
  "photo": "<base64>",                // Optional base64 photo
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
      "timeRange": "12/2024 – Present",
      "name": "Developing SAP applications",
      "industry": "SAP",
      "duration": "Ongoing",
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
- `projects[]`: Detailed project pages (one page per project). Each supports:
  - `timeRange`: Date range text.
  - `industry`, `duration`, `role`: Meta descriptors.
  - `coreBusinessTopics`: Business topic tags.
  - `projectMethods`: Methods used specifically in this project.
  - `tools`: Technology / tools for this project.
  - `achievements`: Bullet list of accomplishments.
  - `description` (legacy): If provided and `achievements` absent, split by newline into achievements.

**Legacy Compatibility:**
- `skills` (string) is auto-split by comma/semicolon into `itSkills` if `itSkills` not provided.
- Legacy `projects` items with only `name` + `description` are converted: description lines -> achievements.

**Response:** PDF file (application/pdf).

#### POST /api/generate/html

Same as above, but generates HTML instead of PDF.

**Response:** HTML file (text/html)

### Example API Call

Using cURL:

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
        "timeRange": "2024 – Present",
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

### CLI Options

- `-n, --name <string>`: Full name (required)
- `-p, --photo <path>`: Path to photo file (required)
- `-s, --summary <string>`: Summary text (required)
- `-k, --skills <string>`: IT skills (required)
- `-j, --projects <path>`: Path to JSON file with projects array (required)
- `-o, --out <path>`: Output file path (default: `./out/cv.pdf`)
- `-l, --lang <code>`: Language code: en or de (default: `en`)
- `-f, --format <format>`: Output format: pdf or html (default: `pdf`)

### Projects JSON Format (Extended)

CLI currently expects a path (`-j`) to a JSON file containing an array of project objects matching either the legacy or extended schema. Example extended file:

```json
[
  {
    "timeRange": "12/2024 – Present",
    "name": "Developing SAP applications",
    "industry": "SAP",
    "role": "SAP Cloud Native Developer",
    "achievements": [
      "Developed SAP applications using Fiori, OData, and SAP BTP",
      "Configured user authentication via SAP IAS"
    ]
  }
]
```

## CV Format

The generated CV follows this structure:

1. **Header**: Name + Photo
2. **Two-Column Overview**:
  - Left (narrow): Education, Methods, Languages
  - Right (wide): Summary, Areas of Expertise, Industry Know-How, IT Skills, IT Tools
3. **Projects**: Each on its own page with meta rows and achievements bullets

## Docker

Build and run with Docker:

```bash
docker-compose up --build
```

The API will be available at `http://localhost:3000`.

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
