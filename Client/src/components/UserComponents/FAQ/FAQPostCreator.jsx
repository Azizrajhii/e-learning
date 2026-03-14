import { useEffect, useState } from "react";
import "./PostCreator.css";
import pdp from "./../images/pdp.jpg";
import MiniPollIcon from "./../images/MiniPollIcon.png";
import MiniVideoIcon from "./../images/MiniVideoIcon.png";
import MiniPhotoIcon from "./../images/MiniPhotoIcon.png";
import MiniLinkIcon from "./../images/MiniLinkIcon.png";
import useFetchUser from "./../utils/useFetchUser.jsx";
import GetProfilePicture from "./../utils/GetProfilePicture.jsx";
import { useNavigate } from "react-router-dom";
import { BsEmojiSmile } from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";
import { useTranslation } from "react-i18next";
import axios from 'axios';

const PostModal = ({
  userData,
  postText,
  setPostText,
  setShowModal,
  selectedType,
  onPostCreated
}) => {
  const { t, i18n } = useTranslation();
  const [showPhotoUploader, setShowPhotoUploader] = useState(false);
  const [showVideoUploader, setShowVideoUploader] = useState(false);
  const [showLinkUploader, setShowLinkUploader] = useState(false);
  const [showPollUploader, setShowPollUploader] = useState(false);
  const [postBody, setPostBody] = useState("");
  const [showEmojiPickerForInput, setShowEmojiPickerForInput] = useState(false);
  const [showEmojiPickerForTextarea, setShowEmojiPickerForTextarea] = useState(false);
  const [showTitleAndContent, setShowTitleAndContent] = useState(true);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", ""]);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [uploadedVideoName, setUploadedVideoName] = useState(null);
  const [link, setLink] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const token = localStorage.getItem("token");


  useEffect(() => {
    const savedLangCode = localStorage.getItem("app-language-code") || "en";
    i18n.changeLanguage(savedLangCode);
  }, [i18n]);

  useEffect(() => {
    if (selectedType === "video") {
      handleVideoClick();
    } else if (selectedType === "photo") {
      handlePhotoClick();
    } else if (selectedType === "poll") {
      handlePollClick();
    } else if (selectedType === "link") {
      handleLinkClick();
    }
  }, [selectedType]);

  const handleEmojiClickForInput = (emojiObject) => {
    setPostText((prevText) => prevText + emojiObject.emoji);
    setShowEmojiPickerForInput(false);
  };

  const handleEmojiClickForTextarea = (emojiObject) => {
    setPostBody((prevBody) => prevBody + emojiObject.emoji);
    setShowEmojiPickerForTextarea(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowPhotoUploader(false);
  };

  const handlePhotoClick = () => {
    setShowPhotoUploader(true);
    setShowLinkUploader(false);
    setShowVideoUploader(false);
    setShowPollUploader(false);
    setShowTitleAndContent(true);
    setVideoFile(null);
    setUploadedVideo(null);
    setLink('');
    setQuestion('');
    setOptions(['', '', '']);
  };

  const handleLinkClick = () => {
    setShowLinkUploader(true);
    setShowPhotoUploader(false);
    setShowVideoUploader(false);
    setShowPollUploader(false);
    setShowTitleAndContent(true);
    setVideoFile(null);
    setUploadedVideo(null);
    setPhotoFile(null);
    setUploadedPhoto(null);
    setQuestion('');
    setOptions(['', '', '']);
  };

  const handleVideoClick = () => {
    setShowVideoUploader(true);
    setShowLinkUploader(false);
    setShowPhotoUploader(false);
    setShowPollUploader(false);
    setShowTitleAndContent(true);
    setVideoFile(null);
    setUploadedVideo(null);
    setQuestion('');
    setOptions(['', '', '']);
    setLink('');
  };

  const handlePollClick = () => {
    setShowPollUploader(true);
    setShowTitleAndContent(true);
    setShowLinkUploader(false);
    setShowPhotoUploader(false);
    setShowVideoUploader(false);
    setVideoFile(null);
    setUploadedVideo(null);
    setPhotoFile(null);
    setUploadedPhoto(null);
    setLink('');
  };

  const handleSubmit = async () => {
    if (isUploading) return; // Prevent duplicate submissions

    // Validate title and content
    if (!postText.trim() && !postBody.trim()) {
      setNotificationMessage('Title and content are required.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    // Check media count
    const mediaFields = [];
    if (photoFile) mediaFields.push('photo');
    if (videoFile) mediaFields.push('video');
    if (showPollUploader && question && options.filter(opt => opt.trim()).length >= 2) mediaFields.push('poll');
    if (link) mediaFields.push('link');

    if (mediaFields.length > 1) {
      setNotificationMessage('Only one media type allowed.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    setIsUploading(true);

    try {
      // Prepare FormData
      const formData = new FormData();
      formData.append('title', postText);
      formData.append('content', postBody);

      if (photoFile) {
        formData.append('file', photoFile);
      } else if (videoFile) {
        formData.append('file', videoFile);
      }

      if (showPollUploader) {
        const validOptions = options.filter(opt => opt.trim() !== '');
        if (question.trim() === '' || validOptions.length < 2) {
          setNotificationMessage('Poll requires a question and at least two options.');
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 300);
          return;
        }

        const pollData = {
          question,
          answers: validOptions.map((label, index) => ({
            _id: "", // a, b, c, etc.
            label,
            nbChosen: []
          }))
        };

        formData.append('poll', JSON.stringify(pollData));
      }

      if (link) {
        formData.append('link', link);
      }

      const response = await axios.post('http://localhost:5000/api/articles', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      if (onPostCreated) {
        onPostCreated();
      }

      // Show success notification
      setNotificationMessage('Post created successfully!');
      setShowNotification(true);

      // Reset on success
      setTimeout(() => {
        setShowModal(false);
        setPostText('');
        setPostBody('');
        setPhotoFile(null);
        setUploadedPhoto(null);
        setVideoFile(null);
        setUploadedVideo(null);
        setLink('');
        setQuestion('');
        setOptions(['', '', '']);
        setIsUploading(false);
        setShowNotification(false);
      }, 1500);

      console.log('Post created:', response.data);
    } catch (error) {
      console.error('Error creating post:', error.response?.data || error.message);
      setNotificationMessage('Error creating post');
      setShowNotification(true);
      setTimeout(() => {
        setIsUploading(false);
        setShowNotification(false);
      }, 3000);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;

    // If user types in the last input, add a new one
    const isLast = index === options.length - 1;
    const isTyping = value.trim() !== "";

    if (isLast && isTyping) {
      setOptions([...newOptions, ""]);
      return;
    }

    // If user clears the second-to-last and last is empty, remove last
    const isSecondToLast = index === options.length - 2;
    const lastIsEmpty = newOptions[options.length - 1].trim() === "";
    const secondToLastIsEmpty = value.trim() === "";

    if (isSecondToLast && secondToLastIsEmpty && lastIsEmpty) {
      newOptions.pop(); // remove last
    }

    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  return (
    <>
      {showNotification && (
        <div className="faq-PostCreator-notification">
          {notificationMessage}
        </div>
      )}
      <div className="faq-PostCreator-modalOverlay">
        <div className="faq-PostCreator-modalContent">
          <div className="faq-PostCreator-modalHeader">
            <h3>{t("FAQPostCreator.create_post")}</h3>
            <button
              className="faq-PostCreator-closeButton"
              onClick={handleCloseModal}
              disabled={isUploading}

            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="#9197a3">
                <path d="M18.707 5.293a1 1 0 00-1.414 0L12 10.586 6.707 5.293a1 1 0 00-1.414 1.414L10.586 12l-5.293 5.293a1 1 0 001.414 1.414L12 13.414l5.293 5.293a1 1 0 001.414-1.414L13.414 12l5.293-5.293a1 1 0 000-1.414z" />
              </svg>
            </button>
          </div>

          <div className="faq-PostCreator-userInfo">
            <div className="faq-PostCreator-modalProfilePic">
              <GetProfilePicture data={userData} className="" />
            </div>
            <div className="faq-PostCreator-userName">
              {userData?.lastName} {userData?.name}
            </div>
          </div>

          {showTitleAndContent && (
            <div className="faq-PostCreator-textAreaContainer">
              <div className="faq-PostCreator-Writnig-with-emoji">
                <input
                  type="text"
                  placeholder={`${t("FAQPostCreator.whats_on_your_mind")} ${userData?.name || "Houssem"
                    } ?`}
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  className="faq-PostCreator-inputTitle"
                />
                <button
                  className="emoji-button"
                  onClick={() =>
                    setShowEmojiPickerForInput(!showEmojiPickerForInput)
                  }
                >
                  <BsEmojiSmile size={24} style={{ color: "#555555" }} />
                </button>
              </div>
              <div className="faq-postcreator-line"></div>
              <div
                className="faq-PostCreator-Writnig-with-emoji relative"
                style={{ alignItems: "end" }}
              >
                <textarea
                  className="faq-PostCreator-textArea"
                  placeholder={t("FAQPostCreator.body_placeholder")}
                  value={postBody}
                  onChange={(e) => setPostBody(e.target.value)}
                />
                <button
                  className="emoji-button"
                  onClick={() =>
                    setShowEmojiPickerForTextarea(!showEmojiPickerForTextarea)
                  }
                >
                  <BsEmojiSmile size={24} style={{ color: "#555555" }} />
                </button>

                {showEmojiPickerForTextarea && (
                  <div
                    className="emoji-picker-container"
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      marginTop: "8px",
                      zIndex: 9999,
                      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
                      borderRadius: "8px",
                    }}
                  >
                    <EmojiPicker onEmojiClick={handleEmojiClickForTextarea} />
                  </div>
                )}
              </div>
            </div>
          )}

          {showPhotoUploader && (
            <div className="faq-PostCreator-contentUploader Upload-PhotoOrVideo">
              <button
                className="faq-PostCreator-closeContentUploader"
                onClick={() => {
                  setShowPhotoUploader(false);
                  setUploadedPhoto(null);
                  setUploadedFileName(null);
                }}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#9197a3">
                  <path d="M18.707 5.293a1 1 0 00-1.414 0L12 10.586 6.707 5.293a1 1 0 00-1.414 1.414L10.586 12l-5.293 5.293a1 1 0 001.414 1.414L12 13.414l5.293 5.293a1 1 0 001.414-1.414L13.414 12l5.293-5.293a1 1 0 000-1.414z" />
                </svg>
              </button>

              <label
                className="faq-PostCreator-photoUploaderContent"
                htmlFor="photoUploadInput"
              >
                {!uploadedPhoto ? (
                  <>
                    <div className="faq-PostCreator-photoIcon">
                      <svg
                        viewBox="0 0 24 24"
                        width="40"
                        height="40"
                        fill="#65676B"
                      >
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5 11 17h2l3.5-4.5L20 19H4l4.5-5.5zM14 9c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" />
                      </svg>
                    </div>
                    <div className="faq-PostCreator-uploadText">
                      {t("FAQPostCreator.add_photo")}
                    </div>
                    <div className="faq-PostCreator-dragText">
                      {t("FAQPostCreator.or_drag_and_drop")}
                    </div>
                  </>
                ) : (
                  <div className="faq-PostCreator-imagePreview">
                    <img
                      src={uploadedPhoto}
                      alt="Preview"
                      className="faq-PostCreator-previewImg"
                    />
                  </div>
                )}
                <input
                  type="file"
                  id="photoUploadInput"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setUploadedPhoto(reader.result);
                      };
                      reader.readAsDataURL(file);
                      setPhotoFile(file);
                      // Clear other media
                      setVideoFile(null);
                      setUploadedVideo(null);
                      setLink('');
                      setShowPollUploader(false);
                      setQuestion('');
                      setOptions(['', '', '']);
                    }
                  }}
                  className="faq-PostCreator-fileInput-upload"
                />
              </label>
            </div>
          )}

          {showVideoUploader && (
            <div className="faq-PostCreator-contentUploader Upload-PhotoOrVideo">
              <button
                className="faq-PostCreator-closeContentUploader"
                onClick={() => {
                  setShowVideoUploader(false);
                  setUploadedVideo(null);
                  setUploadedVideoName(null);
                }}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#9197a3">
                  <path d="M18.707 5.293a1 1 0 00-1.414 0L12 10.586 6.707 5.293a1 1 0 00-1.414 1.414L10.586 12l-5.293 5.293a1 1 0 001.414 1.414L12 13.414l5.293 5.293a1 1 0 001.414-1.414L13.414 12l5.293-5.293a1 1 0 000-1.414z" />
                </svg>
              </button>

              <label
                className="faq-PostCreator-photoUploaderContent"
                htmlFor="videoUploadInput"
              >
                {!uploadedVideo ? (
                  <>
                    <input
                      type="file"
                      id="videoUploadInput"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setUploadedVideo(url);
                          setVideoFile(file);
                          // Clear other media
                          setPhotoFile(null);
                          setUploadedPhoto(null);
                          setLink('');
                          setShowPollUploader(false);
                          setQuestion('');
                          setOptions(['', '', '']);
                        }
                      }}
                      className="faq-PostCreator-fileInput-upload"
                    />
                    <div className="faq-PostCreator-photoIcon">
                      <svg
                        viewBox="0 0 24 24"
                        width="40"
                        height="40"
                        fill="#65676B"
                      >
                        <path d="M10 16.5l6-4.5-6-4.5v9z" />
                        <path d="M21 6.5v11c0 1.38-1.12 2.5-2.5 2.5h-13C4.12 20.5 3 19.38 3 18V6c0-1.38 1.12-2.5 2.5-2.5h13c1.38 0 2.5 1.12 2.5 2.5zM5 6v12h14V6H5z" />
                      </svg>
                    </div>
                    <div className="faq-PostCreator-uploadText">
                      {t("FAQPostCreator.add_video")}
                    </div>
                    <div className="faq-PostCreator-dragText">
                      {t("FAQPostCreator.or_drag_and_drop")}
                    </div>
                  </>
                ) : (
                  <div className="faq-PostCreator-videoPreview">
                    <video
                      src={uploadedVideo}
                      controls
                      className="faq-PostCreator-previewVideo"
                    />
                  </div>
                )}
              </label>
            </div>
          )}

          {showPollUploader && (
            <div className="faq-PostCreator-contentUploader">
              <button
                className="faq-PostCreator-closeContentUploader"
                onClick={() => {
                  setShowPollUploader(false), setShowTitleAndContent(true);
                }}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#9197a3">
                  <path d="M18.707 5.293a1 1 0 00-1.414 0L12 10.586 6.707 5.293a1 1 0 00-1.414 1.414L10.586 12l-5.293 5.293a1 1 0 001.414 1.414L12 13.414l5.293 5.293a1 1 0 001.414-1.414L13.414 12l5.293-5.293a1 1 0 000-1.414z" />
                </svg>
              </button>
              <div className="faq-PostCreator-PollUploaderContent ">
                <input
                  type="text"
                  placeholder={t('FAQPostCreator.add_question')}
                  className="faq-PostCreator-fileInput Poll-questionInput"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                {options.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    className="faq-PostCreator-fileInput mt-2"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={
                      index === 0
                        ? "Option 1"
                        : index === 1
                          ? "Option 2"
                          : `${t('FAQPostCreator.add_option')}`
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {showLinkUploader && (
            <div
              className="faq-PostCreator-contentUploader"
              style={{ padding: "0 40px 0 0" }}
            >
              <button
                className="faq-PostCreator-closeContentUploader"
                onClick={() => setShowLinkUploader(false)}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#9197a3">
                  <path d="M18.707 5.293a1 1 0 00-1.414 0L12 10.586 6.707 5.293a1 1 0 00-1.414 1.414L10.586 12l-5.293 5.293a1 1 0 001.414 1.414L12 13.414l5.293 5.293a1 1 0 001.414-1.414L13.414 12l5.293-5.293a1 1 0 000-1.414z" />
                </svg>
              </button>
              <input
                type="url"
                placeholder={t('FAQPostCreator.Paste_your_link_here')}
                className="faq-PostCreator-fileInput"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
          )}

          <div className="faq-PostCreator-addToPost">
            <div className="faq-PostCreator-addToPostText">
              {t('FAQPostCreator.Add_to_your_post')}
            </div>
            <div className="faq-PostCreator-addToPostOptions">
              <button
                className="faq-PostCreator-addOption"
                onClick={handlePhotoClick}
                disabled={isUploading}

              >
                <img
                  src={MiniPhotoIcon}
                  alt="Photo"
                  className="faq-PostCreator-optionIcon"
                />
              </button>
              <button
                className="faq-PostCreator-addOption"
                onClick={handleVideoClick}
              >
                <img
                  src={MiniVideoIcon}
                  alt="Photo"
                  className="faq-PostCreator-optionIcon"
                />
              </button>
              <button
                className="faq-PostCreator-addOption"
                onClick={handlePollClick}
              >
                <img
                  src={MiniPollIcon}
                  alt="Photo"
                  className="faq-PostCreator-optionIcon"
                />
              </button>
              <button
                className="faq-PostCreator-addOption"
                onClick={handleLinkClick}
              >
                <img
                  src={MiniLinkIcon}
                  alt="Photo"
                  className="faq-PostCreator-optionIcon"
                />
              </button>
            </div>
          </div>
          <button
            className="faq-PostCreator-postButton"
            onClick={handleSubmit}
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="faq-PostCreator-loadingIndicator">
                <div className="faq-PostCreator-spinner"></div>
                Uploading...
              </div>
            ) : (
              t("FAQPostCreator.post")
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default function PostCreator({ onPostCreated }) {
  const [postText, setPostText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { data: userData, loading, error } = useFetchUser();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const savedLangCode = localStorage.getItem("app-language-code") || "en";
    i18n.changeLanguage(savedLangCode);
  }, [i18n]);

  const handleOpenModal = (type) => {
    setSelectedType(type);
    setShowModal(true);
  };

  const handleProfileClick = () => {
    navigate(`/SkillShareHub/Profile/${userData?._id}`);
  };


  return (
    <div className="faq-PostCreator-container">
      <div className="faq-PostCreator-header">
        <div
          className="faq-PostCreator-profilePicture"
          onClick={handleProfileClick}
          style={{ cursor: "pointer" }}
        >
          <GetProfilePicture data={userData} className="" />
        </div>
        <div className="faq-PostCreator-inputWrapper">
          <input
            type="text"
            placeholder={`${t("FAQPostCreator.whats_on_your_mind")} ${userData?.name || "Houssem"
              } ?`}
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="faq-PostCreator-input"
            onClick={handleOpenModal}
            readOnly
          />
        </div>
      </div>

      <div className="faq-PostCreator-actionBar">
        <button
          className="faq-PostCreator-button faq-PostCreator-photoButton"
          onClick={() => handleOpenModal("photo")}
        >
          <img src={MiniPhotoIcon} alt="Photo" />
          <span>Photo</span>
        </button>

        <button
          className="faq-PostCreator-button faq-PostCreator-videoButton"
          onClick={() => handleOpenModal("video")}
        >
          <img src={MiniVideoIcon} alt="Video" />
          <span>{t("FAQPostCreator.Video")}</span>
        </button>

        <button
          className="faq-PostCreator-button faq-PostCreator-pollButton"
          onClick={() => handleOpenModal("poll")}
        >
          <img src={MiniPollIcon} alt="Poll" />
          <span>{t("FAQPostCreator.Poll")}</span>
        </button>

        <button
          className="faq-PostCreator-button faq-PostCreator-linkButton"
          onClick={() => handleOpenModal("link")}
        >
          <img src={MiniLinkIcon} alt="Link" />
          <span>{t("FAQPostCreator.Link")}</span>
        </button>
      </div>

      {showModal && (
        <PostModal
  userData={userData}
  postText={postText}
  setPostText={setPostText}
  setShowModal={setShowModal}
  selectedType={selectedType}
  onPostCreated={onPostCreated} 
/>
      )}
    </div>
  );
}
