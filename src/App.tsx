
import { useState } from "react";
import "./App.css";
import ImageCompressor from "./ImageCompressor";
import UtilityTools from "./UtilityTools";

const tools = [
  {
    name: "Image Compressor",
    description: "Reduce image file size without losing quality.",
    icon: "🗜️",
    color: "purple",
  },
  {
    name: "Image Resizer",
    description: "Resize images to your preferred dimensions.",
    icon: "🖼️",
    color: "blue",
  },
  {
    name: "Image to PDF",
    description: "Convert your images into a PDF document.",
    icon: "📄",
    color: "pink",
  },
  {
    name: "PDF Merger",
    description: "Combine multiple PDF files into one.",
    icon: "📚",
    color: "orange",
  },
  {
    name: "Text Formatter",
    description: "Change text case and clean up your text.",
    icon: "✍️",
    color: "green",
  },
  {
    name: "Word Counter",
    description: "Count words, characters, and sentences.",
    icon: "🔢",
    color: "yellow",
  },
  {
    name: "Percentage Calculator",
    description: "Calculate percentages quickly and easily.",
    icon: "％",
    color: "cyan",
  },
  {
    name: "Unit Converter",
    description: "Convert length, weight, and temperature units.",
    icon: "⚖️",
    color: "red",
  },
];

function App() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const handleBack = () => {
    setActiveTool(null);
  };

  // Image Compressor and all other tools are handled separately.
  if (activeTool === "Image Compressor") {
    return <ImageCompressor onBack={handleBack} />;
  }

  if (activeTool !== null) {
    return (
      <UtilityTools
        tool={activeTool}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="app">
      <header className="navbar">
        <div
          className="logo"
          onClick={handleBack}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              handleBack();
            }
          }}
        >
          <span className="logo-icon">✦</span>
          <span>Zenvora</span>
        </div>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#tools">Tools</a>
          <a href="#about">About</a>
        </nav>

        <a className="nav-button" href="#tools">
          Explore Tools <span>↗</span>
        </a>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-badge">
            <span className="badge-dot" />
            SIMPLE TOOLS. SMARTER WORKFLOW.
          </div>

          <h1>
            Everything you need.
            <br />
            <span>All in one place.</span>
          </h1>

          <p className="hero-description">
            Meet Zenvora — your everyday toolkit for images, PDFs,
            text, and calculations. Fast, simple, and free to use.
          </p>

          <div className="hero-actions">
            <a className="primary-button" href="#tools">
              Explore All Tools <span>→</span>
            </a>

            <a className="secondary-button" href="#about">
              Learn More
            </a>
          </div>

          <div className="hero-stats">
            <div>
              <strong>08</strong>
              <span>Useful Tools</span>
            </div>

            <div className="stat-divider" />

            <div>
              <strong>100%</strong>
              <span>Easy to Use</span>
            </div>

            <div className="stat-divider" />

            <div>
              <strong>Free</strong>
              <span>Always Simple</span>
            </div>
          </div>

          <div className="hero-decoration decoration-one" />
          <div className="hero-decoration decoration-two" />
        </section>

        <section className="tools-section" id="tools">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR TOOLKIT</span>
              <h2>Explore our tools</h2>
              <p>
                Everything you need to get things done, without the
                unnecessary complexity.
              </p>
            </div>

            <span className="tools-count">08 TOOLS</span>
          </div>

          <div className="tools-grid">
            {tools.map((tool, index) => (
              <button
                type="button"
                className="tool-card"
                key={tool.name}
                onClick={() => setActiveTool(tool.name)}
                style={{
                  animationDelay: `${index * 70}ms`,
                }}
              >
                <div className={`tool-icon ${tool.color}`}>
                  {tool.icon}
                </div>

                <div className="tool-card-content">
                  <h3>{tool.name}</h3>
                  <p>{tool.description}</p>
                </div>

                <div className="tool-card-footer">
                  <span>Open tool</span>
                  <span className="tool-arrow">↗</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="about-icon">✦</div>

          <span className="eyebrow">WHY ZENVORA?</span>

          <h2>Less hassle. More done.</h2>

          <p>
            Useful everyday tools, brought together in one clean,
            simple space. Choose a tool, get your task done, and get
            back to what matters.
          </p>

          <div className="about-features">
            <div>
              <span>⚡</span>
              <strong>Quick &amp; Simple</strong>
              <p>Easy-to-use tools without a complicated setup.</p>
            </div>

            <div>
              <span>✧</span>
              <strong>One Place</strong>
              <p>Your everyday utilities in one convenient toolkit.</p>
            </div>

            <div>
              <span>♡</span>
              <strong>Made for You</strong>
              <p>A clean experience designed to keep things simple.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="footer-logo" href="#home" onClick={handleBack}>
          <span>✦</span> Zenvora
        </a>

        <p>Simple tools for your everyday workflow.</p>

        <span className="copyright">
          © {new Date().getFullYear()} Zenvora. All rights reserved.
        </span>
      </footer>
    </div>
  );
}

export default App;
