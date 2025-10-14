import React from 'react';

const ProductsSkeletonLoader: React.FC = () => {
  return (
    <div className="products-section">
      {/* Sidebar Skeleton */}
      <div className="products-sidebar">
        <div className="sidebar-header">
          <div className="skeleton-title">
            <div className="skeleton skeleton-icon"></div>
            <div className="skeleton skeleton-text skeleton-text-lg"></div>
          </div>
        </div>

        <div className="sidebar-content">
          {/* Search Section Skeleton */}
          <div className="sidebar-section">
            <div className="skeleton skeleton-text skeleton-text-sm skeleton-section-title"></div>
            <div className="sidebar-search">
              <div className="skeleton skeleton-input"></div>
            </div>
          </div>

          {/* Filters Section Skeleton */}
          <div className="sidebar-section">
            <div className="skeleton skeleton-text skeleton-text-sm skeleton-section-title"></div>
            <div className="sidebar-filters">
              <div className="skeleton skeleton-filter-btn active">
                <div className="skeleton skeleton-icon-sm"></div>
                <div className="skeleton skeleton-text skeleton-text-md"></div>
              </div>
              <div className="skeleton skeleton-filter-btn">
                <div className="skeleton skeleton-icon-sm"></div>
                <div className="skeleton skeleton-text skeleton-text-md"></div>
              </div>
              <div className="skeleton skeleton-filter-btn">
                <div className="skeleton skeleton-icon-sm"></div>
                <div className="skeleton skeleton-text skeleton-text-md"></div>
              </div>
            </div>
          </div>

          {/* Add Button Skeleton */}
          <div className="sidebar-section">
            <div className="skeleton skeleton-add-btn">
              <div className="skeleton skeleton-icon-sm"></div>
              <div className="skeleton skeleton-text skeleton-text-md"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="products-main">
        {/* Header Skeleton */}
        <div className="products-main-header">
          <div className="skeleton skeleton-text skeleton-text-xl skeleton-main-title"></div>
          <div className="skeleton skeleton-text skeleton-text-md skeleton-subtitle"></div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="products-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton-product-card">
              {/* Product Image Skeleton */}
              <div className="skeleton-product-image">
                <div className="skeleton skeleton-image"></div>
              </div>
              
              {/* Product Content Skeleton */}
              <div className="skeleton-product-content">
                <div className="skeleton-product-header">
                  <div className="skeleton skeleton-text skeleton-text-lg"></div>
                  <div className="skeleton skeleton-badge"></div>
                </div>
                
                <div className="skeleton skeleton-text skeleton-text-md skeleton-description"></div>
                <div className="skeleton skeleton-text skeleton-text-md skeleton-description-2"></div>
                
                <div className="skeleton-product-details">
                  <div className="skeleton-product-price">
                    <div className="skeleton skeleton-text skeleton-text-sm"></div>
                    <div className="skeleton skeleton-text skeleton-text-lg skeleton-price"></div>
                  </div>
                  
                  <div className="skeleton-product-date">
                    <div className="skeleton skeleton-text skeleton-text-sm"></div>
                    <div className="skeleton skeleton-text skeleton-text-sm"></div>
                  </div>
                </div>
              </div>
              
              {/* Product Actions Skeleton */}
              <div className="skeleton-product-actions">
                <div className="skeleton skeleton-btn skeleton-btn-secondary"></div>
                <div className="skeleton skeleton-btn skeleton-btn-danger"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsSkeletonLoader;
