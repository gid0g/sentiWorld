import React, { useRef, useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { useTheme } from '../context/ThemeContext';
import {
    BarChart, Bar, PieChart, Pie, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Cell
} from 'recharts';
import {
    getSunburstHierarchyLayout,
    getTopicSentimentLayout,
    COLORS
} from '../components/layout/plotlyLayouts'
import { Modal } from 'react-bootstrap';

const Graphs = ({ chartData, visualizationJsons, visualizationFiles }) => {
    const [showChartModal, setShowChartModal] = useState(false);
    const [selectedChart, setSelectedChart] = useState(null);
    const [chartModalTitle, setChartModalTitle] = useState('');
    const [zoom, setZoom] = useState(100);
    const { darkMode } = useTheme();
    const plotRef = useRef(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedVisualization, setSelectedVisualization] = useState(null);
    const [modalTitle, setModalTitle] = useState('');
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={`custom-tooltip p-3 ${darkMode ? 'bg-dark' : 'bg-light'} border`}>
                    <p className="label mb-2">{`${label || 'Sentiment'}`}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="mb-1" style={{ color: entry.color }}>
                            {`${entry.name || entry.dataKey}: ${entry.value}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };
    const handleOpenChartModal = (chartData, layout, title) => {
        setSelectedChart({ data: chartData, layout: layout });
        setChartModalTitle(title);
        setShowChartModal(true);
    };
    // Zoom functions
    useEffect(() => {
        if (plotRef.current && visualizationJsons?.topic_sentiment_map?.data) {
            const fallbackLayout = {
                title: {
                    text: "",
                    font: {
                        size: 24,
                        color: darkMode ? "#e2e8f0" : "#1a202c",
                        family: "Arial, sans-serif",
                    },
                    x: 0.5,
                    xanchor: "center",
                },
                paper_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
                plot_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
                font: {
                    color: darkMode ? "#e2e8f0" : "#1a202c",
                    size: 14,
                    family: "Inter, sans-serif",
                },
                hovermode: "closest",
                autosize: true,
                margin: {
                    l: 60,
                    r: 40,
                    b: 80,
                    t: 80,
                },
                legend: {
                    orientation: "h",
                    x: 0.5,
                    xanchor: "center",
                    y: -0.2,
                    font: {
                        size: 13,
                        color: darkMode ? "#cbd5e1" : "#1a202c",
                    },
                },
                dragmode: "pan",
                modebar: {
                    orientation: "v",
                },
                updatemenus: [
                    {
                        type: "buttons",
                        showactive: false,
                        x: 1.05,
                        y: 1.2,
                        buttons: [
                            {
                                label: "Zoom",
                                method: "relayout",
                                args: [{ dragmode: "zoom" }],
                            },
                            {
                                label: "Pan",
                                method: "relayout",
                                args: [{ dragmode: "pan" }],
                            },
                            {
                                label: "Reset View",
                                method: "relayout",
                                args: ["reset"],
                            },
                        ],
                    },
                ],
                annotations: [
                    {
                        text: "🛈 Hover over topics for sentiment breakdown",
                        align: "left",
                        showarrow: false,
                        x: 0,
                        y: -0.3,
                        xref: "paper",
                        yref: "paper",
                        font: {
                            size: 12,
                            color: darkMode ? "#94a3b8" : "#475569",
                        },
                    },
                ],
            };
            Plotly.newPlot(plotRef.current, visualizationJsons?.topic_sentiment_map.data, fallbackLayout, {
                responsive: true,
            });
        }
    }, [plotRef.current, visualizationJsons?.topic_sentiment_map, darkMode]);
    const fixSunburstData = (sunburstData) => {
        if (!sunburstData || !sunburstData.data || !sunburstData.data[0]) {
            return sunburstData;
        }

        const originalData = sunburstData.data[0];
        const labels = [...originalData.labels];
        const parents = [...originalData.parents];
        const values = [...originalData.values];
        const colors = [...originalData.marker.colors];

        // Create a map to track unique root-level items
        const rootItems = new Map();
        const newLabels = [];
        const newParents = [];
        const newValues = [];
        const newColors = [];

        // First pass: collect and deduplicate root items
        labels.forEach((label, index) => {
            if (parents[index] === "") {
                const key = label.toLowerCase().trim(); // Normalize the key
                if (!rootItems.has(key)) {
                    rootItems.set(key, {
                        label: label,
                        index: newLabels.length,
                        value: values[index],
                        color: colors[index],
                        children: new Set() // Track children for this root
                    });
                    newLabels.push(label);
                    newParents.push("");
                    newValues.push(values[index]);
                    newColors.push(colors[index]);
                } else {
                    // Add values for duplicate root items
                    const existing = rootItems.get(key);
                    newValues[existing.index] += values[index];
                }
            }
        });

        // Second pass: add child items with proper parent references
        labels.forEach((label, index) => {
            if (parents[index] !== "") {
                const parentKey = parents[index].toLowerCase().trim();
                const parentItem = rootItems.get(parentKey);

                if (parentItem) {
                    // Check if this child is already added for this parent
                    const childKey = `${parentKey}_${label.toLowerCase().trim()}`;
                    if (!parentItem.children.has(childKey)) {
                        parentItem.children.add(childKey);
                        newLabels.push(label);
                        newParents.push(parentItem.label);
                        newValues.push(values[index]);
                        newColors.push(colors[index]);
                    } else {
                        // If child exists, add to its value
                        const childIndex = newLabels.indexOf(label);
                        if (childIndex !== -1) {
                            newValues[childIndex] += values[index];
                        }
                    }
                }
            }
        });

        // Ensure we have at least one root item
        if (newLabels.length === 0) {
            return sunburstData;
        }

        // Create the new data structure
        return {
            ...sunburstData,
            data: [{
                ...originalData,
                labels: newLabels,
                parents: newParents,
                values: newValues,
                marker: {
                    ...originalData.marker,
                    colors: newColors
                }
            }]
        };
    };

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 20, 200));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 20, 40));
    };
    // Open visualization modal
    const handleOpenVisualizationModal = (vizPath) => {
        setSelectedVisualization(vizPath);
        setModalTitle(vizPath.includes('positive') ? 'Positive Sentiment Word Cloud' : 'Negative Sentiment Word Cloud');
        setShowImageModal(true);
    };

    return (
        <div>
            <div className="row g-4 mb-5">
                {chartData.sentimentDistribution && (
                    <div className="col-12 col-xl-6">
                        <div className={`card border-0 shadow-sm h-100 ${darkMode ? 'bg-dark' : 'bg-white'}`}>
                            <div className="card-body">
                                <h5 className={`card-title mb-4 ${darkMode ? "text-light" : "text-dark"}`}>Overall Sentiment Distribution</h5>
                                <div style={{ height: '400px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData.sentimentDistribution}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent, value }) => `${name || 'Unknown'} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={150}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {chartData.sentimentDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {chartData.topicDistribution && (
                    <div className="col-12 col-xl-6">
                        <div className={`card border-0 shadow-sm h-100 ${darkMode ? 'bg-dark' : 'bg-white'}`}>
                            <div className="card-body">
                                <h5 className={`card-title mb-4 ${darkMode ? "text-light" : "text-dark"}`}>Topic Distribution</h5>
                                <div style={{ height: '450px' }}> {/* Increased height */}
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={chartData.topicDistribution}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="name"
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                                interval={0}
                                                fontSize={11}
                                            />
                                            <YAxis />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Bar dataKey="positive" stackId="a" fill="#00C49F" name="Positive" />
                                            <Bar dataKey="negative" stackId="a" fill="#FF8042" name="Negative" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Plotly Dashboard Section */}
            {chartData.plotlyData && (
                <div className="row g-4 mb-5">
                    <div className="col-12">
                        <h3 className={`fw-bold ${darkMode ? "text-light" : "text-dark"} mb-4`}>
                            Interactive Dashboard
                        </h3>
                    </div>

                    {/* Topic-Sentiment Analysis */}
                    {chartData.plotlyData?.topicSentiment && (
                        <div className="col-12">
                            <div
                                style={{ cursor: 'pointer', width: '100%', height: '100%' }}
                                onClick={() => handleOpenChartModal(
                                    chartData.plotlyData.topicSentiment.data,
                                    {
                                        ...chartData.plotlyData.topicSentiment.layout,
                                        paper_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
                                        plot_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
                                        font: {
                                            ...chartData.plotlyData.topicSentiment.layout?.font,
                                            color: darkMode ? "#e2e8f0" : "#1a202c"
                                        }
                                    },
                                    "Topic-Sentiment Analysis"
                                )}
                            >
                                <div className={`card border-0 shadow-sm ${darkMode ? 'bg-dark' : 'bg-white'}`}>
                                    <h5 className={`card-title m-4 ${darkMode ? 'text-light' : 'text-dark'}`}>Topic-Sentiment Analysis</h5>
                                    <div className="card-body d-flex justify-content-center">
                                        <div className="d-flex justify-content-center" style={{ width: '100%', height: '600px' }}>
                                            <Plot
                                                data={chartData.plotlyData.topicSentiment.data}
                                                layout={{
                                                    ...chartData.plotlyData.topicSentiment.layout,
                                                    paper_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
                                                    plot_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
                                                    font: {
                                                        ...chartData.plotlyData.topicSentiment.layout?.font,
                                                        color: darkMode ? "#e2e8f0" : "#1a202c"
                                                    },
                                                    autosize: true,
                                                    width: undefined,
                                                    height: undefined
                                                }}
                                                config={{ responsive: true, displayModeBar: true }}
                                                className="w-100"
                                                useResizeHandler={true}
                                                style={{ width: '100%', height: '100%' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* Topic Distribution Analysis */}
                    {chartData.plotlyData?.topicTrends?.data && (
                        <div className="col-12">
                            <div
                                style={{ cursor: 'pointer', width: '100%', height: '100%' }}
                                onClick={() => handleOpenChartModal(
                                    chartData.plotlyData.topicTrends.data,
                                    {
                                        ...chartData.plotlyData.topicTrends.layout,
                                        paper_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
                                        plot_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
                                        font: {
                                            ...chartData.plotlyData.topicSentiment.layout?.font,
                                            color: darkMode ? "#e2e8f0" : "#1a202c"
                                        }
                                    },
                                    "Topic Distribution Analysis"
                                )}
                            >
                                <div className={`card border-0 shadow-sm ${darkMode ? 'bg-dark' : 'bg-white'}`}>
                                    <h5 className={`card-title m-4 ${darkMode ? "text-light" : "text-dark"}`}>Topic Distribution Analysis</h5>
                                    <div className="card-body d-flex justify-content-center">
                                        <div className="d-flex justify-content-center">
                                            <Plot
                                                data={chartData.plotlyData.topicTrends.data}
                                                layout={chartData.plotlyData.topicTrends.layout}
                                                config={{ responsive: true, displayModeBar: true }}
                                                className="w-100"
                                                useResizeHandler={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                    }
                    {/* Topic Distribution Pie Chart */}
                    {chartData.plotlyData?.topicPie?.data && (
                        <div className="col-12 col-xl-6">
                            <div className={`card border-0 shadow-sm h-100 ${darkMode ? 'bg-dark' : 'bg-white'}`}>
                                <div
                                    style={{ cursor: 'pointer', width: '100%', height: '100%' }}
                                    onClick={() => handleOpenChartModal(
                                        chartData.plotlyData.topicPie.data,
                                        {
                                            ...chartData.plotlyData.topicPie.layout,
                                            paper_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
                                            plot_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
                                            font: {
                                                ...chartData.plotlyData.topicPie.layout?.font,
                                                color: darkMode ? "#e2e8f0" : "#1a202c"
                                            }
                                        },
                                        "Topic Distribution Pie Chart"
                                    )}
                                >
                                    <h5 className={`card-title m-4 ${darkMode ? "text-light" : "text-dark"}`}>Topic Distribution Pie Chart</h5>
                                    <div className="card-body d-flex justify-content-center">
                                        <div className="d-flex justify-content-center" style={{ width: '100%', height: '600px' }}>
                                            <Plot
                                                data={chartData.plotlyData.topicPie.data}
                                                layout={{
                                                    ...chartData.plotlyData.topicPie.layout,
                                                    paper_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
                                                    plot_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
                                                    font: {
                                                        ...chartData.plotlyData.topicPie?.layout?.font,
                                                        color: darkMode ? "#e2e8f0" : "#1a202c"
                                                    },
                                                    margin: {
                                                        l: 1,
                                                        r: 40,
                                                        b: 40,
                                                        t: 80,
                                                    },
                                                    autosize: true,
                                                    width: undefined,
                                                    height: undefined
                                                }}
                                                config={{ responsive: true, displayModeBar: true }}
                                                className="w-100"
                                                useResizeHandler={true}
                                                style={{ width: '100%', height: '100%' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Topic-Rating Heatmap */}
                    {chartData.plotlyData?.topicHeatmap?.data && (
                        <div className="col-12 col-xl-6">
                            <div className={`card border-0 shadow-sm h-100 ${darkMode ? 'bg-dark' : 'bg-white'}`}>
                                <div
                                    style={{ cursor: 'pointer', width: '100%', height: '100%' }}
                                    onClick={() => handleOpenChartModal(
                                        chartData.plotlyData.topicHeatmap.data,
                                        {
                                            ...chartData.plotlyData.topicHeatmap.layout,
                                            paper_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
                                            plot_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
                                            font: {
                                                ...chartData.plotlyData.topicHeatmap.layout?.font,
                                                color: darkMode ? "#e2e8f0" : "#1a202c"
                                            }
                                        },
                                        "Topic-Rating Heatmap"
                                    )}
                                >
                                    <h5 className={`card-title m-4 ${darkMode ? "text-light" : "text-dark"}`}>Topic-Rating Heatmap</h5>
                                    <div className="card-body d-flex justify-content-center">
                                        <div className="d-flex justify-content-center" style={{ width: '100%', height: '600px' }}>
                                            <Plot
                                                data={chartData.plotlyData.topicHeatmap.data}
                                                layout={{
                                                    ...chartData.plotlyData.topicHeatmap.layout,
                                                    paper_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
                                                    plot_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
                                                    font: {
                                                        ...chartData.plotlyData.topicHeatmap.layout?.font,
                                                        color: darkMode ? "#e2e8f0" : "#1a202c"
                                                    },
                                                    margin: {
                                                        l: 150,
                                                        r: 40,
                                                        b: 40,
                                                        t: 80,
                                                    },
                                                    autosize: true,
                                                    width: undefined,
                                                    height: undefined
                                                }}
                                                config={{ responsive: true, displayModeBar: true }}
                                                className="w-100"
                                                useResizeHandler={true}
                                                style={{ width: '100%', height: '100%' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stacked Sentiment by Topic */}
                    {chartData.plotlyData?.stackedSentiment?.data && (
                        <div className="col-12">
                            <div
                                style={{ cursor: 'pointer', width: '100%', height: '100%' }}
                                onClick={() => handleOpenChartModal(
                                    chartData.plotlyData.stackedSentiment.data,
                                    {
                                        ...chartData.plotlyData.stackedSentiment.layout,
                                        paper_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
                                        plot_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
                                        font: {
                                            ...chartData.plotlyData.stackedSentiment.layout?.font,
                                            color: darkMode ? "#e2e8f0" : "#1a202c"
                                        }
                                    },
                                    "Stacked Sentiment by Topic"
                                )}
                            >
                                <div className={`card border-0 shadow-sm ${darkMode ? 'bg-dark' : 'bg-white'}`}>
                                    <h5 className={`card-title m-4 ${darkMode ? "text-light" : "text-dark"}`}>Stacked Sentiment by Topic</h5>
                                    <div className="card-body d-flex justify-content-center">
                                        <div className="d-flex justify-content-center" style={{ width: '100%', height: '700px' }}> {/* Increased height */}
                                            <Plot
                                                data={chartData.plotlyData.stackedSentiment.data}
                                                layout={{
                                                    ...chartData.plotlyData.stackedSentiment.layout,
                                                    paper_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
                                                    plot_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
                                                    font: {
                                                        ...chartData.plotlyData.stackedSentiment.layout?.font,
                                                        color: darkMode ? "#e2e8f0" : "#1a202c"
                                                    },
                                                    margin: {
                                                        l: 80,
                                                        r: 40,
                                                        b: 180,
                                                        t: 80,
                                                    },
                                                    autosize: true,
                                                    width: undefined,
                                                    height: undefined
                                                }}
                                                config={{ responsive: true, displayModeBar: true }}
                                                className="w-100"
                                                useResizeHandler={true}
                                                style={{ width: '100%', height: '100%' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Interactive Visualizations Section */}
            {Object.keys(visualizationJsons).length > 0 && (
                <div className="row g-4">
                    <div className="col-12">
                        <h3 className={`fw-bold ${darkMode ? "text-light" : "text-dark"} mb-4`}>
                            Detailed Analysis
                        </h3>
                    </div>

                    {/* Topic Sentiment Map */}
                    <div className="col-12 mb-5">
                        <div className={`card border-0 shadow-sm ${darkMode ? 'bg-dark' : 'bg-white'}`}>
                            <div className="card-body">
                                <h5 className={`card-title mb-4 ${darkMode ? "text-light" : "text-dark"}`}>
                                    Topic Sentiment Map (Interactive)
                                </h5>
                                <div ref={plotRef} style={{ width: '100%', height: '600px' }} />
                            </div>
                        </div>
                    </div>
                    <div className="col-12">
                        <h3 className={`fw-bold ${darkMode ? "text-light" : "text-dark"} mb-4`}>
                            Additional Analysis
                        </h3>
                    </div>
                    <div className="row g-4">
                        {/* Sunburst Chart */}
                        {visualizationJsons?.sunburst && (
                            <div className="col-12 col-xl-6 d-flex">
                                <div className={`card border-0 shadow-sm w-100 ${darkMode ? 'bg-dark' : 'bg-white'}`} style={{ minHeight: '600px' }}>
                                    <div
                                        className="card-body d-flex flex-column"
                                        onClick={() =>
                                            handleOpenChartModal(
                                                visualizationJsons.sunburst.data,
                                                {
                                                    ...visualizationJsons.sunburst.layout,
                                                    paper_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
                                                    plot_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
                                                    font: {
                                                        ...visualizationJsons.sunburst.layout?.font,
                                                        color: darkMode ? "#e2e8f0" : "#1a202c",
                                                    },
                                                },
                                                "Topic Hierarchy Overview"
                                            )
                                        }
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <h5 className={`card-title mb-4 ${darkMode ? "text-light" : "text-dark"}`}>
                                            Topic Hierarchy Overview
                                        </h5>
                                        <div className="flex-grow-1">
                                            <Plot
                                                data={visualizationJsons.sunburst.data}
                                                layout={{
                                                    ...getSunburstHierarchyLayout(darkMode, visualizationJsons.sunburst.layout),
                                                    autosize: true,
                                                }}
                                                config={{ responsive: true, displayModeBar: true }}
                                                useResizeHandler={true}
                                                className="w-100 h-100"
                                                style={{ height: '100%' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Topic Sentiment Visualization */}
                        {visualizationJsons?.topic_sentiment_viz && (
                            <div className="col-12 col-xl-6 d-flex">
                                <div className={`card border-0 shadow-sm w-100 ${darkMode ? 'bg-dark' : 'bg-white'}`} style={{ minHeight: '600px' }}>
                                    <div
                                        className="card-body d-flex flex-column"
                                        onClick={() =>
                                            handleOpenChartModal(
                                                visualizationJsons.topic_sentiment_viz.data,
                                                {
                                                    ...visualizationJsons.topic_sentiment_viz.layout,
                                                    paper_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
                                                    plot_bgcolor: darkMode ? "#1a1a1a" : "#ffffff",
                                                    font: {
                                                        ...visualizationJsons.topic_sentiment_viz.layout?.font,
                                                        color: darkMode ? "#e2e8f0" : "#1a202c",
                                                    },
                                                },
                                                "Topic Sentiment Breakdown"
                                            )
                                        }
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <h5 className={`card-title mb-4 ${darkMode ? "text-light" : "text-dark"}`}>
                                            Topic Sentiment Breakdown
                                        </h5>
                                        <div className="flex-grow-1">
                                            <Plot
                                                data={visualizationJsons.topic_sentiment_viz.data}
                                                layout={{
                                                    ...getTopicSentimentLayout(darkMode, visualizationJsons.topic_sentiment_viz.layout),
                                                    margin: { l: 120, r: 40, b: 80, t: 80 },
                                                    autosize: true,
                                                }}
                                                config={{ responsive: true, displayModeBar: true }}
                                                useResizeHandler={true}
                                                className="w-100 h-100"
                                                style={{ height: '100%' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>


                    {/* Word Clouds Section */}
                    <div className="col-12">
                        <h3 className={`fw-bold ${darkMode ? "text-light" : "text-dark"} mb-4`}>
                            Keyword Analysis
                        </h3>
                    </div>

                    {/* Word Clouds */}
                    {visualizationFiles
                        ?.filter(viz => viz.includes('wordcloud'))
                        ?.map((vizPath, index) => (
                            <div key={index} className="col-12 col-xl-6 my-2">
                                <div
                                    className={`card border-0 shadow-sm ${darkMode ? 'bg-dark' : 'bg-white'} cursor-pointer`}
                                    style={{
                                        transform: 'scale(1)',
                                        transition: 'transform 0.3s ease-in-out',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleOpenVisualizationModal(vizPath)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.02)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >
                                    <div className="card-body">
                                        <h5 className={`card-title mb-4 ${darkMode ? 'text-light' : 'text-dark'}`}>
                                            {vizPath.includes('positive') ? 'Positive Keywords' : 'Negative Keywords'}
                                        </h5>
                                        <div className="text-center">
                                            <img
                                                src={`http://localhost:8000${vizPath}`}
                                                alt={vizPath.includes('positive') ? 'Positive Keywords' : 'Negative Keywords'}
                                                style={{
                                                    maxWidth: '100%',
                                                    height: 'auto',
                                                    maxHeight: '400px',
                                                    objectFit: 'contain',
                                                    opacity: 1,
                                                    transition: 'opacity 0.5s ease-in-out'
                                                }}
                                                onLoad={(e) => {
                                                    e.target.style.opacity = '1';
                                                }}
                                                loading="lazy"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            <Modal
                show={showImageModal}
                onHide={() => {
                    setShowImageModal(false);
                    setZoom(100);
                }}
                size="xl"
                centered
                className={darkMode ? 'dark-mode' : ''}
            >
                <Modal.Header closeButton className={darkMode ? 'bg-dark text-light' : ''}>
                    <Modal.Title className={`fw-bold ${darkMode ? "text-light" : "text-dark"} mb-1`}>{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body className={`text-center ${darkMode ? 'bg-dark text-light' : ''}`}>
                    <div className="mb-3">
                        <button className="btn btn-primary me-2" onClick={handleZoomIn}>Zoom In (+)</button>
                        <button className="btn btn-primary" onClick={handleZoomOut}>Zoom Out (-)</button>
                        <span className="ms-3">Zoom: {zoom}%</span>
                    </div>
                    <div style={{ overflow: 'auto', maxHeight: '70vh' }}>
                        {selectedVisualization && (
                            <img
                                src={`http://localhost:8000${selectedVisualization}`}
                                alt="Visualization"
                                style={{
                                    width: `${zoom}%`,
                                    height: 'auto',
                                    transition: 'transform 0.3s ease'
                                }}
                            />
                        )}
                    </div>
                </Modal.Body>
            </Modal>
            <Modal
                show={showChartModal}
                onHide={() => {
                    setShowChartModal(false);
                    setZoom(100);
                }}
                size="xl"
                dialogClassName="modal-90w"
                centered
                className={darkMode ? 'dark-mode' : ''}
            >
                <Modal.Header closeButton className={darkMode ? 'bg-dark text-light' : ''}>
                    <Modal.Title className={`fw-bold ${darkMode ? "text-light" : "text-dark"} mb-1`}>
                        {chartModalTitle}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={`d-flex justify-content-center align-items-center ${darkMode ? 'bg-darker text-light' : ''}`} style={{ padding: '20px' }}>
                    <div className="w-100">
                        <div className="mb-3 text-center">
                            <button className="btn btn-primary me-2" onClick={handleZoomIn}>Zoom In (+)</button>
                            <button className="btn btn-primary" onClick={handleZoomOut}>Zoom Out (-)</button>
                            <span className="ms-3">Zoom: {zoom}%</span>
                        </div>
                        <div style={{ overflow: 'auto', maxHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {selectedChart && (
                                <div style={{
                                    transform: `scale(${zoom / 100})`,
                                    transformOrigin: 'center center',
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center'
                                }}>
                                    <Plot
                                        data={selectedChart.data}
                                        layout={{
                                            ...selectedChart.layout,
                                            autosize: true,
                                            width: 1200,
                                            height: 800,
                                            margin: {
                                                l: 300,
                                                r: 100,
                                                b: 170,
                                                t: 100,
                                            }
                                        }}
                                        config={{ responsive: true, displayModeBar: true }}
                                        style={{ width: '100%', height: 'auto' }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Graphs;
