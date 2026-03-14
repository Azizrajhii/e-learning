import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiUpload,
  FiPlus,
  FiExternalLink,
  FiEdit2,
  FiX,
  FiCalendar,
} from "react-icons/fi";
import { Worker } from "@react-pdf-viewer/core";
import { Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import UploadIcon from "./../images/UploadIcon.png";
import "./CertificateSettings.scss";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";

const CertificateSettings = () => {
  const [certificates, setCertificates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentCertificate, setCurrentCertificate] = useState({
    _id: "",
    name: "",
    institution: "",
    date: new Date().toISOString().split("T")[0],
    link: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const uploadRef = useRef(null);
  const dropAreaRef = useRef(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/certificates",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setCertificates(response.data.certificates);
      } catch (err) {
        console.error("Error fetching certificates:", err);
        setError("Failed to load certificates. Please try again.");
      }
    };

    fetchCertificates();
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      handleFileChange(droppedFile);
    } else {
      setError("Please upload a PDF file only.");
    }
  };

  const handleFileChange = (selectedFile) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      // Check file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.");
        return;
      }

      const fileUrl = URL.createObjectURL(selectedFile);
      setFile({
        name: selectedFile.name,
        url: fileUrl,
        file: selectedFile,
      });

      // Update the link in the current certificate
      setCurrentCertificate((prev) => ({
        ...prev,
        link: fileUrl,
        name: isEditMode ? prev.name : selectedFile.name.replace(".pdf", ""),
      }));
      setError(null);
    } else {
      setError("Please upload a PDF file only.");
    }
  };

  const handleSubmitCertificate = async () => {
    if (!currentCertificate.name || !currentCertificate.institution) {
      setError("Please fill all required fields.");
      return;
    }
    console.log(currentCertificate);
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isEditMode) {
        await handleUpdateCertificate();
      } else {
        await handleAddCertificate();
      }
    } catch (err) {
      console.error("Error with certificate operation:", err);
      setError(
        err.response?.data?.message ||
          "Failed to complete operation. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCertificate = async () => {
    if (!file) {
      setError("Please upload a certificate file.");
      return;
    }

    const formData = new FormData();
    formData.append("certificateFile", file.file);
    formData.append("name", currentCertificate.name);
    formData.append("institution", currentCertificate.institution);
    formData.append("date", currentCertificate.date);

    const response = await axios.post(
      "http://localhost:5000/api/certificates/external",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    setCertificates([...certificates, response.data.certificate]);
    setSuccess("Certificate added successfully!");
    resetModal();
  };

  const handleUpdateCertificate = async () => {
    const formData = new FormData();

    // Only append fields that have changed
    if (file) formData.append("certificateFile", file.file);
    if (currentCertificate.name)
      formData.append("name", currentCertificate.name);
    if (currentCertificate.institution)
      formData.append("institution", currentCertificate.institution);
    if (currentCertificate.date)
      formData.append("date", currentCertificate.date);

    const response = await axios.put(
      `http://localhost:5000/api/certificates/updateMyCertificate/${currentCertificate.id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    setCertificates(
      certificates.map((cert) =>
        cert._id === currentCertificate._id ? response.data.certificate : cert
      )
    );
    setSuccess("Certificate updated successfully!");
    resetModal();
  };

  const handleEditClick = (certificate) => {
    setCurrentCertificate({
      ...certificate,
      date: certificate.date.split("T")[0], // Format date for date input
    });
    if (certificate.link) {
      setFile({
        name: certificate.name + ".pdf",
        url: certificate.link,
      });
    }
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCertificate((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetModal = () => {
    setCurrentCertificate({
      _id: "",
      name: "",
      institution: "",
      date: new Date().toISOString().split("T")[0],
      link: "",
    });
    setFile(null);
    setIsEditMode(false);
    setIsModalOpen(false);
    setError(null);
    setSuccess(null);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderDragAndDropSection = () => {
    const currentUrl = file?.url || currentCertificate.link;
    const currentName =
      file?.name ||
      (currentCertificate.name ? currentCertificate.name + ".pdf" : "");

    return (
      <div ref={uploadRef} className="certificate-upload">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="certificate-upload__form">
            <div className="certificate-upload__drop-section">
              <label
                htmlFor="certificate-input-file"
                id="drop-area"
                ref={dropAreaRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={isDragging ? "dragging" : ""}
              >
                <input
                  type="file"
                  id="certificate-input-file"
                  hidden
                  onChange={(e) => handleFileChange(e.target.files[0])}
                  accept="application/pdf"
                />
                <div id="upload-view">
                  {currentUrl ? (
                    <div className="pdf-viewer-container">
                      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                        <div className="pdf-preview">
                          <Viewer fileUrl={currentUrl} plugins={[]} />
                        </div>
                      </Worker>
                      <div className="file-info">
                        <span>{currentName}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="dropzone-content">
                      <img
                        src={UploadIcon}
                        alt="Dropzone Icon"
                        className="dropzone-icon"
                      />
                      <p className="dropzone-text">
                        <span className="browse-link">Drag and drop</span> or{" "}
                        <span className="browse-link">click here</span> to
                        upload your certificate
                      </p>
                      <p className="dropzone-hint">PDF files only (max 5MB)</p>
                    </div>
                  )}
                </div>
              </label>
              {error && <p className="error-message">{error}</p>}
              {success && <p className="success-message">{success}</p>}
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="certificate-settings">
      <div className="certificate-settings__header">
        <h1>My Certificates</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="certificate-settings__add-btn"
          onClick={() => setIsModalOpen(true)}
        >
          <FiPlus /> Add Certificate
        </motion.button>
      </div>

      <div className="certificate-settings__grid">
        {certificates.map((cert) => (
          <motion.div
            key={cert._id}
            className="certificate-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5 }}
          >
            <div className="certificate-card__header">
              <h3>{cert.name}</h3>
              <span className="certificate-card__institution">
                {cert.institution}
              </span>
            </div>
            <div className="certificate-card__body">
              <div className="certificate-card__date">
                <span>Issued on:</span>
                <span>{formatDate(cert.date)}</span>
              </div>
            </div>
            <div className="certificate-card__footer">
              <Link
                to={`/SkillShareHub/CertificateViewer/${cert.id}`}
                className="certificate-card__view-btn"
              >
                <FiExternalLink /> View Certificate
              </Link>
              <button
                className="certificate-card__edit-btn"
                onClick={() => handleEditClick(cert)}
                disabled={cert.institution === "SkillShare Hub"}
              >
                <FiEdit2 /> Edit
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Certificate Modal */}
      {isModalOpen && (
        <div className="certificate-modal">
          <div className="certificate-modal__content">
            <div className="certificate-modal__header">
              <h2>
                {isEditMode ? "Edit Certificate" : "Upload New Certificate"}
              </h2>
              <button
                onClick={resetModal}
                className="certificate-modal__close-btn"
              >
                <FiX />
              </button>
            </div>

            <div className="certificate-edit">
              <div className="certificate-edit__form">
                <div className="certificate-edit__fields">
                  <div className="form-group">
                    <label htmlFor="certificate-name">Certificate Name*</label>
                    <input
                      type="text"
                      id="certificate-name"
                      name="name"
                      value={currentCertificate.name}
                      onChange={handleInputChange}
                      placeholder="Enter certificate name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="institution">Institution*</label>
                    <input
                      type="text"
                      id="institution"
                      name="institution"
                      value={currentCertificate.institution}
                      onChange={handleInputChange}
                      placeholder="Enter institution name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="date">Issue Date*</label>
                    <div className="date-input">
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={currentCertificate.date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="certificate-edit__preview">
                  {renderDragAndDropSection()}
                </div>
              </div>
            </div>

            <div className="certificate-modal__footer">
              <button
                className="certificate-modal__cancel-btn"
                onClick={resetModal}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="certificate-modal__upload-btn"
                onClick={handleSubmitCertificate}
                disabled={
                  isLoading ||
                  !currentCertificate.name ||
                  !currentCertificate.institution ||
                  !currentCertificate.date ||
                  (!isEditMode && !file)
                }
              >
                {isLoading
                  ? "Processing..."
                  : isEditMode
                  ? "Save Changes"
                  : "Upload Certificate"}
              </button>
            </div>
          </div>
          <div className="certificate-modal__overlay" onClick={resetModal} />
        </div>
      )}
    </div>
  );
};

export default CertificateSettings;
