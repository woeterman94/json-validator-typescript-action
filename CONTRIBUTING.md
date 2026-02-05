# Contributing to JSON Validator TypeScript Action

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Make your changes to the source code in `src/`

4. **Build and package your changes** (Important!):
   ```bash
   npm run all
   ```
   This command compiles TypeScript and packages the action into the `dist` folder.

5. Commit both your source changes AND the updated `dist` folder:
   ```bash
   git add src/ dist/
   git commit -m "Your descriptive commit message"
   ```

## Important: The `dist` Folder

The `dist` folder contains the compiled JavaScript code that GitHub Actions actually runs. It **must** be kept in sync with the source code:

- Always run `npm run all` after making changes to `src/`
- Always commit the updated `dist` folder along with your source changes
- The CI build workflow will verify that `dist` is up-to-date

If you forget to update `dist`, the CI build will fail with an error message telling you to run `npm run all`.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Code Quality

Before submitting a pull request:

1. Run the linter:
   ```bash
   npm run lint
   ```

2. Format your code:
   ```bash
   npm run format
   ```

3. Make sure all tests pass:
   ```bash
   npm test
   ```

4. Build and package:
   ```bash
   npm run all
   ```

## Pull Request Process

1. Create a new branch for your feature or bugfix
2. Make your changes
3. Run `npm run all` to update the `dist` folder
4. Commit all changes including `dist/`
5. Push your branch and create a pull request
6. Wait for CI checks to pass (build, tests)
7. Address any review feedback

## Questions?

Feel free to open an issue if you have any questions or need help!
