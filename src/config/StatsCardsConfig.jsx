import {
  ChatLeftText,
  Grid3x3Gap,
  HandThumbsUp,
  Star,
} from "react-bootstrap-icons";

export const getStatsCards = (analytics) => [
  {
    title: "Total Feedback",
    value: analytics?.totalFeedback,
    icon: <ChatLeftText size={20}/>,
    color: "#0d6efd",
    iconBgColor: "rgba(13, 110, 253, 0.1)",
  },
  {
    title: "Number of Topics Detected",
    value: analytics?.topicsCount,
    icon: <Grid3x3Gap size={20} />,
    color: "#198754",
    iconBgColor: "rgba(25, 135, 84, 0.1)",
  },
  {
    title: "Most Common",
    value: analytics?.mostCommonSentiment,
    icon: <HandThumbsUp size={20} />,
    color: "#0d6efd",
    iconBgColor: "rgba(13, 110, 253, 0.1)",
  },
  {
    title: "Average Course Rating",
    value:
      analytics?.analysis_time > 0
        ? analytics?.averageCourseRating / analytics?.analysis_time
        : 0,
    icon: <Star size={20} />,
    color: "#ffc107",
    iconBgColor: "rgba(255, 193, 7, 0.1)",
  },
];


