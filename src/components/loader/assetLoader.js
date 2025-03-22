// src/utils/assetLoader.js
class AssetLoader {
  constructor() {
    this.assets = {
      images: [],
      fonts: [],
      components: [],
      other: []
    };
    this.loadedCount = 0;
    this.totalCount = 0;
    this.onProgressCallbacks = [];
    this.onCompleteCallbacks = [];
    this.componentRegistry = new Map();
    this.loadedComponents = new Set();
  }

  // Register an image to be preloaded
  registerImage(src) {
    if (!this.assets.images.includes(src)) {
      this.assets.images.push(src);
      this.totalCount++;
    }
    return this; // For chaining
  }

  // Register a font to be preloaded
  registerFont(fontFamily, fontWeight = 'normal', fontStyle = 'normal') {
    const fontKey = `${fontWeight} ${fontStyle} 1em ${fontFamily}`;
    if (!this.assets.fonts.includes(fontKey)) {
      this.assets.fonts.push(fontKey);
      this.totalCount++;
    }
    return this; // For chaining
  }

  // Register a component for preloading
  registerComponent(componentName) {
    if (!this.assets.components.includes(componentName)) {
      this.assets.components.push(componentName);
      this.componentRegistry.set(componentName, false);
      this.totalCount++;
    }
    return this; // For chaining
  }

  // Mark a component as loaded
  componentLoaded(componentName) {
    if (this.componentRegistry.has(componentName) && !this.loadedComponents.has(componentName)) {
      this.loadedComponents.add(componentName);
      this.componentRegistry.set(componentName, true);
      this.updateProgress();
    }
  }

  // Register any other asset with a custom load function
  registerOther(loadFn) {
    this.assets.other.push(loadFn);
    this.totalCount++;
    return this; // For chaining
  }

  // Add progress listener
  onProgress(callback) {
    this.onProgressCallbacks.push(callback);
    return this; // For chaining
  }

  // Add complete listener
  onComplete(callback) {
    this.onCompleteCallbacks.push(callback);
    return this; // For chaining
  }

  // Update progress and notify listeners
  updateProgress() {
    this.loadedCount++;
    const progress = Math.floor((this.loadedCount / this.totalCount) * 100);
    
    // Notify all progress listeners
    this.onProgressCallbacks.forEach(callback => callback(progress));
    
    // If everything is loaded, notify completion listeners
    if (this.loadedCount >= this.totalCount) {
      this.onCompleteCallbacks.forEach(callback => callback());
    }
  }

  // Preload a single image
  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        this.updateProgress();
        resolve(img);
      };
      img.onerror = (err) => {
        console.error(`Failed to load image: ${src}`, err);
        this.updateProgress();
        reject(err);
      };
    });
  }

  // Preload a single font
  preloadFont(fontDefinition) {
    if (document.fonts && document.fonts.load) {
      return document.fonts.load(fontDefinition)
        .then(() => {
          this.updateProgress();
        })
        .catch(err => {
          console.error(`Failed to load font: ${fontDefinition}`, err);
          this.updateProgress();
        });
    } else {
      return new Promise(resolve => {
        // Fallback for browsers without document.fonts
        setTimeout(() => {
          this.updateProgress();
          resolve();
        }, 500);
      });
    }
  }

  // Check if all components are loaded
  areAllComponentsLoaded() {
    if (this.assets.components.length === 0) return true;
    
    for (const [componentName, isLoaded] of this.componentRegistry.entries()) {
      if (!isLoaded) return false;
    }
    
    return true;
  }

  // Start preloading all registered assets
  preloadAll() {
    // If no assets are registered, complete immediately
    if (this.totalCount === 0) {
      this.onCompleteCallbacks.forEach(callback => callback());
      return Promise.resolve();
    }

    const imagePromises = this.assets.images.map(src => this.preloadImage(src));
    const fontPromises = this.assets.fonts.map(font => this.preloadFont(font));
    
    // Components are handled separately through componentLoaded() calls
    // We'll create a promise that resolves when all components are loaded
    const componentsPromise = new Promise((resolve) => {
      // If no components, resolve immediately
      if (this.assets.components.length === 0) {
        resolve();
        return;
      }
      
      // Set up a checker that runs periodically
      const checkInterval = setInterval(() => {
        if (this.areAllComponentsLoaded()) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      
      // Safety timeout to prevent hanging (10 seconds)
      setTimeout(() => {
        clearInterval(checkInterval);
        console.warn('Component loading timed out. Some components may not have reported loaded state.');
        resolve();
      }, 10000);
    });
    
    const otherPromises = this.assets.other.map(loadFn => {
      return Promise.resolve(loadFn())
        .then(() => {
          this.updateProgress();
        })
        .catch(err => {
          console.error('Failed to load custom asset', err);
          this.updateProgress();
        });
    });

    return Promise.all([...imagePromises, ...fontPromises, componentsPromise, ...otherPromises])
      .catch(error => {
        console.error('Some assets failed to load', error);
        // We still resolve the promise to continue with the app
      });
  }
}

// Create and export a singleton instance
export const assetLoader = new AssetLoader();