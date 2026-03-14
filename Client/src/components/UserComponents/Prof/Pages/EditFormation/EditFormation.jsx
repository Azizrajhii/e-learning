import { useState, useEffect, useRef } from "react";
import { MdArrowBack, MdUpload, MdSave, MdCheckCircle } from "react-icons/md";
import styles from "./EditFormation.module.scss";
import { useParams, useNavigate } from "react-router-dom";
import JsIcon from "./../../../images/JsIcon.png";
import UploadImageIcon from "./../../../images/UploadImageIcon.png";
import "./custom-select.css";
import axios from "axios";

function EditFormation() {
  const navigate = useNavigate();
  const { FormationId } = useParams();
  const token = localStorage.getItem("token");
  const isEditMode = FormationId && FormationId !== "new";
  const [newFormationId,setNewFormationId] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    date: "",
    Seats: 0,
    status: "upcoming",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("date", formData.date);
    formDataToSend.append("Seats", formData.Seats);
    formDataToSend.append("status", formData.status);

    const fileInput = document.getElementById("input-file");
    if (fileInput.files[0]) {
      formDataToSend.append("file", fileInput.files[0]);
    }

    try {
      if (isEditMode) {
        await axios.put(
          `http://localhost:5000/api/formations/${FormationId}`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        const response = await axios.post(
          `http://localhost:5000/api/formations/create`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log(response)
        setNewFormationId(response.data._id);
      }
      setShowSuccessModal(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save formation. Please try again."
      );
      console.error("Error saving formation:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const onCancel = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchFormationData = async () => {
      if (isEditMode) {
        setIsLoading(true);
        try {
          const response = await axios.get(
            `http://localhost:5000/api/formations/${FormationId}`,
            headers
          );
          const data = response.data;
          console.log("data",data)
          setFormData({
            title: data.title || "",
            category: data.category || "",
            description: data.description || "",
            date: data.createdAt
              ? new Date(data.createdAt).toISOString().split("T")[0]
              : "",
            Seats: data.maxSeats || 0,
            status: data.status?.toLowerCase() || "upcoming",
          });
          if (data.coverImage) {
            setPreviewImage(data.coverImage);
          }
        } catch (err) {
          setError(
            err.response?.data?.message || "Failed to fetch formation data."
          );
          console.error("Error fetching formation:", err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchFormationData();
    console.log("ahlaaa")
  }, [FormationId, isEditMode]);

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate(`/SkillShareHub/ProfSpace/MyFormations/Details/${FormationId || newFormationId}`);
  };

  return (
    <div className={styles.editPage}>
      {showSuccessModal && (
        <div className={styles.successModal}>
          <div className={styles.successModal__content}>
            <MdCheckCircle className={styles.successModal__icon} />
            <h2 className={styles.successModal__title}>
              {isEditMode
                ? "Formation Updated Successfully!"
                : "Formation Created Successfully!"}
            </h2>
            <p className={styles.successModal__message}>
              {isEditMode
                ? "Your changes have been saved and the formation has been updated."
                : "Your new formation is ready to be shared with participants!"}
            </p>
            <button
              onClick={handleModalClose}
              className={styles.successModal__button}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      <div className={styles.header}>
        <button onClick={onCancel} className={styles.backButton}>
          <MdArrowBack size={20} />
          Back
        </button>
        <h1>{isEditMode ? "Edit Formation" : "Create Formation"}</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.editForm}>
        <div className={styles.formGrid}>
          <div className={styles.imageSection}>
            <div className={styles.imageUpload}>
              <label htmlFor="input-file" className={styles.dropArea}>
                <input
                  type="file"
                  id="input-file"
                  className={styles.fileInput}
                  onChange={handleImageChange}
                  accept="image/*"
                />
                <div className={styles.uploadView}>
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Uploaded preview"
                      className={styles.uploadedImage}
                    />
                  ) : (
                    <div className={styles.dropzoneContent}>
                      <MdUpload className={styles.dropzoneIcon} />
                      <p className={styles.dropzoneText}>
                        <span className={styles.browseLink}>Drag and drop</span>{" "}
                        or <span className={styles.browseLink}>click here</span>{" "}
                        to upload an image.
                      </p>
                      <p className={styles.dropzoneHint}>
                        Upload any image from your desktop
                      </p>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter formation title"
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category">Category</label>
              <CustomSelect
                label="Category"
                initialOptions={[
                  { label: "C", icon: JsIcon },
                  { label: "Java Script", icon: JsIcon },
                  { label: "Python", icon: JsIcon },
                  { label: "C++", icon: JsIcon },
                  { label: "Java", icon: JsIcon },
                  { label: "BI", icon: JsIcon },
                ]}
                isEditMode={isLoading || isEditMode}
                disabled={isLoading}
                value={formData.category}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description"
                rows="4"
                disabled={isLoading}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  disabled={isLoading || isEditMode}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="Seats">Seats</label>
                <input
                  type="number"
                  id="Seats"
                  name="Seats"
                  value={formData.Seats}
                  onChange={handleChange}
                  min="0"
                  max="800"
                  placeholder="0-800"
                  disabled={isLoading || isEditMode}
                />
              </div>

              <StatusCustomSelect
                formData={formData}
                setFormData={setFormData}
                isEditMode={isEditMode}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Processing...</span>
            ) : (
              <>
                <MdSave size={18} />
                {isEditMode ? "Save Changes" : "Create Formation"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

const StatusCustomSelect = ({
  formData,
  setFormData,
  isEditMode,
  disabled,
}) => {
  const allOptions = [
    { label: "Draft", value: "draft" },
    { label: "Upcoming", value: "upcoming" },
    { label: "Ongoing", value: "ongoing" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const options = isEditMode
    ? allOptions
    : allOptions.filter(
        (option) => !["completed", "cancelled"].includes(option.value)
      );

  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  const optionsRefs = useRef([]);
  const lastKeyPressTime = useRef(0);

  // Get the current selected index based on formData.status
  const selectedIndex = options.findIndex(
    (option) => option.value === formData.status
  );
  const selectedOption = options[selectedIndex >= 0 ? selectedIndex : 0];

  // Only update formData when the user explicitly selects an option
  const handleSelect = (index) => {
    if (disabled) return;
    const newValue = options[index].value;
    if (newValue !== formData.status) {
      setFormData((prev) => ({ ...prev, status: newValue }));
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && optionsRefs.current[selectedIndex]) {
      optionsRefs.current[selectedIndex].focus();
    }
  }, [isOpen, selectedIndex]);

  const handleKeyDown = (event) => {
    if (disabled) return;
    
    const now = Date.now();
    const timeSinceLastPress = now - lastKeyPressTime.current;

    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
    } else if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      if (event.key === "Enter" && isOpen) {
        handleSelect(selectedIndex);
      } else {
        setIsOpen(prev => !prev);
      }
    } else if (isOpen) {
      if (timeSinceLastPress < 150) return;
      lastKeyPressTime.current = now;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const newIndex = (selectedIndex + 1) % options.length;
        handleSelect(newIndex);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        const newIndex = (selectedIndex - 1 + options.length) % options.length;
        handleSelect(newIndex);
      } else if (event.key === "Home") {
        event.preventDefault();
        handleSelect(0);
      } else if (event.key === "End") {
        event.preventDefault();
        handleSelect(options.length - 1);
      }
    }
  };

  const statusColors = {
    draft: "#888",
    upcoming: "#4a90e2",
    ongoing: "#f5a623",
    completed: "#7ed321",
    cancelled: "#d0021b",
  };

  return (
    <div className={styles.formGroup}>
      <label id="status-label" htmlFor="status" className={styles.label}>
        Status
      </label>
      <div
        className={`${styles.customSelect} ${isOpen ? styles.open : ""} ${
          disabled ? styles.disabled : ""
        }`}
        ref={selectRef}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby="status-label"
        aria-controls="status-listbox"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
      >
        <div
          className={styles.selectedOption}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          style={{
            color: statusColors[selectedOption.value],
            fontWeight: 500,
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          <span>{selectedOption.label}</span>
          <span className={styles.selectArrow}>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path
                d="M1 1L6 6L11 1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </div>

        <ul
          className={`${styles.optionsList} ${isOpen ? styles.show : ""}`}
          id="status-listbox"
          role="listbox"
          aria-activedescendant={`option-${selectedIndex}`}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`option-${index}`}
              ref={(el) => (optionsRefs.current[index] = el)}
              className={`${styles.optionItem} ${
                selectedIndex === index ? styles.selected : ""
              }`}
              onClick={() => handleSelect(index)}
              role="option"
              aria-selected={selectedIndex === index}
              tabIndex={-1}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSelect(index);
                }
              }}
              style={{
                color: statusColors[option.value],
                fontWeight: selectedIndex === index ? 600 : 400,
              }}
            >
              {option.label}
              {selectedIndex === index && (
                <span className={styles.checkmark}>
                  <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                    <path
                      d="M1 5L5 9L13 1"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const CustomSelect = ({ label, initialOptions, disabled, value, onChange, isEditMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState(initialOptions);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [newOption, setNewOption] = useState("");
  const selectRef = useRef(null);
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [file, setFile] = useState(null);
  const [optionToUpdate, setOptionToUpdate] = useState(null);
  const [error, setError] = useState("");
  const [hasSelected, setHasSelected] = useState(false);

  useEffect(() => {
    const index = options.findIndex((option) => option.label === value);
    if (index !== -1) {
      setSelectedIndex(index);
      setHasSelected(true);
    }
  }, [value, options]);

  const handleFileChange = (event) => {
    if (disabled) return;
    const file = event.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setFile(fileURL);
      if (optionToUpdate !== null) {
        setOptions((prevOptions) =>
          prevOptions.map((option, index) =>
            index === optionToUpdate ? { ...option, icon: fileURL } : option
          )
        );
        setOptionToUpdate(null);
        setIsAddingOption(false);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (event) => {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      setIsOpen((prev) => !prev);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % options.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + options.length) % options.length);
    }
  };

  const handleSelect = (index) => {
    if (disabled) return;
    setSelectedIndex(index);
    setIsOpen(false);
    setIsAddingOption(false);
    onChange(options[index].label);
    setHasSelected(true);
    if (!options[index].icon) {
      setOptionToUpdate(index);
      setIsAddingOption(true);
    }
  };

  const handleAddOption = () => {
    if (disabled) return;
    if (newOption.trim() === "") {
      setError("Option label is required.");
    } else {
      const newOptionObj = { label: newOption, icon: "" };
      setOptions([...options, newOptionObj]);
      setSelectedIndex(options.length);
      setNewOption("");
      setIsAddingOption(false);
      setError("");
    }
  };

  return (
    <div className="all-select-and-upload">
      <div
        className={`custom-select ${disabled ? "disabled" : ""}`}
        ref={selectRef}
      >
        <div
          className="select-header"
          tabIndex={disabled ? -1 : 0}
          role="button"
          aria-expanded={isOpen}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
        >
          <div className="select-header-option">
            {options[selectedIndex]?.icon ? (
              <img
                src={options[selectedIndex].icon}
                alt=""
                className="option-icon"
              />
            ) : (
              <span className="no-icon">No Image</span>
            )}
            {(!isEditMode && !hasSelected) ? "Select Category" : options[selectedIndex]?.label}
          </div>
          <span className={`arrow ${isOpen ? "open" : ""}`}>▼</span>
        </div>
        {isOpen && !disabled && (
          <div className="select-options">
            <div
              id="option-bg"
              style={{ top: `${selectedIndex * 40}px` }}
            ></div>
            {options.map((option, index) => (
              <div
                key={index}
                className={`option ${index === selectedIndex ? "active" : ""}`}
                onClick={() => handleSelect(index)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {option.icon ? (
                  <img src={option.icon} alt="" className="option-icon" />
                ) : (
                  <span className="no-icon">No Image</span>
                )}
                {option.label}
              </div>
            ))}
            <div className="add-option">
              <input
                type="text"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Add new option"
                disabled={disabled}
              />
              <button onClick={handleAddOption} disabled={disabled}>
                Add
              </button>
              {error && <div className="error-message">{error}</div>}
            </div>
          </div>
        )}
      </div>
      {isAddingOption && !disabled && (
        <div className="upload-section">
          <label>
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              accept="image/*"
              hidden
              disabled={disabled}
            />
            {file ? (
              <div className="uploaded-image">
                <img
                  src={file}
                  alt="Uploaded preview"
                  className="upload-preview"
                />
              </div>
            ) : (
              <div className="upload-content">
                <img
                  src={UploadImageIcon}
                  alt="Upload icon"
                  className="upload-icon"
                />
                <span className="upload-text">Upload logo</span>
              </div>
            )}
          </label>
        </div>
      )}
    </div>
  );
};

export default EditFormation;
