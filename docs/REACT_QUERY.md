# React Query (TanStack Query) Integration Guide

## Overview

This guide explains how we've integrated TanStack Query in the Beesides app for efficient data fetching, caching, and synchronization with Supabase.

## Setup

The Query Client is configured in `App.tsx` with these default settings:

- **Stale Time:** 5 minutes (data will be considered fresh for 5 minutes before refetching)
- **Retry:** 1 attempt if a query fails
- **Refetch on Window Focus:** Enabled (queries will refresh when tab regains focus)

## Available Hooks

### Base Hooks

- `useSupabaseQuery`: Generic hook for fetching data from any Supabase table
- `useSupabaseItem`: Hook for fetching a single item by ID
- `useSupabaseMutation`: Hook for creating, updating, or deleting data

### Onboarding Hooks

- `useOnboardingProgress`: Fetch user's onboarding progress
- `useUpdateOnboardingStep`: Update a specific onboarding step
- `useCompleteOnboarding`: Mark onboarding as complete

### Album Hooks

- `useAlbumQuery`: Fetch a specific album by ID
- `useAlbumsByGenre`: Fetch albums filtered by genre
- `useUserRatings`: Get all ratings from a specific user
- `useRateAlbum`: Create or update an album rating
- `useUserCollections`: Get collections created by a user
- `useCreateCollection`: Create a new album collection
- `useAddAlbumToCollection`: Add an album to a collection

### User Hooks

- `useUserProfile`: Get user profile data
- `useUserStats`: Get statistics for a user (ratings, reviews, etc.)
- `useIsFollowing`: Check if current user follows another user
- `useToggleFollow`: Follow or unfollow a user
- `useSuggestedUsers`: Get user suggestions based on genres or popularity

### Search Hooks

- `useSearch`: Search across albums, artists, and users
- `useSearchSuggestions`: Get search suggestions as the user types

### Activity Hooks

- `useActivityFeed`: Get activity feed from followed users
- `useNewActivityCount`: Count new activity items since last check
- `markActivityChecked`: Mark activity feed as checked

## Real-time Updates

The app uses Supabase's real-time feature to automatically invalidate queries when data changes:

- Albums table changes invalidate `albums` queries
- Ratings table changes invalidate `ratings` queries
- Reviews table changes invalidate `reviews` queries
- Collections table changes invalidate `collections` queries
- Followers table changes invalidate `following` and `stats` queries

## Using the Hooks

### Basic Fetch Example

```tsx
import { useAlbumQuery } from "../hooks/queries";

function AlbumDetails({ albumId }) {
  const { data: album, isLoading, error } = useAlbumQuery(albumId);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading album!</p>;

  return (
    <div>
      <h1>{album.title}</h1>
      <p>By {album.artist_name}</p>
    </div>
  );
}
```

### Mutation Example

```tsx
import { useRateAlbum } from "../hooks/queries";

function RatingComponent({ albumId }) {
  const { mutate: rateAlbum, isLoading } = useRateAlbum();

  const handleRating = (rating) => {
    rateAlbum(
      { albumId, rating },
      {
        onSuccess: () => {
          // Show success notification
        },
        onError: (error) => {
          // Show error message
        },
      }
    );
  };

  return <div>{/* Rating UI */}</div>;
}
```

## Best Practices

1. **Use the provided hooks** rather than direct Supabase calls to ensure consistent caching
2. **Handle loading and error states** for better UX
3. **Check enabled state** for queries that depend on user auth
4. **Use optimistic updates** for a snappier feel (TanStack Query supports this)
5. **Monitor React Query DevTools** in development to debug query behavior

## Extending the System

To create a new query hook:

1. Create a new file in `hooks/queries` folder for related queries
2. Export your hooks from the file
3. Add the export to `hooks/queries/index.ts`

## References

- [TanStack Query Documentation](https://tanstack.com/query/latest/)
- [Supabase Documentation](https://supabase.com/docs)
