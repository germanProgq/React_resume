// src/utils/withLoading.js
import React, { useEffect, useState } from 'react';
import { assetLoader } from './assetLoader';

/**
 * HOC that wraps a component and signals when it's fully loaded
 * @param {React.Component} Component - The component to wrap
 * @param {string} componentName - Unique name for tracking this component
 * @param {Function} loadCheck - Optional function that returns a promise to check when component is ready
 */
export const withLoading = (Component, componentName, loadCheck = null) => {
  // Register this component with the asset loader
  assetLoader.registerComponent(componentName);
  
  // Return the wrapped component
  return (props) => {
    const [isReady, setIsReady] = useState(false);
    
    useEffect(() => {
      // If there's a custom load check function, use it
      if (loadCheck) {
        loadCheck()
          .then(() => {
            setIsReady(true);
            assetLoader.componentLoaded(componentName);
          })
          .catch(err => {
            console.error(`Error loading component ${componentName}:`, err);
            // Mark as loaded anyway to prevent hanging
            setIsReady(true);
            assetLoader.componentLoaded(componentName);
          });
      } else {
        // Otherwise, mark as loaded on mount
        // Use a small timeout to simulate mount completion
        const timer = setTimeout(() => {
          setIsReady(true);
          assetLoader.componentLoaded(componentName);
        }, 100);
        
        return () => clearTimeout(timer);
      }
    }, []);
    
    // Return the component (during loading, it will still render but not be visible)
    return <Component {...props} isComponentLoaded={isReady} />;
  };
};

/**
 * Hook version for functional components
 * @param {string} componentName - Unique name for tracking this component
 * @param {Function} loadCheck - Optional function that returns a promise
 */
export const useComponentLoading = (componentName, loadCheck = null) => {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Register this component when the hook is first used
    assetLoader.registerComponent(componentName);
    
    // Handle loading logic
    if (loadCheck) {
      loadCheck()
        .then(() => {
          setIsReady(true);
          assetLoader.componentLoaded(componentName);
        })
        .catch(err => {
          console.error(`Error loading component ${componentName}:`, err);
          setIsReady(true);
          assetLoader.componentLoaded(componentName);
        });
    } else {
      // Mark as loaded after a short delay
      const timer = setTimeout(() => {
        setIsReady(true);
        assetLoader.componentLoaded(componentName);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [componentName]);
  
  return isReady;
};