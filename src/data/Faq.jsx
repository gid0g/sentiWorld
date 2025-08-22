import {

  HelpCircle,
  Lightbulb,
  Users,
  BarChart3,
  Cpu,
  Shield,
} from "lucide-react";
export const faqs = [
  // General
  {
    id: "0",
    category: "General",
    icon: <HelpCircle size={20} />,
    question: "What is the Sentiment-Driven Topic Modeling System?",
    answer:
      "Our system combines sentiment analysis and topic modeling to analyze student feedback from online learning platforms. It automatically identifies key themes in student comments and determines the emotional sentiment associated with each topic, helping educational institutions understand student experiences and improve their offerings.",
  },
  {
    id: "7",
    category: "General",
    icon: <HelpCircle size={20} />,
    question: "How does this system improve online learning?",
    answer:
      "By automatically analyzing large volumes of student feedback, the system helps educators quickly identify what students like and dislike about their courses. This enables targeted improvements in course content, delivery methods, platform usability, and overall student engagement strategies.",
  },

  // Technical
  {
    id: "1",
    category: "Technical",
    icon: <Cpu size={20} />,
    question: "What technologies power this system?",
    answer:
      "The system uses advanced NLP techniques including Top2Vec for topic modeling and DistilBERT for sentiment analysis. The frontend is built with React and Bootstrap, while the backend uses Python Flask. We leverage machine learning models trained on educational feedback data to ensure accurate analysis.",
  },
  {
    id: "4",
    category: "Technical",
    icon: <Lightbulb size={20} />,
    question: "How accurate is the sentiment analysis?",
    answer:
      "Our system uses DistilBERT, a state-of-the-art transformer model that maintains 97% of BERT's performance while being 40% smaller and 60% faster. The model has been fine-tuned on educational feedback data to ensure high accuracy in identifying student emotions and opinions.",
  },
  {
    id: "6",
    category: "Technical",
    icon: <Cpu size={20} />,
    question: "What is Top2Vec and why do you use it?",
    answer:
      "Top2Vec is a modern topic modeling algorithm that uses vector embeddings to automatically discover topics in text data. Unlike traditional methods like LDA, Top2Vec doesn't require you to specify the number of topics beforehand and provides better semantic coherence, making it ideal for analyzing diverse student feedback.",
  },

  // Usage
  {
    id: "2",
    category: "Usage",
    icon: <Users size={20} />,
    question: "Who can benefit from this system?",
    answer:
      "Educational institutions, online learning platforms, course instructors, and educational administrators can all benefit from this system. It helps them understand student satisfaction, identify areas for improvement, and make data-driven decisions to enhance the learning experience.",
  },
  {
    id: "5",
    category: "Usage",
    icon: <Shield size={20} />,
    question: "Is student data kept private and secure?",
    answer:
      "Yes, we prioritize data privacy and security. All student feedback is processed anonymously, and we follow best practices for data protection. The system focuses on analyzing aggregate patterns rather than individual responses, ensuring student privacy is maintained throughout the analysis process.",
  },

  // Features
  {
    id: "3",
    category: "Features",
    icon: <BarChart3 size={20} />,
    question: "What kind of insights does the system provide?",
    answer:
      "The system provides detailed analysis of student feedback including: identification of main discussion topics, sentiment scores for each topic (positive, negative, neutral), visualization of sentiment trends over time, and actionable insights for improving specific aspects of online learning experiences.",
  },
];