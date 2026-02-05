# Contributing to JSON Validator TypeScript Action

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Make your changes to the source code in `src/`

4. **(Optional)** Build and package your changes locally:
   ```bash
   npm run all
   ```
   This command compiles TypeScript and packages the action into the `dist` folder.

5. Commit your source changes:
   ```bash
   git add src/
   git commit -m "Your descriptive commit message"
   ```

When you push to the `main` branch, the `dist` folder will be automatically built and committed by our CI workflow.

## Important: The `dist` Folder

The `dist` folder contains the compiled JavaScript code that GitHub Actions actually runs. It **must** be kept in sync with the source code.

### Automatic Build (Recommended)

When you push to the `main` branch, a GitHub Actions workflow automatically:
- Builds the `dist` folder from your source code
- Commits and pushes the updated `dist` folder back to the repository

This means you can focus on your source code changes and let CI handle the compilation.

### Manual Build (Optional)

If you want to preview the compiled code locally or ensure it's up-to-date before pushing:

```bash
npm run all
```

For pull requests, the CI build workflow will verify that `dist` would be up-to-date if your changes were merged.

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
2. Make your changes to the source code
3. **(Optional)** Run `npm run all` to preview the compiled code locally
4. Commit your source code changes
5. Push your branch and create a pull request
6. Wait for CI checks to pass (build verification, tests)
7. Once merged to `main`, the dist folder will be automatically built and committed
8. Address any review feedback

## Questions?

Feel free to open an issue if you have any questions or need help!
