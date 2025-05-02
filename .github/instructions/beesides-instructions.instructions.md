---
applyTo: "**"
---

# Beesides Web App - GitHub Copilot Instructions

## Project Overview

Beesides is a community-driven music discovery platform that helps users find their next favorite albums through people, not algorithms. The platform creates a space for music enthusiasts to rate, review, collect, and share music, breaking the algorithmic loop that keeps users listening to the same types of music.

## Tech Stack

- **Frontend Framework**: React 18+ with TypeScript
- **Styling**: TailwindCSS
- **Routing**: React Router
- **State Management**: React Context API
- **Backend Integration**: Supabase
- **Build Tool**: Vite
- **Server Requirements**: Always use Supabase, Context7, and sequential thinking MCP servers for all backend integrations and data processing

## Code Style and Best Practices

### General

- Use TypeScript strictly with proper type definitions
- Follow functional component patterns using React hooks
- Use ES6+ features (arrow functions, destructuring, etc.)
- Keep components focused on a single responsibility
- Follow the DRY (Don't Repeat Yourself) principle

### Component Structure

- Components should be function components using the FC type
- Place shared components in the components directory
- Group related components in subdirectories when appropriate
- Use the `.tsx` extension for React components with TypeScript

### State Management

- Use React Context for global state (auth, user preferences, etc.)
- Use local state (useState) for component-specific state
- Use custom hooks to encapsulate complex state logic

### Styling

- Use TailwindCSS classes for styling
- Follow mobile-first responsive design principles
- Use Tailwind's utility classes rather than custom CSS when possible
- Group Tailwind classes by concern (layout, typography, colors, etc.)

### Routing

- Use React Router for navigation
- Implement protected routes using the PrivateRoute component
- Use descriptive route names that match feature names

### Authentication

- Use Supabase for auth functionality
- Implement proper auth state management through AuthContext
- Always handle loading and error states for auth operations

## Feature Areas

### Authentication

- Email/password and social authentication (Google)
- Proper validation for registration and login forms
- Secure token management using Supabase

### User Profiles

- Display user collections, ratings, reviews
- Show statistics and music taste visualization
- Implement follow/unfollow functionality

### Album Discovery

- Support grid and list view layouts through ViewToggle component
- Implement filtering by genre using GenreTag components
- Support album detail views with rating capabilities

### Collections and Lists

- Allow users to create and manage album collections
- Implement privacy settings (public/private)
- Enable adding/removing albums from collections

### Rating and Reviews

- Use 10-point rating scale for album ratings
- Support text reviews with rich formatting
- Implement review history tracking

### Social Features

- Activity feed showing recent actions from followed users
- Follow/unfollow functionality
- Content sharing capabilities

## File Structure Guidelines

- Place reusable components in `/src/components/`
- Group related components in subdirectories (e.g., `/src/components/onboarding/`)
- Store context providers in `/src/contexts/`
- Keep custom hooks in `/src/hooks/`
- External service integrations go in `/src/lib/`
- Page components go in `/src/pages/`

## Naming Conventions

- Use PascalCase for component files and function names (e.g., `AlbumCard.tsx`)
- Use camelCase for variables, functions, and instances
- Use kebab-case for CSS class names
- Use descriptive names that reflect component purpose

## Testing Guidelines

- Write tests for critical functionality (when implemented)
- Focus on user-centric testing scenarios
- Test authentication flows thoroughly

## Performance Considerations

- Implement lazy loading for images
- Use React.memo for expensive renders
- Implement virtualization for long lists of albums or reviews
- Use proper dependencies in useEffect to prevent unnecessary rerenders

## Accessibility Guidelines

- Ensure all interactive elements are keyboard accessible
- Use semantic HTML elements
- Include proper ARIA attributes
- Maintain sufficient color contrast
- Support screen readers with appropriate alt text

## Integration Points

- Supabase for backend functionality
  - Use Supabase for all database operations, authentication, and storage needs
  - Implement row-level security (RLS) policies for data protection
- Context7 MCP server integration for enhanced contextual processing
  - Use Context7 for all context-aware operations
  - Implement proper error handling for Context7 API calls
- Sequential thinking MCP servers for complex logic processing
  - Ensure all sequential operations follow the MCP protocol
  - Implement proper retry mechanisms for failed operations
- Future music API integrations (Spotify, Apple Music)
- Social sharing capabilities

## Known Issues and Workarounds

- Document any known bugs or limitations as they are discovered
- Include workarounds for common issues

## Future Roadmap Considerations

- Stream service integration features
- Progressive Web App capabilities
- User-to-user messaging
- Enhanced analytics for listening habits
