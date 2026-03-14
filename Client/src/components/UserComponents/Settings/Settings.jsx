import { useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { styled } from "@mui/material/styles"; // Ensure styled is imported correctly
import Typography from "@mui/material/Typography";
import Appearance from "./AppearanceSettings";
import AddConnections from "./AddConnections";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonIcon from "@mui/icons-material/Person";
import PaletteIcon from "@mui/icons-material/Palette";
import LinkIcon from "@mui/icons-material/Link";
import LockPersonIcon from "@mui/icons-material/LockPerson";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import FormatPaintIcon from "@mui/icons-material/FormatPaint";
import PodcastsIcon from "@mui/icons-material/Podcasts";
import ProfileSettings from "./profileSettings";
import AccountSettings from "./accountSettings";
import DescriptionIcon from "@mui/icons-material/Description";
import CvSettings from "./CvSettings.jsx";
import { useTranslation } from "react-i18next";
import "./Settings.css";
import SchoolIcon from '@mui/icons-material/School';
import CertificateSettings from "./certificateSettings.jsx";

// Custom styled TabPanel (minimal styling)
const StyledTabPanel = styled(TabPanel)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: "center",
}));

// Custom styled icon container
const IconContainer = styled("div")(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
}));

export default function Settings() {
  const [value, setValue] = useState("1");
  const { t } = useTranslation();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className="settings-page">
      <Box sx={{ width: "100%", typography: "body1" }}>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab
                icon={<LockPersonIcon />}
                iconPosition="start"
                label={t("settings.myAccount")}
                value="1"
              />
              <Tab
                icon={<ManageAccountsIcon />}
                iconPosition="start"
                label={t("settings.profile")}
                value="2"
              />
              <Tab
                icon={<DescriptionIcon />}
                iconPosition="start"
                label={t("settings.cv")}
                value="3"
              />
              <Tab
                icon={<SchoolIcon />}
                iconPosition="start"
                label={t("settings.certificate")}
                value="4"
              />
              <Tab
                icon={<FormatPaintIcon />}
                iconPosition="start"
                label={t("settings.appearance")}
                value="5"
              />
              <Tab
                icon={<PodcastsIcon />}
                iconPosition="start"
                label={t("settings.connection")}
                value="6"
              />
            </TabList>
          </Box>

          {/* TabPanel 1: My Account */}
          <StyledTabPanel value="1">
            <IconContainer>
              <AccountCircleIcon sx={{ fontSize: 60 }} />
            </IconContainer>
            <Typography variant="h5" gutterBottom>
              {t("settings.myAccount")}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t("settings.myAccountDescription")}
            </Typography>
            <AccountSettings />
          </StyledTabPanel>

          {/* TabPanel 2: Profile */}
          <StyledTabPanel value="2">
            <IconContainer>
              <PersonIcon sx={{ fontSize: 60 }} />
            </IconContainer>
            <Typography variant="h5" gutterBottom>
              {t("settings.profile")}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t("settings.profileDescription")}
            </Typography>
            <ProfileSettings />
          </StyledTabPanel>

          {/* TabPanel 3: Cv */}
          <StyledTabPanel value="3">
            <IconContainer>
              <DescriptionIcon sx={{ fontSize: 60 }} />
            </IconContainer>
            <Typography variant="h5" gutterBottom>
              {t("settings.cv")}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t("settings.cvDescription")}
            </Typography>
            <CvSettings />
          </StyledTabPanel>

          {/* TabPanel 3: Cv */}
          <StyledTabPanel value="4">
            <IconContainer>
              <SchoolIcon sx={{ fontSize: 60 }} />
            </IconContainer>
            <Typography variant="h5" gutterBottom>
              {t("settings.certificate")}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t("settings.certificateDescription")}
            </Typography>
            <CertificateSettings />
          </StyledTabPanel>

          {/* TabPanel 3: Appearance */}
          <StyledTabPanel value="5">
            <IconContainer>
              <PaletteIcon sx={{ fontSize: 60 }} />
            </IconContainer>
            <Typography variant="h5" gutterBottom>
              {t("settings.appearance")}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t("settings.appearanceDescription")}
            </Typography>
            <Appearance />
          </StyledTabPanel>

          {/* TabPanel 4: Connection */}
          <StyledTabPanel value="6">
            <IconContainer>
              <LinkIcon sx={{ fontSize: 60 }} />
            </IconContainer>
            <Typography variant="h5" gutterBottom>
              {t("settings.connection")}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t("settings.connectionDescription")}
            </Typography>
            <AddConnections />
          </StyledTabPanel>
        </TabContext>
      </Box>
    </div>
  );
}
