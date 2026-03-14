import React, { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import {
  FiPlus,
  FiTrash2,
  FiUpload,
  FiFileText,
  FiAward,
  FiBriefcase,
  FiBook,
  FiGlobe,
} from "react-icons/fi";
import { motion } from "framer-motion";
import "./CvSettings.css";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { dropPlugin } from "@react-pdf-viewer/drop";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/drop/lib/styles/index.css";
import UploadIcon from "./../images/UploadIcon.png";

const CvCompletionMeter = ({ completion }) => {
  return (
    <div className="CV-settings-completion-meter">
      <svg className="CV-settings-completion-svg" viewBox="0 0 36 36">
        <path
          className="CV-settings-completion-circle-bg"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className="CV-settings-completion-circle"
          strokeDasharray={`${completion}, 100`}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <div className="CV-settings-completion-value">{completion}%</div>
    </div>
  );
};

const ExperienceItem = ({ index, register, errors, remove }) => (
  <div className="CV-settings-form-group" style={{ position: "relative" }}>
    <div className="CV-settings-form-grid">
      <div className="CV-settings-form-grid-element">
        <label>Job Title*</label>
        <input
          {...register(`experience.${index}.title`, {
            required: "Title is required",
          })}
          className={`CV-settings-form-input ${
            errors.experience?.[index]?.title ? "CV-settings-error" : ""
          }`}
        />
        {errors.experience?.[index]?.title && (
          <span className="CV-settings-error-message">
            {errors.experience[index].title.message}
          </span>
        )}
      </div>
      <div className="CV-settings-form-grid-element">
        <label>Company*</label>
        <input
          {...register(`experience.${index}.company`, {
            required: "Company is required",
          })}
          className={`CV-settings-form-input ${
            errors.experience?.[index]?.company ? "CV-settings-error" : ""
          }`}
        />
        {errors.experience?.[index]?.company && (
          <span className="CV-settings-error-message">
            {errors.experience[index].company.message}
          </span>
        )}
      </div>
    </div>

    <div className="CV-settings-form-grid">
      <div className="CV-settings-form-grid-element">
        <label>Start Date*</label>
        <input
          type="date"
          {...register(`experience.${index}.startDate`, {
            required: "Start date is required",
          })}
          className={`CV-settings-form-input ${
            errors.experience?.[index]?.startDate ? "CV-settings-error" : ""
          }`}
        />
        {errors.experience?.[index]?.startDate && (
          <span className="CV-settings-error-message">
            {errors.experience[index].startDate.message}
          </span>
        )}
      </div>
      <div className="CV-settings-form-grid-element">
        <label>End Date</label>
        <input
          type="date"
          {...register(`experience.${index}.endDate`)}
          className="CV-settings-form-input"
        />
        <div className="CV-settings-input-hint">
          Leave empty if currently working here
        </div>
      </div>
    </div>

    <div className="CV-settings-form-group">
      <label>Description</label>
      <textarea
        {...register(`experience.${index}.description`)}
        className="CV-settings-form-textarea"
        rows={4}
      />
    </div>

    <button
      type="button"
      onClick={() => remove(index)}
      className="CV-settings-remove-button"
    >
      <FiTrash2 />
    </button>
  </div>
);

const EducationItem = ({ index, register, errors, remove }) => (
  <div className="CV-settings-form-group" style={{ position: "relative" }}>
    <div className="CV-settings-form-grid">
      <div className="CV-settings-form-grid-element">
        <label>Degree*</label>
        <input
          {...register(`education.${index}.degree`, {
            required: "Degree is required",
          })}
          className={`CV-settings-form-input ${
            errors.education?.[index]?.degree ? "CV-settings-error" : ""
          }`}
        />
        {errors.education?.[index]?.degree && (
          <span className="CV-settings-error-message">
            {errors.education[index].degree.message}
          </span>
        )}
      </div>
      <div className="CV-settings-form-grid-element">
        <label>Institution*</label>
        <input
          {...register(`education.${index}.institution`, {
            required: "Institution is required",
          })}
          className={`CV-settings-form-input ${
            errors.education?.[index]?.institution ? "CV-settings-error" : ""
          }`}
        />
        {errors.education?.[index]?.institution && (
          <span className="CV-settings-error-message">
            {errors.education[index].institution.message}
          </span>
        )}
      </div>
    </div>

    <div className="CV-settings-form-grid">
      <div className="CV-settings-form-grid-element">
        <label>Field of Study</label>
        <input
          {...register(`education.${index}.field`)}
          className="CV-settings-form-input"
        />
      </div>
      <div className="CV-settings-form-grid-element">
        <label>Graduation Year</label>
        <input
          type="date"
          {...register(`education.${index}.graduationYear`)}
          className="CV-settings-form-input"
        />
      </div>
    </div>

    <button
      type="button"
      onClick={() => remove(index)}
      className="CV-settings-remove-button"
    >
      <FiTrash2 />
    </button>
  </div>
);

const SkillItem = ({ index, register, errors, remove }) => (
  <div className="CV-settings-form-group" style={{ position: "relative" }}>
    <div className="CV-settings-form-grid">
      <div>
        <label>Skill Name*</label>
        <input
          {...register(`skills.${index}.name`, {
            required: "Skill name is required",
          })}
          className={`CV-settings-form-input ${
            errors.skills?.[index]?.name ? "CV-settings-error" : ""
          }`}
        />
        {errors.skills?.[index]?.name && (
          <span className="CV-settings-error-message">
            {errors.skills[index].name.message}
          </span>
        )}
      </div>
      <div className="CV-settings-form-grid-element">
        <label>Proficiency Level*</label>
        <select
          {...register(`skills.${index}.level`, {
            required: "Level is required",
          })}
          className={`CV-settings-form-input ${
            errors.skills?.[index]?.level ? "CV-settings-error" : ""
          }`}
        >
          <option value="">Select level</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Expert">Expert</option>
        </select>
        {errors.skills?.[index]?.level && (
          <span className="CV-settings-error-message">
            {errors.skills[index].level.message}
          </span>
        )}
      </div>
    </div>

    <button
      type="button"
      onClick={() => remove(index)}
      className="CV-settings-remove-button"
    >
      <FiTrash2 />
    </button>
  </div>
);

const LanguageItem = ({ index, register, errors, remove }) => (
  <div className="CV-settings-form-group" style={{ position: "relative" }}>
    <div className="CV-settings-form-grid">
      <div className="CV-settings-form-grid-element">
        <label>Language*</label>
        <input
          {...register(`languages.${index}.name`, {
            required: "Language is required",
          })}
          className={`CV-settings-form-input ${
            errors.languages?.[index]?.name ? "CV-settings-error" : ""
          }`}
        />
        {errors.languages?.[index]?.name && (
          <span className="CV-settings-error-message">
            {errors.languages[index].name.message}
          </span>
        )}
      </div>
      <div className="CV-settings-form-grid-element">
        <label>Proficiency Level*</label>
        <select
          {...register(`languages.${index}.level`, {
            required: "Level is required",
          })}
          className={`CV-settings-form-input ${
            errors.languages?.[index]?.level ? "CV-settings-error" : ""
          }`}
        >
          <option value="">Select level</option>
          <option value="Basic">Basic</option>
          <option value="Conversational">Conversational</option>
          <option value="Fluent">Fluent</option>
          <option value="Native">Native</option>
        </select>
        {errors.languages?.[index]?.level && (
          <span className="CV-settings-error-message">
            {errors.languages[index].level.message}
          </span>
        )}
      </div>
    </div>

    <button
      type="button"
      onClick={() => remove(index)}
      className="CV-settings-remove-button"
    >
      <FiTrash2 />
    </button>
  </div>
);

const CvSettings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cvCompletion, setCvCompletion] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const token = localStorage.getItem("token");
  const dropAreaRef = useRef(null);
  const dropPluginInstance = dropPlugin();

  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
    setValue,
  } = useForm({
    defaultValues: {
      cvFile: null,
      experience: [],
      education: [],
      skills: [],
      languages: [],
    },
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({
    control,
    name: "experience",
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control,
    name: "education",
  });

  const {
    fields: skillsFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control,
    name: "skills",
  });

  const {
    fields: languagesFields,
    append: appendLanguage,
    remove: removeLanguage,
  } = useFieldArray({
    control,
    name: "languages",
  });

  const uploadRef = useRef(null);
  const experienceRef = useRef(null);
  const educationRef = useRef(null);
  const skillsRef = useRef(null);
  const languagesRef = useRef(null);

  const calculateCompletion = (data) => {
    let completion = 0;
    if (data.cvFile) completion += 30;
    if (data.experience?.length > 0) completion += 20;
    if (data.education?.length > 0) completion += 20;
    if (data.skills?.length > 0) completion += 15;
    if (data.languages?.length > 0) completion += 15;
    return Math.min(100, completion);
  };

  useEffect(() => {
    const fetchCvData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/cv",
          headers
        );
        const cvData = response.data;

        reset({
          cvFile: cvData.cvFile || null,
          experience: cvData.experience || [],
          education: cvData.education || [],
          skills: cvData.skills || [],
          languages: cvData.languages || [],
        });

        setCvCompletion(calculateCompletion(cvData));
        setLoading(false);
      } catch (err) {
        console.error("Error loading CV:", err);
        setError(err.response?.data?.message || "Failed to load CV data");
        setLoading(false);
      }
    };

    fetchCvData();
  }, [reset]);

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
    }
  };

  const handleFileChange = (file) => {
    if (file && file.type === "application/pdf") {
      const fileUrl = URL.createObjectURL(file);
      setFile({
        file,
        url: fileUrl,
        type: "pdf",
      });
      handleCvUpload(file);
    }
  };

  const handleCvUpload = (file) => {
    setValue("cvFile", file, { shouldDirty: true });
    setCvCompletion((prev) => Math.min(100, prev + 30));
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const onSubmit = async (data) => {
    setError(null);
    try {
      const formData = new FormData();

      if (data.cvFile instanceof File) {
        formData.append("cv", data.cvFile);
      }

      formData.append("experience", JSON.stringify(data.experience || []));
      formData.append("education", JSON.stringify(data.education || []));
      formData.append("skills", JSON.stringify(data.skills || []));
      formData.append("languages", JSON.stringify(data.languages || []));

      const response = await axios.put(
        "http://localhost:5000/api/cv",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCvCompletion(calculateCompletion(response.data));
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error updating CV:", err);
      setError(err.response?.data?.message || "Failed to update CV");
    }
  };

  if (loading) {
    return (
      <div className="CV-settings-loading-container">
        <div className="CV-settings-loading-spinner"></div>
        <p>Loading your CV data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="CV-settings-error-container">
        <p className="CV-settings-error-message">{error}</p>
        <button
          className="CV-settings-save-button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="CV-settings-container">
      <div className="CV-settings-profile-content">
        <div className="CV-settings-profile-sidebar">
          <div className="CV-settings-profile-card">
            <h3>CV Completion</h3>
            <p className="CV-settings-profile-title">
              {cvCompletion === 100 ? "Complete!" : "In Progress"}
            </p>
            <CvCompletionMeter completion={cvCompletion} />
            <div className="CV-settings-completion-text">
              {cvCompletion === 100 ? (
                <p>Your CV is ready! 🎉</p>
              ) : (
                <p>Complete all sections for best results</p>
              )}
            </div>
          </div>
          <nav className="CV-settings-profile-nav">
            <button
              className="CV-settings-nav-item"
              onClick={() => scrollToSection(experienceRef)}
            >
              <FiBriefcase className="CV-settings-nav-icon" />
              Experience
            </button>
            <button
              className="CV-settings-nav-item"
              onClick={() => scrollToSection(educationRef)}
            >
              <FiBook className="CV-settings-nav-icon" />
              Education
            </button>
            <button
              className="CV-settings-nav-item"
              onClick={() => scrollToSection(skillsRef)}
            >
              <FiAward className="CV-settings-nav-icon" />
              Skills
            </button>
            <button
              className="CV-settings-nav-item"
              onClick={() => scrollToSection(languagesRef)}
            >
              <FiGlobe className="CV-settings-nav-icon" />
              Languages
            </button>
            <button
              className="CV-settings-nav-item"
              onClick={() => scrollToSection(uploadRef)}
            >
              <FiUpload className="CV-settings-nav-icon" />
              CV Upload
            </button>
          </nav>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="CV-settings-profile-form"
        >
          <div className="CV-settings-form-content">
            <div ref={experienceRef} className="CV-settings-form-section">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h2>
                  <FiBriefcase className="CV-settings-section-icon" /> Work
                  Experience
                </h2>
                {experienceFields.map((field, index) => (
                  <ExperienceItem
                    key={field.id}
                    index={index}
                    register={register}
                    errors={errors}
                    remove={removeExperience}
                  />
                ))}
                <button
                  type="button"
                  onClick={() =>
                    appendExperience({
                      title: "",
                      company: "",
                      startDate: "",
                      endDate: "",
                      description: "",
                    })
                  }
                  className="CV-settings-save-button"
                  style={{ background: "#4cc9f0" }}
                >
                  <FiPlus /> Add Experience
                </button>
              </motion.div>
            </div>

            <div ref={educationRef} className="CV-settings-form-section">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h2>
                  <FiBook className="CV-settings-section-icon" /> Education
                </h2>
                {educationFields.map((field, index) => (
                  <EducationItem
                    key={field.id}
                    index={index}
                    register={register}
                    errors={errors}
                    remove={removeEducation}
                  />
                ))}
                <button
                  type="button"
                  onClick={() =>
                    appendEducation({
                      degree: "",
                      institution: "",
                      field: "",
                      graduationYear: "",
                    })
                  }
                  className="CV-settings-save-button"
                  style={{ background: "#4cc9f0" }}
                >
                  <FiPlus /> Add Education
                </button>
              </motion.div>
            </div>

            <div ref={skillsRef} className="CV-settings-form-section">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h2>
                  <FiAward className="CV-settings-section-icon" /> Skills
                </h2>
                {skillsFields.map((field, index) => (
                  <SkillItem
                    key={field.id}
                    index={index}
                    register={register}
                    errors={errors}
                    remove={removeSkill}
                  />
                ))}
                <button
                  type="button"
                  onClick={() =>
                    appendSkill({
                      name: "",
                      level: "",
                    })
                  }
                  className="CV-settings-save-button"
                  style={{ background: "#4cc9f0" }}
                >
                  <FiPlus /> Add Skill
                </button>
              </motion.div>
            </div>

            <div ref={languagesRef} className="CV-settings-form-section">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h2>
                  <FiGlobe className="CV-settings-section-icon" /> Languages
                </h2>
                {languagesFields.map((field, index) => (
                  <LanguageItem
                    key={field.id}
                    index={index}
                    register={register}
                    errors={errors}
                    remove={removeLanguage}
                  />
                ))}
                <button
                  type="button"
                  onClick={() =>
                    appendLanguage({
                      name: "",
                      level: "",
                    })
                  }
                  className="CV-settings-save-button"
                  style={{ background: "#4cc9f0" }}
                >
                  <FiPlus /> Add Language
                </button>
              </motion.div>
            </div>

            <div ref={uploadRef} className="CV-settings-form-section">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h2>
                  <FiUpload className="CV-settings-section-icon" /> CV Upload
                </h2>
                <div className="CV-settings-form-group">
                  <div className="drop-section" style={{ margin: "0 auto" }}>
                    <label
                      htmlFor="cv-input-file"
                      id="drop-area"
                      ref={dropAreaRef}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={isDragging ? "dragging" : ""}
                    >
                      <input
                        type="file"
                        id="cv-input-file"
                        hidden
                        onChange={(e) => handleFileChange(e.target.files[0])}
                        accept="application/pdf"
                      />
                      <div id="upload-view">
                        {file ? (
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
                        ) : (
                          <div className="dropzone-content">
                            <img
                              src={UploadIcon}
                              alt="Dropzone Icon"
                              className="dropzone-icon"
                            />
                            <p className="dropzone-text">
                              <span className="browse-link">Drag and drop</span>{" "}
                              or <span className="browse-link">click here</span>{" "}
                              to upload your CV
                            </p>
                            <p className="dropzone-hint">
                              PDF files only (max 5MB)
                            </p>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </motion.div>
            </div>

            {error && <div className="CV-settings-server-error">{error}</div>}
          </div>

          <div className="CV-settings-form-actions">
            <button
              type="submit"
              className="CV-settings-save-button"
              disabled={!isDirty}
              style={{ margin: "0 auto" }}
            >
              Save CV
            </button>
          </div>
        </form>
      </div>

      {showSuccessModal && (
        <div className="CV-settings-modal-overlay">
          <motion.div
            className="CV-settings-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="CV-settings-modal-icon">
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                />
              </svg>
            </div>
            <h3>CV Updated Successfully!</h3>
            <p>Your CV has been saved successfully.</p>
            <button
              className="CV-settings-modal-button"
              onClick={() => setShowSuccessModal(false)}
            >
              Continue
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CvSettings;
