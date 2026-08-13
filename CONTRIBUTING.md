
# Contributing to Shopmatic

Thank you for your interest in contributing to Shopmatic! This document provides guidelines for contributing to the project.

## 🤝 Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior via the GitHub issues on this repository.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Git
- A code editor (VS Code recommended)

### Setting Up Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/shopmatic.git
   cd shopmatic
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/santhiprakash/shopmatic.git
   ```

4. **Install, configure, run** (see [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)):
   ```bash
   npm install && npm run server:install
   cp .env.example .env   # set DATABASE_URL and JWT_SECRET
   npm run db:migrate
   npm run dev:full
   ```

   App: http://localhost:8080 · API: http://localhost:3001  
   Pick work from [docs/PLATFORM_STATUS.md](docs/PLATFORM_STATUS.md).

## 🐛 Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

### Bug Report Template

When filing a bug report, please include:

- **Summary**: Clear and concise description
- **Steps to reproduce**: Detailed steps to recreate the issue
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment**: Browser, OS, Node.js version
- **Screenshots**: If applicable

## 💡 Suggesting Features

Feature suggestions are welcome! Please:

1. Check if the feature already exists or has been requested
2. Create a detailed issue describing:
   - The problem your feature would solve
   - Your proposed solution
   - Alternative solutions considered
   - Additional context or screenshots

## 🔧 Development Guidelines

### Code Style

We use the following tools for code consistency:

- **ESLint**: For code linting
- **Prettier**: For code formatting
- **TypeScript**: For type safety

Run these commands before committing:

```bash
npm run lint        # Check for linting errors
npm run type-check  # Check TypeScript types
```

### Coding Standards

- Use **TypeScript** for all new code
- Follow **React best practices**
- Use **functional components** with hooks
- Implement **proper error handling**
- Write **descriptive commit messages**
- Add **JSDoc comments** for complex functions

### Component Guidelines

1. **File Naming**: Use PascalCase for components (`ProductCard.tsx`)
2. **Props Interface**: Define TypeScript interfaces for all props
3. **Default Exports**: Use default exports for components
4. **Styling**: Use Tailwind CSS classes
5. **Accessibility**: Include proper ARIA attributes

Example component structure:

```tsx
import React from 'react';

interface ProductCardProps {
  title: string;
  price: number;
  image?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  title, 
  price, 
  image 
}) => {
  return (
    <div className="p-4 border rounded-lg">
      {/* Component content */}
    </div>
  );
};

export default ProductCard;
```

### Commit Message Format

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(products): add Quick Add functionality
fix(ui): resolve mobile responsiveness issue
docs(readme): update installation instructions
```

## 🧪 Testing

### Running Tests

```bash
npm run test        # Run all tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Writing Tests

- Write tests for new features and bug fixes
- Use **React Testing Library** for component tests
- Follow the **AAA pattern** (Arrange, Act, Assert)
- Test user interactions, not implementation details

Example test:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from './ProductCard';

describe('ProductCard', () => {
  it('displays product information correctly', () => {
    render(
      <ProductCard 
        title="Test Product" 
        price={99.99} 
      />
    );
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });
});
```

## 📝 Pull Request Process

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the guidelines above

3. **Test thoroughly**:
   - Run existing tests
   - Add new tests if needed
   - Test in different browsers
   - Verify mobile responsiveness

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** with:
   - Clear title and description
   - Reference related issues
   - Include screenshots for UI changes
   - List any breaking changes

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Tested in multiple browsers

## Screenshots
Include screenshots for UI changes
```

## 🏷️ Issue Labels

We use these labels to categorize issues:

- `bug`: Something isn't working
- `enhancement`: New feature request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `question`: Further information requested

## 📞 Getting Help

If you need help:

1. Check the [documentation](src/pages/Documentation.tsx)
2. Search existing issues
3. Join our community discussions
4. Email us at info@shopmatic.net

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Social media acknowledgments

Thank you for contributing to Shopmatic! 🚀
