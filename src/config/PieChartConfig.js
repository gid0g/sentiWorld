export const getPieData = (piechartData, darkMode) => ({
  labels: ["Positive", "Neutral", "Negative"],
  datasets: [
    {
      data: [
        piechartData?.positive,
        piechartData?.neutral,
        piechartData?.negative,
      ],
      backgroundColor: [
        "rgba(25, 135, 84, 0.8)",
        "rgba(13, 110, 253, 0.8)",
        "rgba(220, 53, 69, 0.8)",
      ],
      borderColor: [
        "rgba(25, 135, 84, 1)",
        "rgba(13, 110, 253, 1)",
        "rgba(220, 53, 69, 1)",
      ],
      borderWidth: 2,
      hoverBackgroundColor: [
        "rgba(25, 135, 84, 1)",
        "rgba(13, 110, 253, 1)",
        "rgba(220, 53, 69, 1)",
      ],
      hoverBorderColor: Array(3).fill(darkMode ? "#ffffff" : "#000000"),
      hoverBorderWidth: 3,
      hoverOffset: 8,
    },
  ],
});

export const getPieOptions = (darkMode, textColor, showToast) => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false },
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        color: textColor,
        padding: 20,
        usePointStyle: true,
        font: { size: 12 },
      },
      onHover: (event, legendItem, legend) => {
        legend.chart.canvas.style.cursor = "pointer";
      },
      onLeave: (event, legendItem, legend) => {
        legend.chart.canvas.style.cursor = "default";
      },
      onClick: (event, legendItem, legend) => {
        const index = legendItem.datasetIndex;
        const ci = legend.chart;
        legendItem.hidden = !ci.isDatasetVisible(index);
        ci.toggleDataVisibility(index);
        ci.update();
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: darkMode
        ? "rgba(33, 37, 41, 0.9)"
        : "rgba(255, 255, 255, 0.9)",
      titleColor: textColor,
      bodyColor: textColor,
      borderColor: darkMode ? "#495057" : "#dee2e6",
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      callbacks: {
        title: (items) => items[0].label + " Sentiment",
        label: (context) => {
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((context.parsed / total) * 100).toFixed(1);
          return [
            `Count: ${context.parsed}`,
            `Percentage: ${percentage}%`,
            `Total Feedback: ${total}`,
          ];
        },
        afterLabel: (context) => {
          switch (context.label) {
            case "Positive":
              return "Great feedback! Keep up the good work.";
            case "Negative":
              return "Areas for improvement identified.";
            default:
              return "Neutral responses - room for enhancement.";
          }
        },
      },
    },
  },
  elements: {
    arc: {
      borderWidth: 2,
      hoverBorderWidth: 4,
      hoverBorderColor: darkMode ? "#ffffff" : "#000000",
    },
  },
  onHover: (event, elements, chart) => {
    event.native.target.style.cursor = elements.length ? "pointer" : "default";
  },
  onClick: (event, elements, chart) => {
    if (elements.length > 0) {
      const index = elements[0].index;
      const label = chart.data.labels[index];
      const value = chart.data.datasets[0].data[index];
      const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
      const percentage = ((value / total) * 100).toFixed(1);
      showToast(
        `${label} Sentiment: ${value} feedback items (${percentage}%)`,
        "info"
      );
    }
  },
});
