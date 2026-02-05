import { ValidateFunction } from 'ajv';
interface ValidationResult {
    valid: boolean;
    file: string;
    error?: string;
}
/**
 * Find all JSON files in the specified folder
 */
export declare function findJsonFiles(folder: string): Promise<string[]>;
/**
 * Extract schema reference from JSON content
 */
export declare function extractSchemaFromJson(content: string, filePath: string): string | null;
/**
 * Validate JSON file syntax
 */
export declare function validateJsonSyntax(filePath: string): ValidationResult;
/**
 * Load JSON schema from file
 */
export declare function loadSchema(schemaPath: string): object;
/**
 * Validate JSON file against schema
 */
export declare function validateJsonSchema(filePath: string, validate: ValidateFunction): ValidationResult;
/**
 * Main function
 */
export declare function run(): Promise<void>;
export {};
