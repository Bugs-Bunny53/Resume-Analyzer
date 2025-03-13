import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Splash.css';

const Splash = () => {
  const navigate = useNavigate();
  //get all job listings and store in this state
  const jawbs = [
    {
      title: 'Chef',
    },
    {
      title: 'Artist',
    },
    {
      title: 'Drummer',
    },
    {
      title: 'Software Developer',
    },
    {
      title: 'Cop',
    },
    {
      title: 'Fireman',
    },
    {
      title: 'Judge',
    },
    {
      title: 'Massause',
    },
    {
      title: 'Doctor',
    },
    {
      title: 'Lawyer',
    },
    {
      title: 'Mailman',
    },
    {
      title: 'Mechanic',
    },
    {
      title: 'Salesman',
    },
    {
      title: 'Accountant',
    },
  ];
  const [jobListings, setJobListings] = useState(jawbs);
  //fetch job listings for now use jawbs
  //   useEffect(() => {
  //
  //     try {
  //         const response = await fetch('/api/jobs');
  //         const data = await response.json();
  //         setJobListings(data.jobs)
  //     } catch (error) {
  //         console.log('error fetching job listings:', error);
  //         setJobListings([]);
  //     }
  //   }, []);

  //navigate after time period
  useEffect(() => {
    // Delay navigation to allow time for the animation
    const timer = setTimeout(() => {
      navigate('/dashboard', { state: { jobListings } });
    }, 10000); // Adjust time as needed for your animation
    return () => clearTimeout(timer);
  }, [navigate, jobListings]);

  return (
    <div className='splash-screen'>
      <div className='logo'>ResumeReview</div>
      <p className='tagline'>Sharper Resumes, Smarter Careers</p>
      <p className='description'>
        Welcome to ResumeReview – your AI-powered career companion. We're
        analyzing your resume and matching your skills with the best job
        opportunities.
      </p>
    </div>
  );
};

export default Splash;
