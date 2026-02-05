# JSON Validator TypeScript Action

A GitHub Action to validate JSON files in your repository, with optional JSON Schema validation support.

## Features

- ✅ Validates JSON syntax in your repository
- ✅ Optional JSON Schema validation
- ✅ **Automatic schema detection from `$schema` property**
- ✅ Supports relative and absolute schema paths
- ✅ **Configurable ignore patterns** - customize which files/folders to skip
- ✅ **Optional failure mode** - choose whether invalid JSON fails the action (default: true)
- ✅ Configurable folder scanning (defaults to entire repository)
- ✅ Clear error reporting with file paths
- ✅ Defaults to ignoring `node_modules`, `dist`, `lib`, and `.git` folders
- ✅ Comprehensive test suite

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

### Custom Ignore Patterns

You can customize which files and folders to ignore:

```yaml
- uses: woeterman94/json-validator-typescript-action@v1
  with:
    folder: '.'
    ignore: |
      **/node_modules/**
      **/dist/**
      **/build/**
      **/.git/**
      **/temp/**
```

Or use comma-separated patterns:

```yaml
- uses: woeterman94/json-validator-typescript-action@v1
  with:
    folder: '.'
    ignore: '**/node_modules/**, **/dist/**, **/build/**, **/.git/**, **/temp/**'
```

### Automatic Schema Detection

JSON files can specify their own schema using the `$schema` property. The action will automatically validate these files against their specified schema:

```json
{
  "$schema": "./user.schema.json",
  "name": "John Doe",
  "email": "john@example.com"
}
```

This feature works with:
- ✅ Relative paths (e.g., `./schema.json`, `../schemas/user.schema.json`)
- ✅ Schemas stored in the same repository
- ❌ HTTP/HTTPS URLs (only local schemas are supported)

**Note:** If a global `schema` input is provided, it takes precedence over individual `$schema` properties.

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `folder` | Folder location to scan for JSON files | No | `.` (repository root) |
| `schema` | Path to JSON schema file for validation | No | `` (syntax validation only) |
| `ignore` | Glob patterns to ignore (comma or newline separated) | No | `**/node_modules/**, **/dist/**, **/lib/**, **/.git/**` |
| `fail-on-invalid` | Whether to fail the action when invalid JSON files are found | No | `true` |

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

### Report Invalid Files Without Failing

You can set `fail-on-invalid: false` to report invalid JSON files without failing the action:

```yaml
- uses: woeterman94/json-validator-typescript-action@v1
  with:
    folder: '.'
    fail-on-invalid: false
```

This will output:
```
Found invalid or incomplete json files:
❌ ./path/to/file1.json
❌ ./path/to/file2.json
```

## How It Works

1. The action scans the specified folder (or entire repository) for all `.json` files
2. Each JSON file is validated for proper syntax
3. If a global schema is provided via the `schema` input, all files are validated against it
4. If no global schema is provided, the action checks each JSON file for a `$schema` property
5. Files with a `$schema` property are validated against their specified schema (if it exists locally)
6. The action reports all validation errors with file paths
7. The action fails if any invalid JSON files are found

## Testing

This action includes a comprehensive test suite. To run tests:

```bash
npm install
npm test

# Run with coverage
npm run test:coverage
```

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
