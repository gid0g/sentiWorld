import React, { useState, useEffect, useMemo } from 'react';
import { Table, Form, Pagination, Card, Spinner, Alert } from 'react-bootstrap';
import Papa from 'papaparse';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';

const RawData = () => {
  const { darkMode } = useTheme();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackData, setFeedbackData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchFeedbackData();
  }, []);

  const fetchFeedbackData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/analytics/user/feedback');
      setFeedbackData(response.data || []);
      console.log(response?.data)
    } catch (err) {
      console.error('Error fetching feedback data:', err);
      if (err.response?.status === 401) {
        showToast('Your session has expired. Please log in again.', 'error');
      } else {
        setError(err.response?.data?.detail || 'Failed to load feedback data');
        showToast('Failed to load feedback data. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !feedbackData.length) return feedbackData;

    return [...feedbackData].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // Handle date sorting specifically
      if (sortConfig.key === 'date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (aVal < bVal) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [feedbackData, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + rowsPerPage);

  // Limit visible pagination items to improve mobile/tablet view
  const renderPaginationItems = () => {
    const items = [];
    const maxVisible = 5; // Show max 5 page buttons at once

    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Add ellipsis for many pages
    if (startPage > 1) {
      items.push(
        <Pagination.Item key="start-ellipsis" disabled>
          ...
        </Pagination.Item>
      );
    }

    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => setCurrentPage(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    if (endPage < totalPages) {
      items.push(
        <Pagination.Item key="end-ellipsis" disabled>
          ...
        </Pagination.Item>
      );
    }

    return items;
  };

  if (loading) {
    return (
      <Card className={`h-100 ${darkMode ? 'bg-dark text-light' : 'bg-light'}`}>
        <Card.Body className="text-center p-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <div className="mt-2">Loading...</div>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`h-100 ${darkMode ? 'bg-dark text-light' : 'bg-light'}`}>
        <Card.Body className="p-3">
          <Alert variant="danger">
            <Alert.Heading>Error Loading Feedback Data</Alert.Heading>
            <p>{error}</p>
            <hr />
            <div className="d-flex justify-content-end">
              <button className="btn btn-outline-danger" onClick={fetchFeedbackData}>
                Retry
              </button>
            </div>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  if (!feedbackData || feedbackData.length === 0) {
    return (
      <Card className={`h-100 ${darkMode ? 'bg-dark text-light' : 'bg-light'}`}>
        <Card.Body className="text-center p-5">
          <Alert variant={`${darkMode ? 'secondary' : 'primary'}`}>
            <Alert.Heading>No Feedback Data</Alert.Heading>
            <p>You haven't uploaded any feedback data yet.</p>
            <hr />
            <div className="d-flex justify-content-end">
              <Link to="/upload" className="btn btn-primary">
                Upload Feedback Data
              </Link>
            </div>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className={`h-100 ${darkMode ? 'bg-dark text-light' : 'bg-light'}`}>
      <Card.Body className="p-2 p-md-3">
        <div className="mb-3">
          <Card.Text className="text-muted">
            Detailed view of latest feedback entries
          </Card.Text>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
          <Form.Select
            style={{ width: 'auto' }}
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10 rows</option>
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
          </Form.Select>
        </div>

        {/* This wrapper ensures horizontal scrolling works correctly */}
        <div
          className="table-responsive w-100"
          style={{
            overflowX: 'auto',
            marginLeft: '-1px', // Pull slightly left to ensure first column is fully visible
            width: 'calc(100% + 2px)' // Compensate for the marginLeft
          }}
        >
          <Table
            striped
            bordered
            hover
            variant={darkMode ? 'dark' : 'light'}
            style={{ minWidth: '100%' }} // Ensure table takes full width
          >
            <thead>
              <tr>
                <th
                  onClick={() => handleSort('id')}
                  style={{
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    padding: '0.5rem',
                    position: 'relative'
                  }}
                >
                  ID
                  {sortConfig.key === 'id' && (
                    <span style={{ position: 'absolute', right: '0.25rem' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th
                  onClick={() => handleSort('text')}
                  style={{
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    padding: '0.5rem',
                    position: 'relative'
                  }}
                >
                  Text
                  {sortConfig.key === 'text' && (
                    <span style={{ position: 'absolute', right: '0.25rem' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th
                  onClick={() => handleSort('sentiment')}
                  style={{
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    padding: '0.5rem',
                    position: 'relative'
                  }}
                >
                  Sentiment
                  {sortConfig.key === 'sentiment' && (
                    <span style={{ position: 'absolute', right: '0.25rem' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th
                  onClick={() => handleSort('topic')}
                  style={{
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    padding: '0.5rem',
                    position: 'relative'
                  }}
                >
                  Topic
                  {sortConfig.key === 'topic' && (
                    <span style={{ position: 'absolute', right: '0.25rem' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th
                  onClick={() => handleSort('date')}
                  style={{
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    padding: '0.5rem',
                    position: 'relative'
                  }}
                >
                  Date
                  {sortConfig.key === 'date' && (
                    <span style={{ position: 'absolute', right: '0.25rem' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: '0.5rem' }}>{item.id}</td>
                  <td style={{ padding: '0.5rem' }}>{item.text}</td>
                  <td style={{ padding: '0.5rem' }}>{item.sentiment}</td>
                  <td style={{ padding: '0.5rem' }}>{item.topic}</td>
                  <td style={{ padding: '0.5rem' }}>
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
          <div className="mb-2 mb-md-0">
            Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, sortedData.length)} of {sortedData.length} entries
          </div>
          <Pagination className="flex-wrap">
            <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
            <Pagination.Prev onClick={() => setCurrentPage(curr => Math.max(1, curr - 1))} disabled={currentPage === 1} />
            {renderPaginationItems()}
            <Pagination.Next onClick={() => setCurrentPage(curr => Math.min(totalPages, curr + 1))} disabled={currentPage === totalPages} />
            <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
          </Pagination>
        </div>
      </Card.Body>
    </Card>
  );
};

export default RawData;