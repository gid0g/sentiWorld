// plotlyLayouts.js - Reusable Plotly Layout Configurations

const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8',
    '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#a4de6c'
];

/**
 * Base layout function with theme-sensitive configurations
 * @param {string} title - Chart title
 * @param {number} height - Chart height
 * @param {boolean} darkMode - Theme mode
 * @param {object} additionalProps - Additional layout properties
 * @returns {object} Plotly layout configuration
 */
export const getBaseLayout = (title = '', height = 600, darkMode = false, additionalProps = {}) => ({
    title: {
        text: title,
        font: {
            size: 28,
            color: darkMode ? '#ffffff' : '#1a202c',
            family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            weight: 'bold'
        },
        x: 0.5,
        xanchor: 'center',
        y: 0.95,
        yanchor: 'top'
    },
    width: '100%',
    height: height,
    paper_bgcolor: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(248, 250, 252, 0.98)',
    plot_bgcolor: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
    font: {
        color: darkMode ? '#e2e8f0' : '#334155',
        size: 14,
        family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    },
    margin: {
        l: 80,
        r: 80,
        b: 100,
        t: 100,
        ...additionalProps?.margin
    },
    transition: {
        duration: 800,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    hoverlabel: {
        bgcolor: darkMode ? 'rgba(51, 65, 85, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        bordercolor: darkMode ? '#64748b' : '#cbd5e1',
        font: {
            color: darkMode ? '#f1f5f9' : '#0f172a',
            size: 13,
            family: 'Inter, sans-serif'
        },
        namelength: -1
    },
    ...additionalProps
});

/**
 * Sunburst chart layout
 * @param {boolean} darkMode - Theme mode
 * @returns {object} Sunburst layout configuration
 */
export const getSunburstLayout = (darkMode = false) => 
    getBaseLayout('', 700, darkMode, {
        sunburstcolorway: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        grid: { rows: 1, columns: 1 }
    });

/**
 * Treemap chart layout
 * @param {boolean} darkMode - Theme mode
 * @returns {object} Treemap layout configuration
 */
export const getTreemapLayout = (darkMode = false) => 
    getBaseLayout('', 600, darkMode, {
        treemapcolorway: COLORS,
        margin: { l: 20, r: 20, b: 20, t: 80 }
    });

/**
 * Pie chart layout with annotations
 * @param {boolean} darkMode - Theme mode
 * @param {number} topicCount - Number of topics for center annotation
 * @returns {object} Pie chart layout configuration
 */
export const getPieChartLayout = (darkMode = false, topicCount = 0) => 
    getBaseLayout('', 500, darkMode, {
        showlegend: true,
        legend: {
            orientation: 'v',
            x: 1.02,
            y: 0.5,
            bgcolor: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(248, 250, 252, 0.8)',
            bordercolor: darkMode ? '#475569' : '#cbd5e1',
            borderwidth: 1,
            font: {
                size: 12,
                color: darkMode ? '#e2e8f0' : '#334155'
            }
        },
        annotations: [{
            text: `${topicCount}<br>Topics`,
            x: 0.5,
            y: 0.5,
            font: {
                size: 20,
                color: darkMode ? '#f1f5f9' : '#1e293b',
                family: 'Inter, sans-serif',
                weight: 'bold'
            },
            showarrow: false
        }]
    });

/**
 * Heatmap chart layout
 * @param {boolean} darkMode - Theme mode
 * @returns {object} Heatmap layout configuration
 */
export const getHeatmapLayout = (darkMode = false) => {
    const baseLayout = getBaseLayout('', 500, darkMode, {
        margin: { l: 150, r: 80, b: 80, t: 100 }
    });

    return {
        ...baseLayout,
        xaxis: {
            title: {
                text: 'Sentiment Type',
                font: {
                    size: 16,
                    color: darkMode ? '#e2e8f0' : '#334155',
                    family: 'Inter, sans-serif',
                    weight: 'bold'
                }
            },
            tickfont: {
                size: 14,
                color: darkMode ? '#cbd5e1' : '#475569'
            },
            gridcolor: darkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(203, 213, 225, 0.3)',
            linecolor: darkMode ? '#475569' : '#cbd5e1'
        },
        yaxis: {
            title: {
                text: 'Topics',
                font: {
                    size: 16,
                    color: darkMode ? '#e2e8f0' : '#334155',
                    family: 'Inter, sans-serif',
                    weight: 'bold'
                }
            },
            tickfont: {
                size: 12,
                color: darkMode ? '#cbd5e1' : '#475569'
            },
            gridcolor: darkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(203, 213, 225, 0.3)',
            linecolor: darkMode ? '#475569' : '#cbd5e1'
        }
    };
};

/**
 * Stacked bar chart layout
 * @param {boolean} darkMode - Theme mode
 * @returns {object} Stacked bar chart layout configuration
 */
export const getStackedBarLayout = (darkMode = false) => {
    const baseLayout = getBaseLayout('', 500, darkMode, {
        barmode: 'stack',
        bargap: 0.2,
        margin: { l: 80, r: 80, b: 120, t: 100 }
    });

    return {
        ...baseLayout,
        xaxis: {
            title: {
                text: 'Topics',
                font: {
                    size: 16,
                    color: darkMode ? '#e2e8f0' : '#334155',
                    family: 'Inter, sans-serif',
                    weight: 'bold'
                }
            },
            tickfont: {
                size: 12,
                color: darkMode ? '#cbd5e1' : '#475569'
            },
            tickangle: -45,
            gridcolor: darkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(203, 213, 225, 0.3)',
            linecolor: darkMode ? '#475569' : '#cbd5e1'
        },
        yaxis: {
            title: {
                text: 'Document Count',
                font: {
                    size: 16,
                    color: darkMode ? '#e2e8f0' : '#334155',
                    family: 'Inter, sans-serif',
                    weight: 'bold'
                }
            },
            tickfont: {
                size: 12,
                color: darkMode ? '#cbd5e1' : '#475569'
            },
            gridcolor: darkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(203, 213, 225, 0.3)',
            linecolor: darkMode ? '#475569' : '#cbd5e1'
        },
        legend: {
            orientation: 'h',
            x: 0.5,
            xanchor: 'center',
            y: -0.2,
            bgcolor: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(248, 250, 252, 0.8)',
            bordercolor: darkMode ? '#475569' : '#cbd5e1',
            borderwidth: 1,
            font: {
                size: 14,
                color: darkMode ? '#e2e8f0' : '#334155'
            }
        }
    };
};

/**
 * Fallback layout for basic charts
 * @param {string} title - Chart title
 * @param {boolean} darkMode - Theme mode
 * @returns {object} Fallback layout configuration
 */
export const getFallbackLayout = (title = '', darkMode = false) => ({
    title: {
        text: title,
        font: {
            size: 24,
            color: darkMode ? '#e2e8f0' : '#1a202c',
            family: 'Arial, sans-serif'
        },
        x: 0.5,
        xanchor: 'center'
    },
    paper_bgcolor: darkMode ? '#1a1a1a' : '#ffffff',
    plot_bgcolor: darkMode ? '#1a1a1a' : '#ffffff',
    font: {
        color: darkMode ? '#e2e8f0' : '#1a202c',
        size: 14,
        family: 'Inter, sans-serif'
    },
    hovermode: 'closest',
    autosize: true,
    margin: {
        l: 60,
        r: 40,
        b: 80,
        t: 80
    },
    legend: {
        orientation: 'h',
        x: 0.5,
        xanchor: 'center',
        y: -0.2,
        font: {
            size: 13,
            color: darkMode ? '#cbd5e1' : '#1a202c'
        }
    }
});
/**

  Sunburst chart layout for topic hierarchy overview
 * @param {boolean} darkMode - Theme mode
 * @param {object} existingLayout - Existing layout from visualization data
 * @returns {object} Enhanced sunburst layout configuration
  */

export const getSunburstHierarchyLayout = (darkMode = false, existingLayout = {}) => ({
    ...existingLayout,
    paper_bgcolor: darkMode ? '#1a1a1a' : '#ffffff',
    plot_bgcolor: darkMode ? '#1a1a1a' : '#ffffff',
    font: {
        color: darkMode ? '#e2e8f0' : '#1a202c',
        size: 12,
        family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    },
    height: 450,
    margin: { l: 20, r: 20, b: 20, t: 50 },
    transition: {
        duration: 800,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    hoverlabel: {
        bgcolor: darkMode ? 'rgba(51, 65, 85, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        bordercolor: darkMode ? '#64748b' : '#cbd5e1',
        font: {
            color: darkMode ? '#f1f5f9' : '#0f172a',
            size: 13,
            family: 'Inter, sans-serif'
        },
        namelength: -1
    }
});
// plotlyLayouts.js - Extract and organize all Plotly layout configurations


// 2. Topic Sentiment Visualization Layout Function
export const getTopicSentimentLayout = (darkMode, baseLayout = {}) => {
  return {
    ...baseLayout,
    paper_bgcolor: darkMode ? '#1a1a1a' : '#ffffff',
    plot_bgcolor: darkMode ? '#1a1a1a' : '#ffffff',
    font: {
      color: darkMode ? '#e2e8f0' : '#1a202c',
      size: 12
    },
    height: 450,
    margin: { l: 80, r: 20, b: 100, t: 50 },
    title: {
      text: 'Sentiment Distribution by Topic',
      font: {
        size: 16,
        color: darkMode ? '#e2e8f0' : '#1a202c'
      }
    },
    xaxis: {
      ...baseLayout.xaxis,
      title: {
        ...baseLayout.xaxis?.title,
        font: {
          color: darkMode ? '#e2e8f0' : '#1a202c'
        }
      },
      tickangle: -45,
      tickfont: {
        size: 10
      }
    },
    yaxis: {
      ...baseLayout.yaxis,
      title: {
        ...baseLayout.yaxis?.title,
        font: {
          color: darkMode ? '#e2e8f0' : '#1a202c'
        }
      },
      tickangle: -45,
      tickfont: {
        size: 10
      }
    }
  };
};

// 3. Common Dark/Light Mode Layout Base
export const getBasePlotlyLayout = (darkMode, customOptions = {}) => {
  return {
    paper_bgcolor: darkMode ? '#1a1a1a' : '#ffffff',
    plot_bgcolor: darkMode ? '#1a1a1a' : '#ffffff',
    font: {
      color: darkMode ? '#e2e8f0' : '#1a202c',
      size: 12
    },
    ...customOptions
  };
};

// 4. Standard Plotly Config
export const getPlotlyConfig = (options = {}) => {
  return {
    responsive: true,
    displayModeBar: true,
    ...options
  };
};

// 5. Chart-specific layout generators

// Heatmap Layout


// Bar Chart Layout
export const getBarChartLayout = (darkMode, title = 'Bar Chart') => {
  return getBasePlotlyLayout(darkMode, {
    title: {
      text: title,
      font: {
        size: 16,
        color: darkMode ? '#e2e8f0' : '#1a202c'
      }
    },
    height: 400,
    margin: { l: 60, r: 20, b: 60, t: 60 },
    xaxis: {
      tickangle: -45,
      tickfont: { size: 10 },
      title: { font: { color: darkMode ? '#e2e8f0' : '#1a202c' } }
    },
    yaxis: {
      title: { font: { color: darkMode ? '#e2e8f0' : '#1a202c' } }
    }
  });
};
// plotlyDataGenerator.js

export const generatePlotlyData = (topicData, darkMode) => {
  return {
    topicSentiment: {
      data: [
        {
          type: "sunburst",
          labels: [
            ...topicData.map((t) => t.name),
            ...topicData.flatMap((t) => [
              `${t.name} Positive`,
              `${t.name} Negative`,
            ]),
          ],
          parents: [
            ...topicData.map(() => ""),
            ...topicData.flatMap((t) => [t.name, t.name]),
          ],
          values: [
            ...topicData.map((t) => t.total),
            ...topicData.flatMap((t) => [t.positive, t.negative]),
          ],
          marker: {
            colors: [
              ...COLORS.slice(0, topicData.length),
              ...topicData.flatMap(() => ["#10b981", "#ef4444"]),
            ],
            line: {
              color: darkMode
                ? "rgba(51, 65, 85, 0.3)"
                : "rgba(203, 213, 225, 0.5)",
              width: 2,
            },
          },
          hovertemplate:
            "<b>%{label}</b><br>Count: %{value}<br>Percentage: %{percentParent}<extra></extra>",
          hoverlabel: {
            bgcolor: darkMode
              ? "rgba(30, 41, 59, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
            bordercolor: darkMode ? "#64748b" : "#cbd5e1",
            font: { size: 14 },
          },
          branchvalues: "total",
          maxdepth: 3,
          animation: {
            duration: 1200,
            easing: "elastic",
          },
        },
      ],
      layout: getSunburstLayout(darkMode),
    },
    topicTrends: {
      data: [
        {
          type: "treemap",
          labels: topicData.map((t) => t.name),
          parents: topicData.map(() => ""),
          values: topicData.map((t) => t.total),
          textinfo: "label+value+percent parent",
          textfont: {
            size: 16,
            color: "#ffffff",
            family: "Inter, sans-serif",
            weight: "bold",
          },
          marker: {
            colors: topicData.map((_, i) => COLORS[i % COLORS.length]),
            line: {
              color: darkMode
                ? "rgba(51, 65, 85, 0.8)"
                : "rgba(255, 255, 255, 0.8)",
              width: 3,
            },
            cornerradius: 8,
          },
          hovertemplate:
            "<b>%{label}</b><br>Documents: %{value}<br>Percentage: %{percentParent}<extra></extra>",
          pathbar: {
            visible: false,
          },
          animation: {
            duration: 1000,
            easing: "bounce",
          },
        },
      ],
      layout: getTreemapLayout(darkMode),
    },
    topicPie: {
      data: [
        {
          type: "pie",
          labels: topicData.map((t) => t.name),
          values: topicData.map((t) => t.total),
          textinfo: "label+percent",
          textfont: {
            size: 14,
            color: "#ffffff",
            family: "Inter, sans-serif",
            weight: "bold",
          },
          hoverinfo: "label+value+percent",
          hovertemplate:
            "<b>%{label}</b><br>Documents: %{value}<br>Percentage: %{percent}<extra></extra>",
          marker: {
            colors: COLORS.slice(0, topicData.length),
            line: {
              color: darkMode
                ? "rgba(15, 23, 42, 0.8)"
                : "rgba(255, 255, 255, 0.8)",
              width: 3,
            },
          },
          hole: 0.4,
          pull: topicData.map((_, i) => (i === 0 ? 0.1 : 0)),
          rotation: 90,
          direction: "clockwise",
          sort: false,
          animation: {
            duration: 1500,
            easing: "elastic-out",
          },
        },
      ],
      layout: getPieChartLayout(darkMode, topicData.length),
    },
    topicHeatmap: {
      data: [
        {
          type: "heatmap",
          z: topicData.map((t) => [t.positive, t.negative]),
          x: ["Positive Sentiment", "Negative Sentiment"],
          y: topicData.map((t) => t.name),
          colorscale: getHeatmapColorscale(darkMode),
          hoverongaps: false,
          hovertemplate: "<b>%{y}</b><br>%{x}: %{z}<extra></extra>",
          showscale: true,
          colorbar: {
            title: {
              text: "Document Count",
              font: {
                size: 14,
                color: darkMode ? "#e2e8f0" : "#334155",
                family: "Inter, sans-serif",
              },
            },
            tickfont: {
              size: 12,
              color: darkMode ? "#e2e8f0" : "#334155",
            },
            bgcolor: darkMode
              ? "rgba(30, 41, 59, 0.8)"
              : "rgba(248, 250, 252, 0.8)",
            bordercolor: darkMode ? "#475569" : "#cbd5e1",
            borderwidth: 1,
          },
          animation: {
            duration: 1000,
            easing: "cubic-in-out",
          },
        },
      ],
      layout: getHeatmapLayout(darkMode),
    },
    stackedSentiment: {
      data: [
        {
          type: "bar",
          name: "Positive Sentiment",
          x: topicData.map((t) => t.name),
          y: topicData.map((t) => t.positive),
          marker: {
            color: "rgba(16, 185, 129, 0.8)",
            line: {
              color: "rgba(16, 185, 129, 1)",
              width: 2,
            },
          },
          hovertemplate: "<b>%{x}</b><br>Positive: %{y}<extra></extra>",
          offsetgroup: 1,
        },
        {
          type: "bar",
          name: "Negative Sentiment",
          x: topicData.map((t) => t.name),
          y: topicData.map((t) => t.negative),
          marker: {
            color: "rgba(239, 68, 68, 0.8)",
            line: {
              color: "rgba(239, 68, 68, 1)",
              width: 2,
            },
          },
          hovertemplate: "<b>%{x}</b><br>Negative: %{y}<extra></extra>",
          offsetgroup: 1,
        },
      ],
      layout: getStackedBarLayout(darkMode),
    },
  };
};
// Line Chart Layout
export const getLineChartLayout = (darkMode, title = 'Line Chart') => {
  return getBasePlotlyLayout(darkMode, {
    title: {
      text: title,
      font: {
        size: 16,
        color: darkMode ? '#e2e8f0' : '#1a202c'
      }
    },
    height: 400,
    margin: { l: 60, r: 20, b: 60, t: 60 },
    xaxis: {
      title: { font: { color: darkMode ? '#e2e8f0' : '#1a202c' } }
    },
    yaxis: {
      title: { font: { color: darkMode ? '#e2e8f0' : '#1a202c' } }
    }
  });
};

// Pie Chart Layout


// Scatter Plot Layout
export const getScatterPlotLayout = (darkMode, title = 'Scatter Plot') => {
  return getBasePlotlyLayout(darkMode, {
    title: {
      text: title,
      font: {
        size: 16,
        color: darkMode ? '#e2e8f0' : '#1a202c'
      }
    },
    height: 400,
    margin: { l: 60, r: 20, b: 60, t: 60 },
    xaxis: {
      title: { font: { color: darkMode ? '#e2e8f0' : '#1a202c' } },
      gridcolor: darkMode ? '#374151' : '#e5e7eb'
    },
    yaxis: {
      title: { font: { color: darkMode ? '#e2e8f0' : '#1a202c' } },
      gridcolor: darkMode ? '#374151' : '#e5e7eb'
    }
  });
};
/**
 * Timeline chart layout with date formatting
 * @param {boolean} darkMode - Theme mode
 * @returns {object} Timeline layout configuration
 */
export const getTimelineLayout = (darkMode = false) => ({
    ...getFallbackLayout('', darkMode),
    margin: {
        l: 60,
        r: 40,
        b: 80,
        t: 80
    },
    legend: {
        orientation: 'h',
        x: 0.5,
        xanchor: 'center',
        y: -0.35,
        font: {
            size: 13,
            color: darkMode ? '#cbd5e1' : '#1a202c'
        }
    },
    xaxis: {
        title: { text: 'Month' },
        type: 'date',
        tickformat: '%b %Y',
        tickangle: -45,
        tickfont: {
            size: 12,
            color: darkMode ? '#e2e8f0' : '#1a202c'
        }
    },
    yaxis: {
        title: { text: 'Document Count' },
        tickfont: {
            size: 12,
            color: darkMode ? '#e2e8f0' : '#1a202c'
        }
    }
});

/**
 * Get heatmap colorscale based on theme
 * @param {boolean} darkMode - Theme mode
 * @returns {Array} Colorscale array
 */
export const getHeatmapColorscale = (darkMode = false) => [
    [0, darkMode ? '#1e293b' : '#f8fafc'],
    [0.25, darkMode ? '#3730a3' : '#3b82f6'],
    [0.5, darkMode ? '#7c3aed' : '#8b5cf6'],
    [0.75, darkMode ? '#dc2626' : '#ef4444'],
    [1, darkMode ? '#991b1b' : '#dc2626']
];


// Export colors for consistency
export { COLORS };