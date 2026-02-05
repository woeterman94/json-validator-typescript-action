# JSON Validator TypeScript Action

A GitHub Action to validate JSON files in your repository, with optional JSON Schema validation support.

## Features

- ✅ Validates JSON syntax in your repository
- ✅ Optional JSON Schema validation
- ✅ Configurable folder scanning (defaults to entire repository)
- ✅ Clear error reporting with file paths
- ✅ Automatically ignores `node_modules`, `dist`, `lib`, and `.git` folders

## Usage

### Basic Usage - Validate All JSON Files

```yaml
name: Validate JSON Files
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: woeterman94/json-validator-typescript-action@v1
```

### Validate JSON Files in a Specific Folder

```yaml
- uses: woeterman94/json-validator-typescript-action@v1
  with:
    folder: 'config'
```

### Validate JSON Files Against a Schema

```yaml
- uses: woeterman94/json-validator-typescript-action@v1
  with:
    folder: 'data'
    schema: 'schemas/data.schema.json'
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `folder` | Folder location to scan for JSON files | No | `.` (repository root) |
| `schema` | Path to JSON schema file for validation | No | `` (syntax validation only) |

## Outputs

| Output | Description |
|--------|-------------|
| `valid-files` | Number of valid JSON files found |
| `invalid-files` | Number of invalid JSON files found |

## Examples

### Complete Workflow Example

```yaml
name: Validate Configuration Files
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate-json:
    runs-on: ubuntu-latest
    name: Validate JSON Files
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Validate all JSON files
        id: json-validation
        uses: woeterman94/json-validator-typescript-action@v1
        with:
          folder: '.'
      
      - name: Output results
        if: always()
        run: |
          echo "Valid files: ${{ steps.json-validation.outputs.valid-files }}"
          echo "Invalid files: ${{ steps.json-validation.outputs.invalid-files }}"
```

### Validate Multiple Folders

```yaml
jobs:
  validate:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        folder: ['config', 'data', 'schemas']
    steps:
      - uses: actions/checkout@v4
      - name: Validate ${{ matrix.folder }}
        uses: woeterman94/json-validator-typescript-action@v1
        with:
          folder: ${{ matrix.folder }}
```

## How It Works

1. The action scans the specified folder (or entire repository) for all `.json` files
2. Each JSON file is validated for proper syntax
3. If a schema is provided, files are also validated against the JSON Schema
4. The action reports all validation errors with file paths
5. The action fails if any invalid JSON files are found

## Development

### Building

```bash
npm install
npm run build
npm run package
```

### Testing Locally

```bash
# Set environment variables for inputs
export INPUT_FOLDER="test-data/valid"
export INPUT_SCHEMA=""

# Run the action
node dist/index.js
```

## License

MIT
