import React from 'react';

const OrdersSkeletonLoader: React.FC = () => {
  return (
    <div className="orders-section">
      {/* Sidebar Skeleton */}
      <div className="orders-sidebar">
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
              <div className="skeleton skeleton-filter-btn">
                <div className="skeleton skeleton-icon-sm"></div>
                <div className="skeleton skeleton-text skeleton-text-md"></div>
              </div>
            </div>
          </div>

          {/* Clear Button Skeleton */}
          <div className="sidebar-section">
            <div className="skeleton skeleton-clear-btn">
              <div className="skeleton skeleton-icon-sm"></div>
              <div className="skeleton skeleton-text skeleton-text-md"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="orders-main">
        {/* Header Skeleton */}
        <div className="orders-main-header">
          <div className="skeleton skeleton-text skeleton-text-xl skeleton-main-title"></div>
          <div className="skeleton skeleton-text skeleton-text-md skeleton-subtitle"></div>
        </div>

        {/* Orders Grid Skeleton */}
        <div className="orders-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton-order-card">
              {/* Order Header Skeleton */}
              <div className="skeleton-order-header">
                <div className="skeleton-order-id">
                  <div className="skeleton skeleton-text skeleton-text-sm"></div>
                  <div className="skeleton skeleton-text skeleton-text-md skeleton-order-number"></div>
                </div>
                <div className="skeleton skeleton-badge"></div>
              </div>
              
              {/* Order Content Skeleton */}
              <div className="skeleton-order-content">
                <div className="skeleton-order-client">
                  <div className="skeleton skeleton-text skeleton-text-lg skeleton-client-name"></div>
                  <div className="skeleton skeleton-text skeleton-text-md skeleton-client-email"></div>
                </div>
                
                <div className="skeleton-order-details">
                  <div className="skeleton-order-total">
                    <div className="skeleton skeleton-text skeleton-text-sm"></div>
                    <div className="skeleton skeleton-text skeleton-text-lg skeleton-total-value"></div>
                  </div>
                  
                  <div className="skeleton-order-items">
                    <div className="skeleton skeleton-text skeleton-text-sm"></div>
                    <div className="skeleton skeleton-text skeleton-text-sm"></div>
                  </div>
                  
                  <div className="skeleton-order-date">
                    <div className="skeleton skeleton-text skeleton-text-sm"></div>
                    <div className="skeleton skeleton-text skeleton-text-sm"></div>
                  </div>
                </div>
              </div>
              
              {/* Order Actions Skeleton */}
              <div className="skeleton-order-actions">
                <div className="skeleton skeleton-btn skeleton-btn-secondary"></div>
                <div className="skeleton skeleton-btn skeleton-btn-primary"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersSkeletonLoader;
