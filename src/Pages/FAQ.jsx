import React, { useState } from "react";
import { Accordion, Container, Row, Col, Card } from "react-bootstrap";
import {
  HelpCircle,
  Lightbulb,
  Users,
  BarChart3,
  Cpu,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { faqs } from "../data/Faq";


const FAQSection = () => {
  const { darkMode } = useTheme();
  const [activeKey, setActiveKey] = useState(null);

  const categoryColors = {
    General: darkMode ? "#3b82f6" : "#2563eb",
    Technical: darkMode ? "#10b981" : "#059669",
    Usage: darkMode ? "#f59e0b" : "#d97706",
    Features: darkMode ? "#8b5cf6" : "#7c3aed",
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      General: <HelpCircle size={16} />,
      Technical: <Cpu size={16} />,
      Usage: <Users size={16} />,
      Features: <BarChart3 size={16} />,
    };
    return iconMap[category] || <HelpCircle size={16} />;
  };

  return (
    <section className={`py-5 ${darkMode ? "bg-dark text-light" : "bg-light"}`}>
      <Container>
        <Row className="justify-content-center mb-5">
          <Col lg={8} className="text-center">
            <div className="d-flex justify-content-center align-items-center mb-3">
              <HelpCircle
                size={32}
                className={darkMode ? "text-sentiWorld" : "text-sentiWorld"}
              />
              <h2
                className={`ms-3 mb-0 ${darkMode ? "text-light" : "text-dark"}`}
              >
                Frequently Asked Questions
              </h2>
            </div>
            <p
              className={`lead ${
                darkMode ? "text-light-emphasis" : "text-muted"
              }`}
            >
              Everything you need to know about our Sentiment-Driven Topic
              Modeling System
            </p>
          </Col>
        </Row>

        <Row className="justify-content-center w-100">
          <Col lg={10} xl={8}>
            <Accordion
              flush
              activeKey={activeKey}
              onSelect={(key) => setActiveKey(key)}
              className="faq-accordion"
            >
              {faqs.map((faq) => (
                <Accordion.Item
                  eventKey={faq.id}
                  key={faq.id}
                  className={`border-0 mb-3 ${
                    darkMode ? "bg-dark" : "bg-white"
                  }`}
                  style={{
                    borderRadius: "12px",
                    boxShadow: darkMode
                      ? "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)"
                      : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    overflow: "hidden",
                  }}
                >
                  <Accordion.Header className="border-0">
                    <div className="d-flex align-items-center w-100">
                      <div className="d-flex align-items-center">
                        <div
                          className="d-flex align-items-center justify-content-center me-3"
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor:
                              categoryColors[faq.category] + "20",
                            borderRadius: "8px",
                            color: categoryColors[faq.category],
                          }}
                        >
                          {faq.icon}
                        </div>
                        <div className="text-start">
                          <div className="d-flex align-items-center mb-1">
                            <span
                              className="badge me-2 px-2 py-1"
                              style={{
                                backgroundColor:
                                  categoryColors[faq.category] + "20",
                                color: categoryColors[faq.category],
                                fontSize: "0.75rem",
                                fontWeight: "500",
                              }}
                            >
                              {getCategoryIcon(faq.category)}
                              <span className="ms-1">{faq.category}</span>
                            </span>
                          </div>
                          <h6
                            className={`mb-0 fw-semibold ${
                              darkMode ? "text-light" : "text-dark"
                            }`}
                          >
                            {faq.question}
                          </h6>
                        </div>
                      </div>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body
                    className={`${
                      darkMode
                        ? "bg-dark text-light-emphasis"
                        : "bg-white text-muted"
                    }`}
                  >
                    <div className="ps-5 ms-2">
                      <p className="mb-0 lh-relaxed">{faq.answer}</p>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Col>
        </Row>

        {/* Contact Support Section */}
        <Row className="justify-content-center mt-5">
          <Col lg={8} className="text-center">
            <Card
              className={`border-0 ${
                darkMode ? "bg-secondary text-light" : "bg-sentiWorld text-white"
              }`}
            >
              <Card.Body className="py-4">
                <div className="d-flex justify-content-center align-items-center mb-3">
                  <Lightbulb size={24} className="me-2" />
                  <h5 className="mb-0">Still have questions?</h5>
                </div>
                <p className="mb-3 opacity-90">
                  Can't find the answer you're looking for? Our support team is
                  here to help.
                </p>
                <button
                  className={`btn ${
                    darkMode ? "btn-light" : "btn-outline-light"
                  } px-4`}
                  onClick={() =>
                    (window.location.href = "mailto:no-reply@sentiworld.com")
                  }
                >
                  Contact Support
                </button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default FAQSection;
