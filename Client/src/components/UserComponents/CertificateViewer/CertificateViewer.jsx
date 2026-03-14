import React, { useState, useEffect } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { dropPlugin } from "@react-pdf-viewer/drop";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import "@react-pdf-viewer/drop/lib/styles/index.css";
import screenfull from "screenfull";
import {
  FaChevronLeft,
  FaChevronRight,
  FaSearchMinus,
  FaSearchPlus,
  FaExpand,
  FaDownload,
  FaAward,
  FaUniversity,
  FaCalendarAlt,
  FaSpinner
} from "react-icons/fa";
import "./CertificateViewer.scss";
import { useParams } from "react-router-dom";
import axios from "axios";

const CertificateViewer = () => {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const zoomPluginInstance = zoomPlugin();
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const dropPluginInstance = dropPlugin();

  const { ZoomInButton, ZoomOutButton } = zoomPluginInstance;
  const {
    CurrentPageLabel,
    GoToNextPageButton,
    GoToPreviousPageButton,
    jumpToPage,
  } = pageNavigationPluginInstance;

  const [pageNumberInput, setPageNumberInput] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/certificates/${certificateId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setCertificate(response.data.certificate);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch certificate");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId]);

  const handleGoToPage = (pageNumber) => {
    if (!isNaN(pageNumber) && pageNumber > 0) {
      jumpToPage(pageNumber - 1);
    }
  };

  const handleFullscreen = () => {
    if (screenfull.isEnabled) {
      const pdfContainer = document.querySelector(".certificate-container");
      if (pdfContainer) {
        screenfull.toggle(pdfContainer);
        setIsFullscreen(!isFullscreen);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(screenfull.isFullscreen);
    };

    if (screenfull.isEnabled) {
      screenfull.on("change", handleFullscreenChange);
    }

    return () => {
      if (screenfull.isEnabled) {
        screenfull.off("change", handleFullscreenChange);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading certificate...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="error-container">
        <h2>Certificate not found</h2>
      </div>
    );
  }

  // Helper function to handle both direct dates and MongoDB date objects
  const getCertificateDate = () => {
    const dateObj = certificate.date?.$date || certificate.date;
    return new Date(dateObj).toLocaleDateString();
  };

  return (
    <div className="certificate-page">
      <div className="certificate-header">
        <div className="certificate-info-card">
          <h2 className="certificate-title">
            <FaAward className="icon" /> {certificate.name}
          </h2>
          <div className="certificate-meta">
            <p className="institution">
              <FaUniversity className="icon" /> {certificate.institution}
            </p>
            <p className="date">
              <FaCalendarAlt className="icon" /> {getCertificateDate()}
            </p>
          </div>
        </div>
      </div>

      <div
        className={`certificate-container ${isFullscreen ? "fullscreen" : ""}`}
      >
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <div className="certificate-toolbar">
            <div className="certificate-toolbar-left">
              <GoToPreviousPageButton>
                {({ onClick }) => (
                  <button className="certificate-toolbar-button" onClick={onClick}>
                    <FaChevronLeft />
                  </button>
                )}
              </GoToPreviousPageButton>

              <GoToNextPageButton>
                {({ onClick }) => (
                  <button className="certificate-toolbar-button" onClick={onClick}>
                    <FaChevronRight />
                  </button>
                )}
              </GoToNextPageButton>

              <div className="certificate-page-label">
                Page <CurrentPageLabel />
              </div>

              <div className="certificate-container-page-input">
                <input
                  type="number"
                  value={pageNumberInput}
                  onChange={(e) => {
                    setPageNumberInput(e.target.value);
                    handleGoToPage(parseInt(e.target.value, 10));
                  }}
                  className="certificate-page-input"
                  placeholder="Go to page..."
                  min="1"
                />
              </div>
            </div>

            <div className="certificate-toolbar-right">
              <ZoomOutButton>
                {({ onClick }) => (
                  <button className="certificate-toolbar-button" onClick={onClick}>
                    <FaSearchMinus />
                  </button>
                )}
              </ZoomOutButton>

              <ZoomInButton>
                {({ onClick }) => (
                  <button className="certificate-toolbar-button" onClick={onClick}>
                    <FaSearchPlus />
                  </button>
                )}
              </ZoomInButton>

              <button className="certificate-toolbar-button" onClick={handleFullscreen}>
                <FaExpand />
              </button>

              <a
                href={certificate.link}
                download={`${certificate.name.replace(
                  /\s+/g,
                  "_"
                )}_certificate.pdf`}
                className="certificate-toolbar-button"
              >
                <FaDownload />
              </a>
            </div>
          </div>

          <div className="certificate-pdf-viewer-container">
            <Viewer
              fileUrl={certificate.link}
              plugins={[
                zoomPluginInstance,
                pageNavigationPluginInstance,
                dropPluginInstance,
              ]}
            />
          </div>
        </Worker>
      </div>
    </div>
  );
};

export default CertificateViewer;