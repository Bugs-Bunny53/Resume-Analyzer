import React, { useState, useEffect } from 'react';

const JobListings = ({ onJobSelect, jobListings }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);

  useEffect(() => {
    if (!jobListings) return;

    //search through the jobs passed down through state
    //copied and pasted from last project LOL
    const results = jobListings.filter((job) => {
      return job.title.toLowerCase().includes(searchQuery.toLowerCase());
    });
    setFilteredJobs(results);
  }, [searchQuery, jobListings]);

  const handleSelect = (job) => {
    setSearchQuery(job.title);
    setFilteredJobs([]);
    onJobSelect(job);
  };

  return (
    <div className='job-search'>
      <input
        type='text'
        placeholder='Search job listings'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {filteredJobs.length > 0 && (
        <ul className='job-results'>
          {filteredJobs.map((job) => (
            <li key={job.id} onClick={() => handleSelect(job)}>
              {job.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JobListings;
