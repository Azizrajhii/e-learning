import { useState, useRef, useEffect } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { dropPlugin } from "@react-pdf-viewer/drop";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/drop/lib/styles/index.css";
import UploadIcon from "./../../../images/UploadIcon.png";
import FileUploadIconDetails from "./../../../images/FileUploadIconDetails.png";
import FileUploadIconVisibility from "./../../../images/FileUploadIconVisibility.png";
import FileUploadIconDescription from "./../../../images/FileUploadIconDescription.png";
import "./CreateLesson.css";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function CreateLesson() {
  const { FormationId } = useParams();
  const [modal, setModal] = useState({
    show: false,
    message: "",
    type: "info",
  });
  const [file, setFile] = useState(null);
  const [activeTab, setActiveTab] = useState("Details");
  const dropPluginInstance = dropPlugin();
  const dropAreaRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonOrder, setLessonOrder] = useState("");
  const [description, setDescription] = useState("");
  const [publicDate, setPublicDate] = useState("");
  const [notify, setNotify] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!file?.file) {
      setModal({ show: true, message: "Please upload a file.", type: "error" });
      return;
    }

    if (!lessonTitle || !lessonOrder || !description || !publicDate) {
      setModal({
        show: true,
        message: "Please fill in all required fields.",
        type: "error",
      });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file.file);
    formData.append("formationId", FormationId);
    formData.append("title", lessonTitle);
    formData.append("order", lessonOrder);
    formData.append("description", description);
    formData.append("publicDate", publicDate);
    formData.append("notify", notify);
    formData.append("duration", duration);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/lessons",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data) {
        setModal({
          show: true,
          message: "Upload successful!",
          type: "success",
        });
      } else {
        setModal({ show: true, message: "Upload failed.", type: "error" });
      }
    } catch (err) {
      console.error("Upload error:", err);
      setModal({
        show: true,
        message: "An error occurred while uploading.",
        type: "error",
      });
    } finally {
      setLoading(false); // hide loading
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target?.files?.[0] || e;
    if (!selectedFile) return;

    const url = URL.createObjectURL(selectedFile);

    if (selectedFile.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.src = url;
      video.addEventListener("loadedmetadata", () => {
        setDuration(Math.round(video.duration));
      });
      setFile({ type: "video", url, file: selectedFile });
    } else if (selectedFile.type === "application/pdf") {
      setFile({ type: "pdf", url, file: selectedFile });
      setDuration(0);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dropAreaRef.current?.classList.add("dragover");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dropAreaRef.current?.classList.remove("dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dropAreaRef.current?.classList.remove("dragover");
    const selectedFile = e.dataTransfer.files[0];
    handleFileChange(selectedFile);
  };

  useEffect(() => {
    const activeTabElement = document.querySelector(".tabs .active-tab");
    const underlineElement = document.querySelector(".tabs .underline");

    if (activeTabElement && underlineElement) {
      underlineElement.style.left = `${activeTabElement.offsetLeft}px`;
      underlineElement.style.width = `${activeTabElement.offsetWidth}px`;
    }
  }, [activeTab]);

  const handleModalOk = () => {
    if (modal.type === "success") {
      navigate(`/SkillShareHub/ProfSpace/MyFormations/Details/${FormationId}`);
    } else {
      setModal({ ...modal, show: false });
    }
  };

  return (
    <>
      {loading && (
        <div className="loadingLesson-overlay">
          <div className="spinnerLesson-container">
            <div className="spinnerLesson"></div>
            <p>Uploading, please wait...</p>
          </div>
        </div>
      )}

      {modal.show && (
        <div className={`CreateLesson-modal-overlay ${modal.type}`}>
          <div className="CreateLesson-modal-box">
            <p>{modal.message}</p>
            <button onClick={handleModalOk}>OK</button>
          </div>
        </div>
      )}
      <div className="upload-container">
        <div className="upload-title">
          <h1>
            LessonLift<span>Lesson Depot</span>
          </h1>
        </div>

        <div className="content-container">
          <div className="drop-section">
            <label
              htmlFor="input-file"
              id="drop-area"
              ref={dropAreaRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="input-file"
                hidden
                onChange={handleFileChange}
                accept="video/*, application/pdf"
              />
              <div id="upload-view">
                {file ? (
                  file.type === "video" ? (
                    <video
                      src={file.url}
                      controls
                      autoPlay
                      loop
                      className="uploaded-video"
                    />
                  ) : (
                    <div className="pdf-viewer-container">
                      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                        <div className="pdf-preview">
                          <Viewer
                            fileUrl={file.url}
                            plugins={[dropPluginInstance]}
                          />
                        </div>
                      </Worker>
                    </div>
                  )
                ) : (
                  <div className="dropzone-content">
                    <img
                      src={UploadIcon}
                      alt="Dropzone Icon"
                      className="dropzone-icon"
                    />
                    <p className="dropzone-text">
                      <span className="browse-link">Drag and drop</span> or{" "}
                      <span className="browse-link">click here</span> to upload
                      PDFs or videos.
                    </p>
                    <p className="dropzone-hint">
                      Upload any file from desktop
                    </p>
                  </div>
                )}
              </div>
            </label>
          </div>

          <div className="form-section">
            <div className="tabs">
              <button
                className={activeTab === "Details" ? "active-tab" : ""}
                onClick={() => setActiveTab("Details")}
              >
                <img src={FileUploadIconDetails} alt="" />
                Details
              </button>
              <button
                className={activeTab === "description" ? "active-tab" : ""}
                onClick={() => setActiveTab("description")}
              >
                <img src={FileUploadIconDescription} alt="" />
                Description
              </button>
              <button
                className={activeTab === "Visibility" ? "active-tab" : ""}
                onClick={() => setActiveTab("Visibility")}
              >
                <img src={FileUploadIconVisibility} alt="" />
                Visibility
              </button>
              <div className="underline"></div>
            </div>

            {activeTab === "Details" && (
              <div className="tab-content active">
                <div className="form-group">
                  <label>Lesson Title</label>
                  <input
                    type="text"
                    placeholder="Lesson Name..."
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Lesson Order</label>
                  <input
                    type="number"
                    placeholder="Lesson Order..."
                    value={lessonOrder}
                    onChange={(e) => setLessonOrder(e.target.value)}
                    min={0}
                  />
                </div>
              </div>
            )}

            {activeTab === "description" && (
              <div className="tab-content active">
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Enter a description..."
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            )}

            {activeTab === "Visibility" && (
              <div className="tab-content active">
                <div className="form-group">
                  <label>Public Date</label>
                  <input
                    type="date"
                    value={publicDate}
                    onChange={(e) => setPublicDate(e.target.value)}
                  />
                </div>
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="notify"
                    checked={notify}
                    onChange={(e) => setNotify(e.target.checked)}
                  />
                  <label htmlFor="notify">Send me a copy</label>
                </div>
                <div className="form-actions">
                  <button className="upload-btn" onClick={handleSubmit}>
                    Upload Files
                  </button>
                  <button className="cancel-btn">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
