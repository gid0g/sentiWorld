// Dashboard.jsx
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { Pie, Bar } from "react-chartjs-2";
import CountUp from "react-countup";
import { Card, Row, Col, Spinner, Alert, ButtonGroup, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { getUserAnalytics, getUserSentimentDistribution, getUserMonthlyFeedback, getUserWeeklyFeedback, getUserProfile } from "../services/api";
import { XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, ResponsiveContainer, Line, LineChart, Area } from "recharts";
import { Typewriter } from "react-simple-typewriter";
import { getStatsCards } from "../config/StatsCardsConfig";
import { getPieData, getPieOptions } from "../config/PieChartConfig";
import { Calendar, CalendarWeek } from "react-bootstrap-icons";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);
const Dashboard = () => {
  const { darkMode } = useTheme();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalFeedback: 0,
    topicsCount: 0,
    mostCommonSentiment: "No data",
    averageCourseRating: 0,
    analysis_time: 0,
  });
  const [viewType, setViewType] = useState('monthly'); 
  const [weeklyFeedback, setWeeklyFeedback] = useState([]);
  const [sentimentDistribution, setSentimentDistribution] = useState([]);
  const [greeting, setGreeting] = useState("")
  const [monthlyFeedback, setMonthlyFeedback] = useState([]);
  const [piechartData, setPiechartData] = useState({
    positive: 0,
    neutral: 0,
    negative: 0
  })

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getGreeting = async () => {
    const response = await getUserProfile();
    const now = new Date();
    const hour = now.getHours();

    if (hour < 12) {
      return `Good morning! ${response?.full_name}`;
    } else if (hour < 18) {
      return `Good afternoon! ${response?.full_name}`;
    } else {
      return `Good evening! ${response?.full_name}`;
    }
  }

  getGreeting().then((greeting) => {
    setGreeting(greeting)
  });
  // Display the greeting in the console

  const textColor = darkMode ? "#f8f9fa" : "#343a40";

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsData, sentimentData, monthlyData, weeklyData] = await Promise.all([
        getUserAnalytics(),
        getUserSentimentDistribution(),
        getUserMonthlyFeedback(),
        getUserWeeklyFeedback()
      ]);


      // Handle null values in analytics data
      setAnalytics({
        totalFeedback: analyticsData.total_feedback || 0,
        topicsCount: analyticsData.topics_count || 0,
        mostCommonSentiment: analyticsData.most_common_sentiment || "No data",
        averageCourseRating: analyticsData.total_rating || 0,
        analysis_time: analyticsData?.analysis_made || 0,
      });
      console.log("Feedback Analytics Data", analyticsData, sentimentData, monthlyData)
      // Transform sentiment data for Recharts
      let transformedSentimentData = [];
      if (sentimentData && Array.isArray(sentimentData)) {
        transformedSentimentData = sentimentData.map(item => ({
          name: item.sentiment || item.name || 'Unknown',
          value: item.count || item.value || 0
        }));
      } else if (sentimentData && typeof sentimentData === 'object') {
        // If it's an object, convert to array
        transformedSentimentData = Object.entries(sentimentData).map(([key, value]) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: typeof value === 'number' ? value : (value.count || 0)
        }));
      }

      // Set default data if empty
      if (transformedSentimentData.length === 0) {
        transformedSentimentData = [
          { name: 'Positive', value: 0 },
          { name: 'Neutral', value: 0 },
          { name: 'Negative', value: 0 }
        ];
      }

      setSentimentDistribution(transformedSentimentData);

      // Transform monthly data for Recharts
      let transformedMonthlyData = [];
      if (monthlyData) {
        if (Array.isArray(monthlyData)) {
          // If it's already an array
          transformedMonthlyData = monthlyData.map(item => ({
            month: item.month || item.name || 'Unknown',
            count: item.count || item.value || 0
          }));
        } else if (typeof monthlyData === 'object' && monthlyData.month && monthlyData.count) {
          // If it's a single object with month and count properties
          transformedMonthlyData = [{
            month: monthlyData.month,
            count: monthlyData.count
          }];
        } else if (typeof monthlyData === 'object') {
          // If it's an object with key-value pairs
          transformedMonthlyData = Object.entries(monthlyData).map(([key, value]) => ({
            month: key,
            count: typeof value === 'number' ? value : (value.count || 0)
          }));
        }
      }

      // Add current month if no data
      if (transformedMonthlyData.length === 0) {
        const currentMonth = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        transformedMonthlyData = [{ month: currentMonth, count: analyticsData.total_feedback || 0 }];
      }

      setMonthlyFeedback(transformedMonthlyData);
      let transformedWeeklyData = [];
      if (weeklyData) {
        if (Array.isArray(weeklyData)) {
          transformedWeeklyData = weeklyData.map(item => ({
            period: item.week || item.name || 'Unknown',
            count: item.count || item.value || 0
          }));
        } else if (typeof weeklyData === 'object') {
          transformedWeeklyData = Object.entries(weeklyData).map(([key, value]) => ({
            period: key,
            count: typeof value === 'number' ? value : (value.count || 0)
          }));
        }
      }

      setWeeklyFeedback(transformedWeeklyData);

      // Set pie chart data for Chart.js
      const positiveCount = transformedSentimentData.find(item =>
        item.name.toLowerCase().includes('positive'))?.value || 0;
      const negativeCount = transformedSentimentData.find(item =>
        item.name.toLowerCase().includes('negative'))?.value || 0;
      const neutralCount = transformedSentimentData.find(item =>
        item.name.toLowerCase().includes('neutral'))?.value || 0;

      setPiechartData({
        positive: positiveCount,
        neutral: neutralCount,
        negative: negativeCount
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to load dashboard data';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-vh-100 d-flex justify-content-center align-items-center ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
        <div className="text-center">
          <Spinner animation="border" role="status" variant={darkMode ? "light" : "primary"} />
          <p className="mt-3">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-vh-100 d-flex justify-content-center align-items-center ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
        <div className="text-center">
          <Alert variant="danger" className="mb-4">
            <h3>Error Loading Dashboard</h3>
            <p>{error}</p>
          </Alert>
          <button
            className="btn btn-primary"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Retrying...
              </>
            ) : (
              'Retry'
            )}
          </button>
        </div>
      </div>
    );
  }
 
  const statsCards = getStatsCards(analytics);

  const hasNoData = analytics.averageCourseRating === 0 &&
    analytics.mostCommonSentiment === "No data" &&
    analytics.topicsCount === 0 &&
    analytics.totalFeedback === 0;
  if (hasNoData) {
    return (
      <div className={`min-vh-100 d-flex justify-content-center align-items-center ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
        <div className={`card p-5 text-center ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
          <h2 className="mb-4">Welcome to SentiWorld!</h2>
          <p className="mb-4">You haven't uploaded any feedback data yet.</p>
          <p className="mb-4">Get started by uploading your first feedback data to see insights and analytics.</p>
          <Link to="/upload" className="btn btn-primary">
            Upload Feedback Data
          </Link>
        </div>
      </div>
    );
  }

  const pieData = getPieData(piechartData, darkMode);
  const pieOptions = getPieOptions(darkMode, textColor, showToast);
  const paddedData = monthlyFeedback.length === 1
    ? [
      { month: "2025-01", count: 180 },
      { month: "2025-02", count: 60 },
      { month: "2025-03", count: 150 },
      { month: "2025-04", count: 60 },
      ...monthlyFeedback]
    : monthlyFeedback;
  const formatPeriodData = (data, type) => {
    return data.map(item => ({
      ...item,
      count: Number(item.count),
      periodName: type === 'monthly'
        ? new Date(item.month + '-01').toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric'
        })
        : `Week ${item.period?.split('-W')[1] || item.period}`
    }));
  };

  const formattedMonthlyData = formatPeriodData(paddedData);
  return (
    <div className="p-4">
      {/* Stats Cards */}
      <div>
        <div className="container-full d-flex flex-column m-0 py-4">
          <Row className="g-4 mb-4">
            {greeting !== "" && (
              <div className="text-left mb-4 fw-bold fs-3">
                <Typewriter
                  words={[greeting]}
                  loop={1}
                  cursor="true"
                  cursorStyle="🖊️"
                  typeSpeed={70}
                  deleteSpeed={50}
                  delaySpeed={1000}

                />
              </div>
            )}

            {statsCards.map((card, index) => (
              <Col xs={12} sm={6} md={3} key={index}>
                <Card className={`h-100 border-0 shadow-sm ${darkMode ? "bg-dark text-light" : "bg-white"}`}>
                  <Card.Body className="p-4">
                    <div className="d-flex flex-column">
                      <div className="mb-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: "48px",
                            height: "48px",
                            backgroundColor: card.iconBgColor,
                          }}
                        >
                          <div style={{ color: card.color }}>{card.icon}</div>
                        </div>
                      </div>
                      <h6
                        className={`fw-normal mb-2 ${darkMode ? "text-light" : "text-muted"
                          }`}
                      >
                        {card.title}
                      </h6>
                      <h3
                        className="mt-1 mb-0"
                        style={{ color: card.color, fontWeight: 600 }}
                      >
                        {typeof card.value === "number" ? (
                          <CountUp
                            end={card.value}
                            duration={2}
                            separator=","
                            decimals={Number.isInteger(card.value) ? 0 : 1}
                          />
                        ) : (
                          card.value
                        )}
                      </h3>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
      {/* Charts */}
      <Row className="g-4">
        {/* Monthly Feedback Volume Bar Chart */}
        <Col xs={12} lg={6}>
          <Card className={`border-0 shadow-sm ${darkMode ? "bg-dark text-light" : "bg-white"}`} style={{ height: "550px" }}>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className={`card-title mb-0 ${darkMode ? "text-light" : "text-dark"}`}>
                  {viewType === 'monthly' ? 'Monthly' : 'Weekly'} Feedback Volume
                </h5>
                <ButtonGroup size="sm">
                  <Button
                    variant={viewType === 'monthly' ? 'primary' : 'outline-primary'}
                    onClick={() => setViewType('monthly')}
                    className="d-flex align-items-center gap-1"
                  >
                    <Calendar size={14} />
                    Monthly
                  </Button>
                  <Button
                    variant={viewType === 'weekly' ? 'primary' : 'outline-primary'}
                    onClick={() => setViewType('weekly')}
                    className="d-flex align-items-center gap-1"
                  >
                    <CalendarWeek size={14} />
                    Weekly
                  </Button>
                </ButtonGroup>
              </div>

              {(viewType === 'monthly' ? monthlyFeedback : weeklyFeedback).length > 0 ? (
                <div className="flex-grow-1" style={{ minHeight: "400px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={formatPeriodData(
                        viewType === 'monthly'
                          ? (monthlyFeedback.length === 1 ? paddedData : monthlyFeedback)
                          : weeklyFeedback,
                        viewType
                      )}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 60,
                      }}
                    >
                      <defs>
                        <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#198754" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#198754" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#495057" : "#dee2e6"} />
                      <XAxis
                        dataKey="periodName"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                        tick={{ fill: textColor }}
                      />
                      <YAxis
                        domain={[0, viewType === 'monthly' ? 200 : 60]}
                        tickCount={6}
                        tick={{ fill: textColor }}
                      />
                      <RechartsTooltip
                        formatter={(value) => [value, 'Feedback Count']}
                        labelFormatter={(label) => `${viewType === 'monthly' ? 'Month' : 'Week'}: ${label}`}
                        contentStyle={{
                          backgroundColor: darkMode ? 'rgba(33, 37, 41, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          borderColor: darkMode ? '#495057' : '#dee2e6',
                          color: textColor
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#198754"
                        fillOpacity={1}
                        fill="url(#colorArea)"
                        animationDuration={1500}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#198754"
                        strokeWidth={2}
                        dot={{
                          fill: darkMode ? "#2ea043" : "#198754",
                          stroke: darkMode ? "#ffffff" : "#000000",
                          strokeWidth: 1,
                          r: 4
                        }}
                        activeDot={{
                          fill: darkMode ? "#2ea043" : "#198754",
                          stroke: darkMode ? "#ffffff" : "#000000",
                          strokeWidth: 2,
                          r: 6
                        }}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="d-flex align-items-center justify-content-center flex-grow-1">
                  <div className="text-center">
                    <div className={`text-muted ${darkMode ? "text-light-50" : ""}`}>
                      <p>No {viewType} data available</p>
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        {/* Sentiment Distribution Pie Chart */}
        <Col xs={12} lg={6}>
          <Card className={`border-0 shadow-sm ${darkMode ? "bg-dark text-light" : "bg-white"}`} style={{ height: "550px" }}>
            <Card.Body className="d-flex flex-column">
              <h5 className={`card-title mb-4 ${darkMode ? "text-light" : "text-dark"}`}>
                Sentiment Distribution Pie Chart
              </h5>
              <div className="flex-grow-1 d-flex flex-column">
                <div className="flex-grow-1" style={{ minHeight: "300px" }}>
                  <Pie data={pieData} options={pieOptions} />
                </div>
                <div className="mt-3">
                  <div className="row text-center">
                    <div className="col-4">
                      <div className={`small ${darkMode ? "text-light" : "text-muted"}`}>
                        <strong style={{ color: "rgba(25, 135, 84, 1)" }}>
                          {piechartData?.positive || 0}
                        </strong>
                        <br />Positive
                      </div>
                    </div>
                    <div className="col-4">
                      <div className={`small ${darkMode ? "text-light" : "text-muted"}`}>
                        <strong style={{ color: "rgba(13, 110, 253, 1)" }}>
                          {piechartData?.neutral || 0}
                        </strong>
                        <br />Neutral
                      </div>
                    </div>
                    <div className="col-4">
                      <div className={`small ${darkMode ? "text-light" : "text-muted"}`}>
                        <strong style={{ color: "rgba(220, 53, 69, 1)" }}>
                          {piechartData?.negative || 0}
                        </strong>
                        <br />Negative
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;