import { useCallback } from "react";
import GuestMenIcon from "./../images/GuestMenIcon.png";
import GuestWomenIcon from "./../images/GuestWomenIcon.png";
import GuestIcon from "./../images/GuestIcon.png";
import pollingImage from "./../images/pollingImage.png";
import videoImage from "./../images/VideoImage.png";
import MiniLinkIcon from "./../images/MiniLinkIcon.png";
import ArticleWithoutContent from "./../images/ArticleWithoutContent.png";

const GetProfilePicture = ({ data, className }) => {
  const userData = data || {};

  const getProfilePicture = useCallback(() => {
    if (userData.type === "article") {
      if (userData.image) return userData.image;
      if (userData.video) return videoImage;
      if (userData.poll) return pollingImage;
      if (userData.link) return MiniLinkIcon;
      return ArticleWithoutContent;
    }

    if (userData.profilePicture) {
      return userData.profilePicture;
    }
    if (userData.sex === "Woman") return GuestWomenIcon;
    if (userData.sex === "Man") return GuestMenIcon;
    return GuestIcon;
  }, [userData]);

  const borderRadiusStyle =
    userData.video || userData.poll || userData.link
      ? { borderRadius: "0" , border : "none"}
      : {};

  return (
    <img
      src={getProfilePicture()}
      alt={`${userData.name || userData.label || "profile"}`}
      className={className}
      style={borderRadiusStyle}
    />
  );
};

export default GetProfilePicture;
