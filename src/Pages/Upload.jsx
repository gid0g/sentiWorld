import React, { useState, useRef, useEffect } from "react";
import { CloudArrowUp } from "react-bootstrap-icons";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import Papa from "papaparse";
import Lottie from "lottie-react";
import processingAnimation from "../assets/processing.json"
import api from "../services/api";
import { generatePlotlyData } from "../components/layout/plotlyLayouts";
import Graphs from "../components/Graphs";
const Upload = () => {
  const { darkMode } = useTheme();
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [showVisualizations, setShowVisualizations] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [visualizationJsons, setVisualizationJsons] = useState({});
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  // State for chart data
  const [chartData, setChartData] = useState({
    sentimentDistribution: null,
    topicDistribution: null,
    plotlyData: null,
  });
  // State persistence functions
  const useSessionStorageLoader = () => {
    const storageItems = [
      { key: "analysisResults", setter: setAnalysisResults },
      { key: "chartData", setter: setChartData },
      { key: "visualizationJsons", setter: setVisualizationJsons },
    ];

    useEffect(() => {
      try {
        storageItems.forEach(({ key, setter }) => {
          const data = sessionStorage.getItem(key);
          if (data) setter(JSON.parse(data));
        });

        setShowVisualizations(!!sessionStorage.getItem("showVisualizations"));
      } catch (error) {
        // Clear all on error
        [...storageItems.map(item => item.key), "showVisualizations"]
          .forEach(key => sessionStorage.removeItem(key));
      }
    }, []);
  };
  useSessionStorageLoader();
  useEffect(() => {
    const isChartDataEmpty = Object.values(chartData).every((v) => v === null);
    const isAnalysisResultsEmpty = analysisResults === null;
    const isVisualizationJsonsEmpty = Object.keys(visualizationJsons).length === 0;

    if (isChartDataEmpty && isAnalysisResultsEmpty && isVisualizationJsonsEmpty) {
      setShowVisualizations(false);
    }
  }, [chartData, analysisResults, visualizationJsons]);

  // Save data to sessionStorage whenever it changes
  useEffect(() => {
    try {
      const dataToStore = {
        analysisResults,
        visualizationJsons: visualizationJsons && Object.keys(visualizationJsons).length > 0 ? visualizationJsons : null,
        chartData: (chartData.sentimentDistribution || chartData.topicDistribution || chartData.plotlyData) ? chartData : null,
        showVisualizations: showVisualizations.toString()
      };

      Object.entries(dataToStore).forEach(([key, value]) => {
        if (value != null) {
          sessionStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
      });
    } catch (error) {
      // console.error("Error saving to sessionStorage:", error);
    }
  }, [analysisResults, chartData, showVisualizations]);

  // Add this function to clear visualizations
  const handleClearVisualizations = () => {
    setShowVisualizations(false);
    setAnalysisResults(null);
    setVisualizationJsons({});
    setCsvHeaders([]); // Add this line
    setSelectedColumn(""); // Add this line
    setChartData({
      sentimentDistribution: null,
      topicDistribution: null,
      plotlyData: null,
    });

    try {
      // Clear sessionStorage
      sessionStorage.removeItem("analysisResults");
      sessionStorage.removeItem("chartData");
      sessionStorage.removeItem("showVisualizations");
      sessionStorage.removeItem("visualizationJsons");
    } catch (error) {
      // console.error("Error clearing sessionStorage:", error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    showToast("Visualizations cleared successfully", "success");
  };

  const validateCSVHeaders = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: "greedy",
        complete: (results) => {
          console.log("Total rows in CSV:", results.data.length);

          if (results.errors.length > 0) {
            const error = results.errors[0];
            if (
              error.code === "TooFewFields" ||
              error.code === "TooManyFields"
            ) {
              const row = error.row + 2;
              reject(
                new Error(
                  `Row ${row} has an inconsistent number of columns. ` +
                  "Please ensure all rows have the same number of columns and are properly comma-separated."
                )
              );
              return;
            } else {
              reject(
                new Error(
                  `CSV parsing error: ${error.message} at row ${error.row + 2}`
                )
              );
              return;
            }
          }

          // Store headers for column selection
          setCsvHeaders(results.meta.fields);

          const headers = results.meta.fields.map((h) => h.toLowerCase().trim());
          console.log("CSV headers:", headers);

          const validHeaders = [
            "review",
            "reviews",
            "feedback",
            "text",
            "comment",
            "comments",
          ];

          const reviewColumn = headers.find((header) =>
            validHeaders.includes(header)
          );

          if (!reviewColumn) {
            reject(
              new Error(
                "CSV file must contain exactly one of these column headers: " +
                '"Review", "Reviews", "Feedback", "Text", "Comment", "Comments" ' +
                `(case insensitive). Found columns: ${results.meta.fields.join(", ")}`
              )
            );
            return;
          }

          // Set default selected column - find the original case version
          const defaultColumn = results.meta.fields.find(
            (f) => f.toLowerCase().trim() === reviewColumn
          );
          setSelectedColumn(defaultColumn);

          // Filter out empty reviews for validation
          const validReviews = results.data.filter((row) => {
            const reviewText = row[defaultColumn];
            return reviewText && reviewText.trim().length > 0;
          });

          console.log("Number of valid reviews:", validReviews.length);
          console.log("Review column used:", reviewColumn);

          if (validReviews.length < 100) {
            reject(
              new Error(
                `CSV file contains only ${validReviews.length} valid reviews. ` +
                "A minimum of 100 non-empty reviews is required for accurate analysis. " +
                "Please add more reviews with text content."
              )
            );
            return;
          }

          // Don't check for empty reviews here - just validate we have enough valid ones
          resolve(defaultColumn);
        },
        error: (error) => {
          reject(new Error("Error reading CSV file: " + error.message));
        },
      });
    });
  };

  // UpdateChartData function
  const updateChartData = (data) => {
    if (!data || !data.results) {
      console.error("No results data received:", data);
      return;
    }

    const results = data.results;
    console.log("Processing results data:", results);

    if (results.topic_sentiment) {
      console.log("Processing topic sentiment data:", results.topic_sentiment);

      // Calculate sentiment totals
      const sentimentData = results.topic_sentiment.reduce((acc, item) => {
        acc.positive = (acc.positive || 0) + item.positive_count;
        acc.negative = (acc.negative || 0) + item.negative_count;
        return acc;
      }, {});

      const sentimentChartData = [
        { name: "Positive", value: sentimentData.positive },
        { name: "Negative", value: sentimentData.negative },
      ];

      // Process topic distribution data
      const topicData = results.topic_sentiment.map((item) => ({
        name: item.topic_label,
        positive: item.positive_count,
        negative: item.negative_count,
        total: item.total_documents,
        keywords: item.topic_keywords,
      }));

      // Process visualization JSONs
      const plotJson = results.visualization_jsons;
      setVisualizationJsons(plotJson);
      // Prepare Plotly data with theme-sensitive layouts
      const plotlyData = generatePlotlyData(
        topicData,
        darkMode,
      );
      setChartData({
        sentimentDistribution: sentimentChartData,
        topicDistribution: topicData,
        plotlyData,
      });
    }

    // Add visualization URLs to state
    if (results.visualizations) {
      console.log("Setting visualization URLs:", results.visualizations);
      setAnalysisResults((prev) => ({
        ...prev,
        visualizations: results.visualizations,
      }));
    } else {
      console.error("No visualizations found in results:", results);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    setError("");

    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      const errorMsg = "Please upload a CSV file";
      setError(errorMsg);
      showToast(errorMsg, "error");
      return;
    }

    setIsUploading(true);

    try {
      // Validate CSV headers first and get the review column
      const reviewColumn = await validateCSVHeaders(file);

      // Parse the CSV to filter out empty rows
      const filteredData = await new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: "greedy",
          complete: (results) => {
            const columnToUse = selectedColumn || reviewColumn;
            const originalRowCount = results.data.length;

            // Filter out rows where the selected column is empty
            const filteredRows = results.data.filter((row) => {
              const cellValue = row[columnToUse];
              return cellValue && cellValue.trim().length > 0;
            });

            const droppedRowCount = originalRowCount - filteredRows.length;

            resolve({
              data: filteredRows,
              headers: results.meta.fields,
              droppedRows: droppedRowCount,
              totalRows: originalRowCount
            });
          },
          error: reject
        });
      });

      // Convert filtered data back to CSV
      const csvString = Papa.unparse({
        fields: filteredData.headers,
        data: filteredData.data
      });

      // Create a new File object with filtered data
      const filteredFile = new File([csvString], file.name, { type: 'text/csv' });

      // Create FormData and append the filtered file and column name
      const formData = new FormData();
      formData.append("file", filteredFile);
      formData.append("columnName", selectedColumn || reviewColumn);

      // Send the file to the server using the API service
      const response = await api.post("/analyze/batch", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Rest of the function remains the same...
      const data = response.data;
      console.log("Full response data:", data);

      if (data.results?.visualizations) {
        console.log("Setting visualizations:", data.results.visualizations);
        setAnalysisResults({
          ...data,
          visualizations: data.results.visualizations.map((path) =>
            path.startsWith("/static") ? path : `/static/${path}`
          ),
          // Add dropped rows info to analysis results
          droppedRows: filteredData.droppedRows,
          totalRows: filteredData.totalRows,
          processedRows: filteredData.data.length
        });
      }

      updateChartData(data);
      setShowVisualizations(true);

      // Show success message with dropped rows info
      const successMsg = filteredData.droppedRows > 0
        ? `File analyzed successfully! ${filteredData.droppedRows} empty rows were removed from ${filteredData.totalRows} total rows.`
        : "File analyzed successfully!";
      showToast(successMsg, "success");

    } catch (err) {
      console.error("Error processing file:", err);
      const errorMsg =
        err.response?.data?.detail ||
        "Error processing file. Please try again.";
      setError(errorMsg);
      showToast(errorMsg, "error");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };
  // Add this useEffect for theme changes
  useEffect(() => {
    if (chartData.plotlyData) {
      // console.log('Theme changed, updating chart backgrounds');

      // Update only the chart layouts with new theme colors, without re-processing data
      const updatedPlotlyData = {};

      Object.keys(chartData.plotlyData).forEach((chartKey) => {
        const chart = chartData.plotlyData[chartKey];
        updatedPlotlyData[chartKey] = {
          ...chart,
          layout: {
            ...chart.layout,
            paper_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
            plot_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
            font: {
              color: darkMode ? "#e2e8f0" : "#1a202c",
            },
          },
        };
      });

      setChartData((prevData) => ({
        ...prevData,
        plotlyData: updatedPlotlyData,
      }));
    }
  }, [darkMode]);

  useEffect(() => {
    console.log("chartData:", chartData)
    console.log("visualizationJsons:", visualizationJsons)
    console.log("analysisResults:", chartData)
  }, [chartData, visualizationJsons, analysisResults])
  return (
    <div
      className={`min-vh-100 ${darkMode ? "bg-dark text-light" : "bg-light text-dark"
        }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".csv"
        style={{ display: "none" }}
      />
      {!showVisualizations ? (
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          style={{ minHeight: "60vh" }}
        >
          {csvHeaders.length > 0 && !isUploading && (
            <div className="mb-4">
              <label className="form-label">Select Column to Analyze:</label>
              <select
                className="form-select"
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
              >
                {csvHeaders.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div
            className={`d-flex align-items-center justify-content-center mb-4 ${isUploading ? "" : "rounded-circle"
              }`}
            style={{
              width: "150px",
              height: "150px",
              backgroundColor: isUploading
                ? "transparent"
                : darkMode
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.1)",
              cursor: isUploading ? "default" : "pointer",
              position: "relative",
              overflow: "hidden",
            }}
            onClick={!isUploading ? handleUpload : undefined}
          >
            {isUploading ? (
              <Lottie
                animationData={processingAnimation}
                style={{
                  width: "120px",
                  height: "120px",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  filter: darkMode ? "brightness(1.5)" : "none",
                }}
                loop
                autoplay
              />
            ) : (
              <CloudArrowUp size={48} className="text-sentiWorld" />
            )}
          </div>



          <h4 className="mb-3">
            {isUploading ? "Processing..." : "Upload File"}
          </h4>
          <p className={`text-${darkMode ? "light" : "secondary"}`}>
            {isUploading
              ? "Analyzing your data..."
              : "Click to upload your CSV file for analysis"}
          </p>
          {error && (
            <div className="alert alert-danger mt-3" role="alert">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="analysis-results py-5">
          <div className="container-fluid px-4">
            <div className="row mb-3">
              <div className="col-12 d-flex justify-content-between align-items-center">
                <h2
                  className={`fw-bold ${darkMode ? "text-light" : "text-dark"}`}
                >
                  Analysis Results
                </h2>
                <button
                  className="btn btn-outline-info"
                  onClick={handleClearVisualizations}
                >
                  <i className="bi bi-trash me-2"></i>
                  New Visualization
                </button>
              </div>
              {analysisResults?.droppedRows > 0 && (
                <div className="col-12 my-3">
                  <div className={`alert ${darkMode ? 'alert-dark' : 'alert-info'}`}>
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Data Processing:</strong> {analysisResults.droppedRows} empty rows were removed from {analysisResults.totalRows} total rows.
                    {analysisResults.processedRows} rows were processed for analysis.
                  </div>
                </div>
              )}
              <div className="col-12">
                <p className={`text-${darkMode ? "light" : "secondary"}`}>
                  Overview of sentiment analysis and topic modeling
                </p>
              </div>
            </div>
            <Graphs
              chartData={chartData}
              visualizationJsons={visualizationJsons}
              visualizationFiles={analysisResults?.visualizations}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
