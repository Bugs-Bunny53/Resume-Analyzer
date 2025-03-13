// src/components/Dashboard/AnalysisPanel.jsx
import React, { useState } from 'react';

const AnalysisPanel = ({ analysisData, onCategoryClick }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const handleCategorySelect = (item) => {
    setSelectedCategoryId(item.id);
    onCategoryClick(item.highlightedLines);
  };

  return (
    <div className='analysis-panel'>
      <h3>Analysis Results</h3>
      {analysisData.map((item) => {
        const isActive = item.id === selectedCategoryId;
        return (
          <div
            key={item.id}
            className={`analysis-item ${isActive ? 'active' : ''}`}
            onClick={() => handleCategorySelect(item)}
          >
            <div className='analysis-category'>
              <strong>{item.category}</strong>
            </div>
            {isActive && (
              <div className='analysis-details'>
                <p>{item.details}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AnalysisPanel;
