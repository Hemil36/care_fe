# Performance Optimization Guide

This document outlines performance optimization strategies for the CARE frontend application.

## 1. Testing Performance

### Cypress Test Optimization

#### Avoid Hardcoded Waits
❌ **Bad Practice:**
```javascript
cy.wait(2000); // Arbitrary timeout
```

✅ **Good Practice:**
```javascript
// Wait for specific elements or states
cy.get('[data-cy="save-button"]').should('be.visible');
cy.wait('@apiCall').its('response.statusCode').should('eq', 200);
```

#### Use Proper Element Waiting
```javascript
// Wait for element state changes
cy.get('[data-cy="loading-spinner"]').should('not.exist');
cy.get('[data-cy="content"]').should('be.visible');

// Wait for API responses
cy.intercept('POST', '/api/v1/files/**').as('uploadFile');
cy.wait('@uploadFile').its('response.statusCode').should('eq', 200);
```

#### Optimize Test Data Setup
- Use fixtures for consistent test data
- Mock API responses when possible
- Clean up test data after tests
- Use efficient selectors (data-cy attributes)

## 2. Memory Management

### Media & Audio Components

#### Proper Cleanup in useVoiceRecorder
```tsx
useEffect(() => {
  return () => {
    // Cleanup animation frames
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Cleanup audio nodes
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
  };
}, []);
```

#### Best Practices for Media Handling
- Always cleanup MediaRecorder instances
- Close AudioContext when component unmounts
- Cancel animation frames to prevent memory leaks
- Disconnect audio nodes after use
- Use refs to persist objects across renders

## 3. React Performance

### Component Optimization

#### Use React.memo for Pure Components
```tsx
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* render expensive content */}</div>;
});
```

#### Optimize useEffect Dependencies
```tsx
// Include all dependencies in the dependency array
useEffect(() => {
  fetchData(id, filter);
}, [id, filter]); // Don't omit dependencies

// Use useCallback for function dependencies
const handleClick = useCallback(() => {
  onClick(id);
}, [onClick, id]);
```

#### Lazy Loading Components
```tsx
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

### State Management Optimization

#### Minimize State Updates
- Batch related state updates
- Use state updater functions for derived state
- Consider using useReducer for complex state logic

#### Avoid Unnecessary Re-renders
- Move state closer to where it's used
- Use local state instead of global when possible
- Implement proper shouldComponentUpdate logic

## 4. Bundle Optimization

### Code Splitting
```tsx
// Route-based code splitting
const HomePage = lazy(() => import('./pages/Home'));
const PatientPage = lazy(() => import('./pages/Patient'));

// Feature-based code splitting
const AdvancedFeatures = lazy(() => import('./components/AdvancedFeatures'));
```

### Tree Shaking
- Use ES6 imports/exports
- Import only what you need from libraries
- Configure webpack/vite for optimal tree shaking

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Monitor bundle size over time
npm install --save-dev bundlesize
```

## 5. Network Performance

### API Optimization

#### Implement Proper Loading States
```tsx
const { data, isLoading, error } = useQuery('patients', fetchPatients);

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage />;
return <PatientList data={data} />;
```

#### Use React Query for Caching
```tsx
const { data } = useQuery(
  ['patient', id],
  () => fetchPatient(id),
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  }
);
```

#### Implement Pagination
```tsx
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(
  'patients',
  ({ pageParam = 1 }) => fetchPatients({ page: pageParam }),
  {
    getNextPageParam: (lastPage) => lastPage.nextPage,
  }
);
```

## 6. Image & Asset Optimization

### Image Loading
```tsx
// Lazy load images
<img 
  loading="lazy" 
  src={imageUrl} 
  alt="Description"
  decoding="async"
/>

// Use optimized image formats
// WebP with fallback
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="Description" />
</picture>
```

### Asset Optimization
- Compress images and use appropriate formats
- Use CDN for static assets
- Implement proper caching headers
- Minimize CSS and JavaScript files

## 7. Performance Monitoring

### Core Web Vitals
Monitor these key metrics:
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Performance Budgets
```json
// performance-budget.json
{
  "budgets": [
    {
      "type": "bundle",
      "name": "main",
      "baseline": "1MB",
      "warning": "800KB",
      "error": "1.2MB"
    }
  ]
}
```

### Monitoring Tools
- Use React DevTools Profiler
- Implement performance tracking
- Monitor Core Web Vitals in production
- Use Lighthouse for regular audits

## 8. Accessibility Performance

### Efficient Accessibility
- Use semantic HTML for better performance
- Implement proper focus management
- Avoid excessive aria-live updates
- Optimize screen reader experience

## Performance Checklist

- [ ] No hardcoded waits in tests
- [ ] Proper cleanup in useEffect hooks
- [ ] Memory leaks prevented in media components
- [ ] Components optimized with React.memo where appropriate
- [ ] Bundle size monitored and optimized
- [ ] Images lazy loaded and optimized
- [ ] API calls cached and optimized
- [ ] Performance budgets implemented
- [ ] Core Web Vitals monitored
- [ ] Accessibility performance considered

## Tools & Resources

### Performance Testing
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [React DevTools Profiler](https://reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html)

### Bundle Analysis
- [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [vite-bundle-analyzer](https://github.com/nonzzz/vite-bundle-analyzer)

### Monitoring
- [Web Vitals](https://web.dev/vitals/)
- [Performance Observer API](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver)