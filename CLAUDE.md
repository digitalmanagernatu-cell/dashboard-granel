# CLAUDE.md - AI Assistant Guidelines for Dashboard Granel

This file provides guidance for AI assistants (like Claude) working with the Dashboard Granel codebase.

## Project Overview

**Dashboard Granel** is a dashboard application for bulk/wholesale operations management. The project is currently in its initial setup phase.

### Repository Information

- **Repository**: `digitalmanagernatu-cell/dashboard-granel`
- **Primary Language**: To be determined (likely TypeScript/JavaScript for frontend)
- **Status**: Initial setup phase

## Project Structure

```
dashboard-granel/
├── CLAUDE.md           # AI assistant guidelines (this file)
├── README.md           # Project documentation (to be created)
├── src/                # Source code (to be created)
│   ├── components/     # UI components
│   ├── pages/          # Page components/routes
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API services and data fetching
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   └── styles/         # Global styles and themes
├── public/             # Static assets (to be created)
├── tests/              # Test files (to be created)
└── config/             # Configuration files (to be created)
```

## Development Guidelines

### Code Style and Conventions

1. **Language**: Use TypeScript for type safety
2. **Naming Conventions**:
   - Components: PascalCase (e.g., `DashboardHeader.tsx`)
   - Hooks: camelCase with `use` prefix (e.g., `useGranelData.ts`)
   - Utilities: camelCase (e.g., `formatCurrency.ts`)
   - Constants: SCREAMING_SNAKE_CASE
   - Types/Interfaces: PascalCase with descriptive names

3. **File Organization**:
   - One component per file
   - Co-locate tests with source files when practical
   - Group related functionality in directories

4. **Comments**:
   - Use JSDoc for public APIs and complex functions
   - Avoid obvious comments; code should be self-documenting
   - Comment the "why" not the "what"

### Git Workflow

1. **Branch Naming**:
   - Feature branches: `feature/<description>`
   - Bug fixes: `fix/<description>`
   - Claude branches: `claude/<session-id>`

2. **Commit Messages**:
   - Use conventional commits format
   - Start with type: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
   - Keep subject line under 72 characters
   - Include body for complex changes

3. **Pull Requests**:
   - Provide clear description of changes
   - Reference related issues
   - Include test plan when applicable

### Testing

1. **Test Coverage**: Aim for comprehensive coverage of business logic
2. **Test Types**:
   - Unit tests for utilities and hooks
   - Component tests for UI components
   - Integration tests for critical user flows
3. **Test Naming**: Describe the behavior being tested

## AI Assistant Instructions

### When Working on This Project

1. **Before Making Changes**:
   - Read relevant existing code first
   - Understand the context and dependencies
   - Check for existing patterns and conventions

2. **When Writing Code**:
   - Follow existing patterns in the codebase
   - Keep changes focused and minimal
   - Avoid over-engineering
   - Don't add unnecessary features or "improvements"

3. **When Creating New Files**:
   - Prefer editing existing files when possible
   - Follow the established project structure
   - Use appropriate naming conventions

4. **Security Considerations**:
   - Never commit sensitive data (API keys, passwords)
   - Validate user inputs
   - Use parameterized queries for database operations
   - Follow OWASP guidelines

### Common Tasks

#### Setting Up the Project

```bash
# Install dependencies (when package.json exists)
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

#### Running Linting and Formatting

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Key Files to Understand

When starting work on this project, familiarize yourself with:

1. `package.json` - Dependencies and scripts
2. `tsconfig.json` - TypeScript configuration
3. `.env.example` - Environment variables template
4. `src/types/` - Type definitions and interfaces
5. `src/services/` - API integration patterns

## Tech Stack (Planned)

- **Frontend**: React with TypeScript
- **Styling**: To be determined (Tailwind CSS / styled-components)
- **State Management**: To be determined (React Context / Zustand / Redux)
- **Testing**: Jest + React Testing Library
- **Build Tool**: Vite or Next.js
- **Package Manager**: npm or pnpm

## Environment Setup

### Required Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=<api-url>

# Authentication
VITE_AUTH_DOMAIN=<auth-domain>

# Feature Flags
VITE_ENABLE_ANALYTICS=<true|false>
```

## Troubleshooting

### Common Issues

1. **Build Failures**: Check TypeScript errors and missing dependencies
2. **Test Failures**: Ensure test environment is properly configured
3. **Linting Errors**: Run `npm run lint:fix` to auto-fix issues

## Contact and Resources

- **Repository Issues**: Report bugs and feature requests via GitHub Issues
- **Documentation**: See README.md for project documentation

---

*This file should be updated as the project evolves. Last updated: 2026-02-04*
