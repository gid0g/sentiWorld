import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Plotly from 'plotly.js-dist-min';
import { useTheme } from '../context/ThemeContext';

import {getFallbackLayout} from '../components/layout/plotlyLayouts'
import { generatePlotlyData } from '../components/layout/plotlyLayouts';
import Graphs from '../components/Graphs';
const Visualize = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { darkMode } = useTheme();

    // Get data from location state
    const visualizationFiles = location.state?.visualizationFiles || [];
    const visualizationJsons = location.state?.visualizationJsons || {};
    const recordId = location.state?.recordId || null;
    const filename = location.state?.filename || 'Unnamed Dataset';
    const topicSentiment = location.state?.topicSentiment || null;
    // console.log("Visualizations:::::", "files", visualizationFiles, "Sentiment", topicSentiment, "Jsons", visualizationJsons)
    // State variables
    const [chartData, setChartData] = useState({
        sentimentDistribution: null,
        topicDistribution: null,
        plotlyData: null
    });

    const plotRef = useRef(null);
    const [plotJson, setPlotJson] = useState(null);

    // Go back function
    const handleGoBack = () => {
        navigate(-1);
    };

    // Update visualization data effect
    useEffect(() => {
        if (visualizationJsons) {
            // Set the main plot data
            if (visualizationJsons.topic_sentiment_map) {
                setPlotJson(visualizationJsons.topic_sentiment_map);
            }
            processVisualizationJsonData();
        }
    }, [visualizationJsons]);
    const processVisualizationJsonData = useCallback(() => {
        if (!visualizationJsons) return;

        let processedData = {
            sentimentDistribution: null,
            topicDistribution: null,
            plotlyData: {}
        };

        if (topicSentiment) {
            console.log('Processing topic sentiment data:', topicSentiment);

            // Calculate sentiment totals
            const sentimentData = topicSentiment.reduce((acc, item) => {
                acc.positive = (acc.positive || 0) + item.positive_count;
                acc.negative = (acc.negative || 0) + item.negative_count;
                return acc;
            }, {});

            const sentimentChartData = [
                { name: 'Positive', value: sentimentData.positive },
                { name: 'Negative', value: sentimentData.negative }
            ];

            // Process topic distribution data
            const topicData = topicSentiment.map(item => ({
                name: item.topic_label,
                positive: item.positive_count,
                negative: item.negative_count,
                total: item.total_documents,
                keywords: item.topic_keywords
            }));

            // Use the imported layout functions
            const plotlyData = generatePlotlyData(
                topicData,
                darkMode,
            );
            processedData.sentimentDistribution = sentimentChartData;
            processedData.topicDistribution = topicData;
            processedData.plotlyData = plotlyData;
        }

        setChartData(processedData);
    }, [visualizationJsons, darkMode]);


    // Plot rendering effects
    useEffect(() => {
        if (plotRef.current && plotJson?.data) {
            Plotly.newPlot(
                plotRef.current,
                plotJson.data,
                getFallbackLayout('', darkMode),
                { responsive: true }
            );
        }
    }, [plotJson, darkMode]);



    // Update chart colors when theme changes
    useEffect(() => {
        if (chartData.plotlyData) {
            const currentColors = {
                paper: chartData.plotlyData.topicSentiment?.layout?.paper_bgcolor,
                plot: chartData.plotlyData.topicSentiment?.layout?.plot_bgcolor,
                font: chartData.plotlyData.topicSentiment?.layout?.font?.color
            };

            const newColors = {
                paper: darkMode ? '#1a1a1a' : '#ffffff',
                plot: darkMode ? '#1a1a1a' : '#ffffff',
                font: darkMode ? '#e2e8f0' : '#1a202c'
            };

            if (currentColors.paper !== newColors.paper ||
                currentColors.plot !== newColors.plot ||
                currentColors.font !== newColors.font) {

                const updatedPlotlyData = {};
                Object.keys(chartData.plotlyData).forEach(chartKey => {
                    const chart = chartData.plotlyData[chartKey];
                    updatedPlotlyData[chartKey] = {
                        ...chart,
                        layout: {
                            ...chart.layout,
                            paper_bgcolor: newColors.paper,
                            plot_bgcolor: newColors.plot,
                            font: {
                                ...chart.layout.font,
                                color: newColors.font
                            }
                        }
                    };
                });

                setChartData(prevData => ({
                    ...prevData,
                    plotlyData: updatedPlotlyData
                }));
            }
        }
    }, [darkMode, chartData.plotlyData]);



    return (
        <div className={`min-vh-100 ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
            <div className="analysis-results py-5">
                <div className="container-fluid px-4">
                    <div className="row mb-3">
                        <div className="col-12 d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <button
                                    className={`btn btn-sm ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'} me-3`}
                                    onClick={handleGoBack}
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <h2 className={`fw-bold ${darkMode ? "text-light" : "text-dark"} mb-0`}>
                                    {filename}
                                </h2>
                            </div>
                            <p className={`fw-semibold ${darkMode ? "text-light" : "text-dark"} mb-0`}>
                                Record ID:{recordId}
                            </p>
                        </div>
                        <div className="col-12">
                            <p className={`text-${darkMode ? "light" : "secondary"} mt-2`}>
                                Sentiment analysis and topic modeling results
                            </p>
                        </div>
                    </div>
                    <Graphs chartData={chartData} visualizationJsons={visualizationJsons} visualizationFiles={visualizationFiles} />
                </div>
            </div>


        </div>
    );
};

export default Visualize;