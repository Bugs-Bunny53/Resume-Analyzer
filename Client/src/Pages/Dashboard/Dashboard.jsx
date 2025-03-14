import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Toolbar from './Toolbar';
import ResumeViewer from './ResumeViewer';
import PDFViewer from './PDFViewer';
import AnalysisPanel from './AnalysisPanel';
import './Dashboard.css';
import DocxToHtml from './DocxToHtml';

const Dashboard = () => {
  const location = useLocation();
  const jobListings = location.state?.jobListings || [];

  const [resumeText, setResumeText] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [wordFile, setWordFile] = useState(null);
  const [analysisData, setAnalysisData] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isResumeUploaded, setIsResumeUploaded] = useState(false);

  const handleResumeUpdate = (newText) => {
    setResumeText(newText);
    setIsResumeUploaded(true);
  };

  const handleUploadResume = (file) => {
    console.log(`Uploading file: ${file.name}`);
    setPdfUrl(null);
    setWordFile(null);
    setResumeText('');
    setIsResumeUploaded(false);

    if (file.type === 'application/pdf') {
      const fileUrl = URL.createObjectURL(file);
      setPdfUrl(fileUrl);
      setIsResumeUploaded(true);
    } else if (
      file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      setWordFile(file);
      setIsResumeUploaded(true);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        setResumeText(e.target.result);
        setPdfUrl(null);
        setIsResumeUploaded(true);
      };
      reader.readAsText(file);
    }
  };

  const onJobSelect = (job) => {
    console.log(job);
    setSelectedJob(job);
  };

  useEffect(() => {
    if (isResumeUploaded && selectedJob) {
      console.log('Posting job:', selectedJob);
      const formData = new FormData();
      formData.append('onetsoc_code', selectedJob.onetsoc_code);

      if (resumeText) {
        formData.append('resumeText', resumeText);
      } else if (pdfUrl) {
        const file = new Blob([pdfUrl], { type: 'application/pdf' });
        formData.append('resumeFile', file, 'resume.pdf');
      } else if (wordFile) {
        formData.append('resumeFile', wordFile);
      }
      console.log(formData);
      fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Upload result', data);
          setAnalysisData(data.analysis);
        })
        .catch((error) => console.log('Error posting job and resume', error));
    }
  }, [isResumeUploaded, selectedJob]);

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
        onJobSelect={onJobSelect}
        jobListings={jobListings}
      />
      <div className='dashboard-content'>
        {renderViewer()}
        <AnalysisPanel analysisData={analysisData} />
      </div>
    </div>
  );
};

export default Dashboard;
