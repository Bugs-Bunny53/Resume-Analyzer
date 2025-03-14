import React, { useState } from 'react';

const AnalysisPanel = ({ analysisData }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const handleCategorySelect = (item) => {
    setSelectedCategoryId(item.id); // Toggle between active/inactive state
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
              <span className='analysis-score'>Score: {item.score}</span>
            </div>
            {isActive && (
              <div className='analysis-details'>
                <p>{item.body}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AnalysisPanel;
