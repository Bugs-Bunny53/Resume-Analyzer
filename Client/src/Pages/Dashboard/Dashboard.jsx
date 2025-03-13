import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Toolbar from './Toolbar';
import ResumeViewer from './ResumeViewer';
import PDFViewer from './PDFViewer';
import AnalysisPanel from './AnalysisPanel';
import './Dashboard.css';
import DocxToHtml from './DocxToHtml';

const Dashboard = () => {
  //splash will pass the job listings here
  const location = useLocation();
  const jobListings = location.state?.jobListings || [];

  const [resumeText, setResumeText] = useState(
    `Upload or paste resume to get your results!`
  );
  const [pdfUrl, setPdfUrl] = useState(null);
  const [wordFile, setWordFile] = useState(null);
  const [analysisData, setAnalysisData] = useState([
    {
      id: 1,
      category: 'Skills Mismatch',
      details: 'You might be missing key skills for this position.',
    },
    {
      id: 2,
      category: 'Grammar & Spelling',
      details: 'Some grammatical errors detected in lines 3 and 4.',
    },
    {
      id: 3,
      category: 'Relevant Experience',
      details:
        'You have relevant experience in line 2, but it needs expansion.',
    },
  ]);

  //text box
  const handleResumeUpdate = (newText) => {
    setResumeText(newText);
  };
  //think we need cases for all types of files in here
  const handleUploadResume = (file) => {
    console.log(`Uploading file: ${file.name}`);
    setPdfUrl(null);
    setWordFile(null);
    setResumeText('');
    // Check if the file is a PDF
    if (file.type === 'application/pdf') {
      // Create a URL for the PDF file
      const fileUrl = URL.createObjectURL(file);
      setPdfUrl(fileUrl);
    } else if (
      file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      setWordFile(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        setResumeText(e.target.result);
        // Clear any previously loaded PDF
        setPdfUrl(null);
      };
      reader.readAsText(file);
    }
  };

  const onJobSelect = (job) => {
    //here we will post to the AI endpoint with the job
    /*
    fetch(API), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(job)
  })
    .then(response => response.json())
    .then(data => )
    .catch(error => console.log('error posting job:', error));
    */
    console.log('selected:', job);
  };

  //here we render the right viewer
  const renderViewer = () => {
    if (pdfUrl) {
      return <PDFViewer pdfUrl={pdfUrl} />;
    } else if (wordFile) {
      return <DocxToHtml file={wordFile} />;
    } else {
      return <ResumeViewer resumeText={resumeText} />;
    }
  };

  return (
    <div className='dashboard'>
      <Toolbar
        onResumeUpdate={handleResumeUpdate}
        onUploadResume={handleUploadResume}
        jobListings={jobListings}
        onJobSelect={onJobSelect}
      />
      <div className='dashboard-content'>
        {renderViewer()}
        <AnalysisPanel analysisData={analysisData} />
      </div>
    </div>
  );
};
export default Dashboard;
