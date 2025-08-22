import React, { useEffect, useState } from 'react';
import { Table, Button, Spinner } from 'react-bootstrap';
import { BarChartFill, Download, Share } from 'react-bootstrap-icons';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const Records = () => {
  const { darkMode } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyses, setAnalyses] = useState([]);

  // Theme-based styles
  const tableTheme = {
    backgroundColor: darkMode ? '#2d3748' : '#ffffff',
    color: darkMode ? '#e2e8f0' : '#1a202c',
    borderColor: darkMode ? '#4a5568' : '#e2e8f0',
  };

  const buttonTheme = {
    primary: {
      backgroundColor: darkMode ? '#4a5568' : '#3182ce',
      borderColor: darkMode ? '#2d3748' : '#2b6cb0',
      color: darkMode ? '#e2e8f0' : '#ffffff',
    },
    secondary: {
      backgroundColor: darkMode ? '#2d3748' : '#e2e8f0',
      borderColor: darkMode ? '#1a202c' : '#cbd5e0',
      color: darkMode ? '#e2e8f0' : '#1a202c',
    },
    info: {
      backgroundColor: darkMode ? '#2c5282' : '#4299e1',
      borderColor: darkMode ? '#2a4365' : '#3182ce',
      color: darkMode ? '#e2e8f0' : '#ffffff',
    },
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/analyses');
      setAnalyses(response.data);
    } catch (err) {
      console.error('Error fetching analyses:', err);
      if (err.response?.status === 401) {
        showToast('Your session has expired. Please log in again.', 'error');
        // The unauthorized event will be handled by App.jsx
      } else {
        setError(err.response?.data?.detail || 'Failed to load analyses');
        showToast('Failed to load analyses. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Format the date_analyzed field
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Function to handle visualization - navigate to visualization page with files
  const handleVisualize = (record) => {
    // Check if we have the required JSON data
    if (record.visualization_jsons &&
      (record.visualization_jsons.topic_sentiment_map ||
        record.visualization_jsons.sentiment_timeline ||
        record.visualization_jsons.sunburst ||
        record.visualization_jsons.topic_sentiment_viz)) {

      navigate('/visualize', {
        state: {
          visualizationFiles: record.visualization_files || [], // Keep for backward compatibility
          visualizationJsons: record.visualization_jsons,
          recordId: record.id,
          filename: record.filename,
          topicSentiment: record.topic_sentiment,
        },
      });
    } else {
      showToast('No visualization data available for this record.', 'error');
    }
  };

  // Function to handle download - download the folder as a zip
  const handleDownload = async (record) => {
    try {
      // Extract the folder path from results_path
      const folderPath = record.results_path.substring(0, record.results_path.lastIndexOf('/'));

      // Make API call to backend to create and download the zip
      const response = await fetch(`http://localhost:8000/api/v1/download-folder?path=${encodeURIComponent(folderPath)}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Create a blob from the response
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger download
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;

      // Set the download filename
      a.download = `${folderPath.split('/').pop()}.zip`;

      // Append the anchor to the body, trigger click, and remove
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading folder:', error);
      alert('Failed to download the folder. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className={`min-vh-100 d-flex justify-content-center align-items-center ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
        <div className="spinner-border text-sentiWorld" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-vh-100 d-flex justify-content-center align-items-center ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
        <div className="text-center">
          <h3>Error Loading Records</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchAnalyses}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className={`min-vh-100 d-flex justify-content-center align-items-center ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
        <div className={`card p-5 text-center ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
          <h2 className="mb-4">No Records Found</h2>
          <p className="mb-4">You haven't performed any analyses yet.</p>
          <Link to="/upload" className="btn btn-primary">
            Start Analysis
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: tableTheme.backgroundColor, color: tableTheme.color }}>
      <Table
        striped
        bordered
        hover
        className="align-middle"
        style={{
          '--bs-table-bg': tableTheme.backgroundColor,
          '--bs-table-color': tableTheme.color,
          '--bs-table-border-color': tableTheme.borderColor,
          '--bs-table-striped-bg': darkMode ? '#374151' : '#f7fafc',
          '--bs-table-striped-color': tableTheme.color,
          '--bs-table-hover-bg': darkMode ? '#4a5568' : '#edf2f7',
          '--bs-table-hover-color': tableTheme.color,
        }}
      >
        <thead>
          <tr className="text-center">
            <th>Filename</th>
            <th>Analysis Date</th>
            <th>Visualize</th>
            <th>Download</th>
            <th>Export</th>
          </tr>
        </thead>
        <tbody>
          {analyses.map((record) => (
            <tr
              key={record.id}
              className="transition-all hover:shadow-lg"
              style={{
                height: '80px',
                transition: 'all 0.3s ease-in-out',
              }}
            >
              <td>{record.filename}</td>
              <td className="text-center">{formatDate(record.date_analyzed)}</td>
              <td className="text-center">
                <Button
                  variant="primary"
                  size="sm"
                  className="d-inline-flex align-items-center justify-content-center"
                  style={{
                    minWidth: '100px',
                    ...buttonTheme.primary,
                  }}
                  onClick={() => handleVisualize(record)}
                  disabled={!record.visualization_jsons ||
                    (!record.visualization_jsons.topic_sentiment_map &&
                      !record.visualization_jsons.sentiment_timeline &&
                      !record.visualization_jsons.sunburst &&
                      !record.visualization_jsons.topic_sentiment_viz)}
                >
                  <BarChartFill className="me-2" /> Visualize
                </Button>
              </td>
              <td className="text-center">
                <Button
                  variant="secondary"
                  size="sm"
                  className="d-inline-flex align-items-center justify-content-center"
                  style={{
                    width: '40px',
                    height: '40px',
                    ...buttonTheme.secondary,
                  }}
                  onClick={() => handleDownload(record)}
                >
                  <Download />
                </Button>
              </td>
              <td className="text-center">
                <Button
                  variant="info"
                  size="sm"
                  className="d-inline-flex align-items-center justify-content-center"
                  style={{
                    width: '40px',
                    height: '40px',
                    ...buttonTheme.info,
                  }}
                >
                  <Share />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Records;

