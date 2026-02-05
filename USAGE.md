# Usage Examples

This file contains various examples of how to use the JSON Validator TypeScript Action.

## Example 1: Validate All JSON Files in Repository

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

## Example 2: Validate JSON Files in Specific Folder

```yaml
name: Validate Configuration Files
on: [push, pull_request]

jobs:
  validate-config:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate config files
        uses: woeterman94/json-validator-typescript-action@v1
        with:
          folder: 'config'
```

## Example 3: Validate JSON Files Against Schema

```yaml
name: Validate Data Files
on: [push, pull_request]

jobs:
  validate-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate data files
        uses: woeterman94/json-validator-typescript-action@v1
        with:
          folder: 'data'
          schema: 'schemas/data.schema.json'
```

## Example 4: Multiple Folder Validation

```yaml
name: Validate All JSON
on: [push, pull_request]

jobs:
  validate-multiple:
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

## Example 5: With Outputs

```yaml
name: Validate and Report
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate JSON files
        id: validation
        uses: woeterman94/json-validator-typescript-action@v1
        with:
          folder: '.'
      
      - name: Display results
        if: always()
        run: |
          echo "✅ Valid files: ${{ steps.validation.outputs.valid-files }}"
          echo "❌ Invalid files: ${{ steps.validation.outputs.invalid-files }}"
```

## Example 6: Conditional Execution

```yaml
name: Conditional Validation
on: 
  pull_request:
    paths:
      - '**.json'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate only if JSON files changed
        uses: woeterman94/json-validator-typescript-action@v1
```

## JSON Schema Example

Here's an example JSON schema file that you can use:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1
    },
    "version": {
      "type": "string",
      "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+$"
    },
    "description": {
      "type": "string"
    },
    "author": {
      "type": "string"
    }
  },
  "required": ["name", "version"]
}
```

## Testing Locally

To test the action locally before committing:

```bash
# Install dependencies
npm install

# Build the action
npm run build
npm run package

# Test with environment variables
export INPUT_FOLDER="path/to/folder"
export INPUT_SCHEMA="path/to/schema.json"  # optional
node dist/index.js
```
