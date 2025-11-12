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

Generates a CV in PDF format (default).

**Request Format (JSON):**

```json
{
  "name": "John Doe",
  "summary": "Experienced software developer with 5+ years in full-stack development.",
  "skills": "JavaScript, TypeScript, React, Node.js, Python, Docker, AWS",
  "projects": [
    {
      "name": "Project Name",
      "description": "Project description goes here."
    },
    {
      "name": "Another Project",
      "description": "Another project description."
    }
  ],
  "lang": "en",
  "photo": "base64_encoded_photo_string"
}
```

**Fields:**
- `name` (required): Full name
- `summary` (required): Professional summary
- `skills` (required): IT skills as a comma-separated string or paragraph
- `projects` (required): Array of project objects with `name` and `description`
- `lang` (optional): Language code - `en` or `de` (default: `en`)
- `photo` (optional): Base64-encoded photo

**Response:** PDF file (application/pdf)

#### POST /api/generate/html

Same as above, but generates HTML instead of PDF.

**Response:** HTML file (text/html)

### Example API Call

Using cURL:

```bash
# Generate PDF
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "summary": "Experienced software developer...",
    "skills": "JavaScript, TypeScript, React, Node.js",
    "projects": [
      {
        "name": "E-commerce Platform",
        "description": "Developed a scalable platform..."
      }
    ],
    "lang": "en"
  }' \
  --output cv.pdf

# Generate HTML
curl -X POST http://localhost:3000/api/generate/html \
  -H "Content-Type: application/json" \
  -d '{...}' \
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

### Projects JSON Format

The projects JSON file should contain an array of project objects:

```json
[
  {
    "name": "Project Name",
    "description": "Project description"
  },
  {
    "name": "Another Project",
    "description": "Another description"
  }
]
```

See `test_projects.json` for an example.

## CV Format

The generated CV follows this structure:

1. **Header**: Name + Photo
2. **Summary**: Professional summary/bio
3. **IT Skills**: Technical skills and competencies
4. **Projects**: List of projects with names and descriptions

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
