import * as path from 'path';
import * as fs from 'fs';
import {
  findJsonFiles,
  validateJsonSyntax,
  loadSchema,
  validateJsonSchema,
  extractSchemaFromJson,
} from '../src/main';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

describe('JSON Validator', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');

  describe('findJsonFiles', () => {
    it('should find all JSON files in a directory', async () => {
      // Use relative path from cwd like the actual action does
      const relativeDir = path.relative(process.cwd(), path.join(fixturesDir, 'valid'));
      const files = await findJsonFiles(relativeDir);
      expect(files.length).toBeGreaterThan(0);
      expect(files.every(f => f.endsWith('.json'))).toBe(true);
    });

    it('should return absolute paths', async () => {
      const files = await findJsonFiles(fixturesDir);
      expect(files.every(f => path.isAbsolute(f))).toBe(true);
    });

    it('should return empty array when no JSON files exist', async () => {
      const emptyDir = path.join(__dirname, 'non-existent-dir');
      const files = await findJsonFiles(emptyDir);
      expect(files).toEqual([]);
    });
  });

  describe('validateJsonSyntax', () => {
    it('should validate a valid JSON file', () => {
      const validFile = path.join(fixturesDir, 'valid', 'simple.json');
      const result = validateJsonSyntax(validFile);
      expect(result.valid).toBe(true);
      expect(result.file).toBe(validFile);
      expect(result.error).toBeUndefined();
    });

    it('should detect invalid JSON syntax', () => {
      const invalidFile = path.join(fixturesDir, 'invalid', 'syntax-error.json');
      const result = validateJsonSyntax(invalidFile);
      expect(result.valid).toBe(false);
      expect(result.file).toBe(invalidFile);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('JSON');
    });

    it('should handle non-existent files', () => {
      const nonExistentFile = path.join(fixturesDir, 'does-not-exist.json');
      const result = validateJsonSyntax(nonExistentFile);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('loadSchema', () => {
    it('should load a valid schema file', () => {
      const schemaFile = path.join(fixturesDir, 'valid', 'user.schema.json');
      const schema = loadSchema(schemaFile);
      expect(schema).toBeDefined();
      expect(typeof schema).toBe('object');
    });

    it('should throw error for non-existent schema', () => {
      const nonExistentSchema = path.join(fixturesDir, 'does-not-exist.schema.json');
      expect(() => loadSchema(nonExistentSchema)).toThrow();
    });

    it('should throw error for invalid JSON in schema', () => {
      const invalidSchema = path.join(fixturesDir, 'invalid', 'syntax-error.json');
      expect(() => loadSchema(invalidSchema)).toThrow();
    });
  });

  describe('validateJsonSchema', () => {
    it('should validate JSON against a schema', () => {
      const schemaFile = path.join(fixturesDir, 'valid', 'user.schema.json');
      const jsonFile = path.join(fixturesDir, 'valid', 'with-schema.json');
      
      const schema = loadSchema(schemaFile);
      const ajv = new Ajv({ allErrors: true });
      addFormats(ajv);
      const validate = ajv.compile(schema);
      
      const result = validateJsonSchema(jsonFile, validate);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should detect schema validation errors', () => {
      const schemaFile = path.join(fixturesDir, 'schema', 'product.schema.json');
      const jsonFile = path.join(fixturesDir, 'schema', 'invalid-product.json');
      
      const schema = loadSchema(schemaFile);
      const ajv = new Ajv({ allErrors: true });
      addFormats(ajv);
      const validate = ajv.compile(schema);
      
      const result = validateJsonSchema(jsonFile, validate);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toMatch(/must be >= 0|minimum/);
    });

    it('should handle JSON syntax errors during schema validation', () => {
      const schemaFile = path.join(fixturesDir, 'valid', 'user.schema.json');
      const invalidFile = path.join(fixturesDir, 'invalid', 'syntax-error.json');
      
      const schema = loadSchema(schemaFile);
      const ajv = new Ajv({ allErrors: true });
      addFormats(ajv);
      const validate = ajv.compile(schema);
      
      const result = validateJsonSchema(invalidFile, validate);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('extractSchemaFromJson', () => {
    it('should extract relative schema path from JSON', () => {
      const content = JSON.stringify({
        "$schema": "./user.schema.json",
        "name": "test"
      });
      const filePath = path.join(fixturesDir, 'valid', 'test.json');
      
      const schemaPath = extractSchemaFromJson(content, filePath);
      expect(schemaPath).toBeDefined();
      expect(schemaPath).toContain('user.schema.json');
    });

    it('should return null for HTTP schema URLs', () => {
      const content = JSON.stringify({
        "$schema": "http://json-schema.org/draft-07/schema#",
        "name": "test"
      });
      const filePath = path.join(fixturesDir, 'valid', 'test.json');
      
      const schemaPath = extractSchemaFromJson(content, filePath);
      expect(schemaPath).toBeNull();
    });

    it('should return null for HTTPS schema URLs', () => {
      const content = JSON.stringify({
        "$schema": "https://json-schema.org/draft-07/schema#",
        "name": "test"
      });
      const filePath = path.join(fixturesDir, 'valid', 'test.json');
      
      const schemaPath = extractSchemaFromJson(content, filePath);
      expect(schemaPath).toBeNull();
    });

    it('should return null when no $schema property exists', () => {
      const content = JSON.stringify({
        "name": "test"
      });
      const filePath = path.join(fixturesDir, 'valid', 'test.json');
      
      const schemaPath = extractSchemaFromJson(content, filePath);
      expect(schemaPath).toBeNull();
    });

    it('should handle invalid JSON gracefully', () => {
      const content = '{ invalid json }';
      const filePath = path.join(fixturesDir, 'valid', 'test.json');
      
      const schemaPath = extractSchemaFromJson(content, filePath);
      expect(schemaPath).toBeNull();
    });

    it('should resolve relative schema paths correctly', () => {
      const content = JSON.stringify({
        "$schema": "../schema/product.schema.json",
        "name": "test"
      });
      const filePath = path.join(fixturesDir, 'valid', 'test.json');
      
      const schemaPath = extractSchemaFromJson(content, filePath);
      expect(schemaPath).toBeDefined();
      expect(path.isAbsolute(schemaPath!)).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should validate JSON file with embedded schema reference', () => {
      const jsonFile = path.join(fixturesDir, 'valid', 'with-schema.json');
      const content = fs.readFileSync(jsonFile, 'utf-8');
      const schemaPath = extractSchemaFromJson(content, jsonFile);
      
      expect(schemaPath).toBeDefined();
      expect(fs.existsSync(schemaPath!)).toBe(true);
      
      const schema = loadSchema(schemaPath!);
      const ajv = new Ajv({ allErrors: true });
      addFormats(ajv);
      const validate = ajv.compile(schema);
      
      const result = validateJsonSchema(jsonFile, validate);
      expect(result.valid).toBe(true);
    });

    it('should detect validation errors with embedded schema reference', () => {
      const jsonFile = path.join(fixturesDir, 'schema', 'invalid-product.json');
      const content = fs.readFileSync(jsonFile, 'utf-8');
      const schemaPath = extractSchemaFromJson(content, jsonFile);
      
      expect(schemaPath).toBeDefined();
      expect(fs.existsSync(schemaPath!)).toBe(true);
      
      const schema = loadSchema(schemaPath!);
      const ajv = new Ajv({ allErrors: true });
      addFormats(ajv);
      const validate = ajv.compile(schema);
      
      const result = validateJsonSchema(jsonFile, validate);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/must be >= 0|minimum/);
    });
  });
});
