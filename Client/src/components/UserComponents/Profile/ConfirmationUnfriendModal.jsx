import './ConfirmationUnfriendModal.css';
import GetProfilePicture from "./../utils/GetProfilePicture.jsx";

const ConfirmationUnfriendModal = ({ show, onClose, onConfirm, Data}) => {
  if (!show) return null;
  return (
    <div className="ConfirmationUnfriendModal-modal-overlay">
      <div className="ConfirmationUnfriendModal-modal-container">
        <div className="ConfirmationUnfriendModal-modal-header">
          <h2>Are you sure?</h2>
        </div>
        <div className="ConfirmationUnfriendModal-modal-body">
          <GetProfilePicture data={Data} className="ConfirmationUnfriendModal-modal-image" />
          <p>Are you sure you want to unfollow {Data.lastName} {Data.name} ?</p>
        </div>
        <div className="ConfirmationUnfriendModal-modal-actions">
          <button className="ConfirmationUnfriendModal-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="ConfirmationUnfriendModal-confirm-btn" onClick={onConfirm}>
            Unfollow
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationUnfriendModal;