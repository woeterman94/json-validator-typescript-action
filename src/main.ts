import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';
import fg from 'fast-glob';
import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

interface ValidationResult {
  valid: boolean;
  file: string;
  error?: string;
}

/**
 * Find all JSON files in the specified folder
 */
export async function findJsonFiles(folder: string): Promise<string[]> {
  const searchPath = path.join(process.cwd(), folder);
  
  // Use fast-glob to find all .json files recursively
  const files = await fg('**/*.json', {
    cwd: searchPath,
    absolute: true,
    ignore: ['**/node_modules/**', '**/dist/**', '**/lib/**', '**/.git/**']
  });
  
  return files;
}

/**
 * Extract schema reference from JSON content
 */
export function extractSchemaFromJson(content: string, filePath: string): string | null {
  try {
    const data = JSON.parse(content);
    if (data && typeof data === 'object' && '$schema' in data && typeof data.$schema === 'string') {
      const schemaRef = data.$schema;
      
      // If it's a URL, return null (we only support local schemas)
      if (schemaRef.startsWith('http://') || schemaRef.startsWith('https://')) {
        return null;
      }
      
      // If it's a relative path, resolve it relative to the JSON file
      const dir = path.dirname(filePath);
      return path.resolve(dir, schemaRef);
    }
  } catch (error) {
    // Ignore parse errors here, they'll be caught in validation
  }
  return null;
}

/**
 * Validate JSON file syntax
 */
export function validateJsonSyntax(filePath: string): ValidationResult {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    JSON.parse(content);
    return { valid: true, file: filePath };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { valid: false, file: filePath, error: errorMessage };
  }
}

/**
 * Load JSON schema from file
 */
export function loadSchema(schemaPath: string): object {
  try {
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    return JSON.parse(schemaContent);
  } catch (error) {
    throw new Error(`Failed to load schema from ${schemaPath}: ${error}`);
  }
}

/**
 * Validate JSON file against schema
 */
export function validateJsonSchema(
  filePath: string,
  validate: ValidateFunction
): ValidationResult {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    const valid = validate(data);
    if (!valid) {
      const errors = validate.errors
        ?.map(err => `${err.instancePath} ${err.message}`)
        .join(', ') || 'Unknown validation error';
      return { valid: false, file: filePath, error: errors };
    }
    
    return { valid: true, file: filePath };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { valid: false, file: filePath, error: errorMessage };
  }
}

/**
 * Main function
 */
export async function run(): Promise<void> {
  try {
    // Get inputs
    const folder = core.getInput('folder') || '.';
    const schemaPath = core.getInput('schema');
    
    core.info(`Scanning for JSON files in: ${folder}`);
    
    // Find all JSON files
    const jsonFiles = await findJsonFiles(folder);
    
    if (jsonFiles.length === 0) {
      core.warning(`No JSON files found in ${folder}`);
      core.setOutput('valid-files', 0);
      core.setOutput('invalid-files', 0);
      return;
    }
    
    core.info(`Found ${jsonFiles.length} JSON file(s)`);
    
    // Prepare schema validation if provided
    let globalValidate: ValidateFunction | null = null;
    if (schemaPath) {
      core.info(`Using global schema: ${schemaPath}`);
      const schema = loadSchema(schemaPath);
      const ajv = new Ajv({ allErrors: true });
      addFormats(ajv);
      globalValidate = ajv.compile(schema);
    }
    
    // Validate each file
    const results: ValidationResult[] = [];
    for (const file of jsonFiles) {
      const relativePath = path.relative(process.cwd(), file);
      
      // Check if file has its own schema reference
      let fileValidate = globalValidate;
      if (!globalValidate) {
        try {
          const content = fs.readFileSync(file, 'utf-8');
          const fileSchemaPath = extractSchemaFromJson(content, file);
          
          if (fileSchemaPath && fs.existsSync(fileSchemaPath)) {
            core.info(`Using schema from $schema property for ${relativePath}: ${path.relative(process.cwd(), fileSchemaPath)}`);
            const schema = loadSchema(fileSchemaPath);
            const ajv = new Ajv({ allErrors: true });
            addFormats(ajv);
            fileValidate = ajv.compile(schema);
          }
        } catch (error) {
          // If we can't read the file or schema, the validation will catch it
        }
      }
      
      if (fileValidate) {
        // Validate against schema (which also checks syntax)
        results.push(validateJsonSchema(file, fileValidate));
      } else {
        // Only validate syntax
        results.push(validateJsonSyntax(file));
      }
    }
    
    // Separate valid and invalid files
    const validFiles = results.filter(r => r.valid);
    const invalidFiles = results.filter(r => !r.valid);
    
    // Report results
    core.info(`\nValidation Results:`);
    core.info(`✓ Valid files: ${validFiles.length}`);
    
    if (invalidFiles.length > 0) {
      core.error(`✗ Invalid files: ${invalidFiles.length}`);
      
      for (const result of invalidFiles) {
        const relativePath = path.relative(process.cwd(), result.file);
        core.error(`  - ${relativePath}: ${result.error}`);
      }
    }
    
    // Set outputs
    core.setOutput('valid-files', validFiles.length);
    core.setOutput('invalid-files', invalidFiles.length);
    
    // Fail the action if there are invalid files
    if (invalidFiles.length > 0) {
      core.setFailed(`Found ${invalidFiles.length} invalid JSON file(s)`);
    } else {
      core.info(`\n✓ All JSON files are valid!`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    core.setFailed(`Action failed: ${errorMessage}`);
  }
}

// Only run if this is the main module
if (require.main === module) {
  run();
}
