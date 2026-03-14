const generateCertificateFile = require("../utils/generateCertificateFile");
const uploadPdfToDropbox = require("./../utils/dropboxUploader.js");
const fs = require("fs");
const path = require("path");
const { convertDropboxUrl } = require("./../utils/convertDropboxUrl.js");
const Formation = require("./../models/formationModel");
const Profile = require("./../models/profileModel");
const { getUserId } = require("./../utils/tokenAuth.js");
const CV = require("./../models/CvModel");

exports.generateCertificate = async (req, res) => {
  try {
    const { formationId } = req.params;

    if (!formationId) {
      return res.status(400).json({ error: "Missing formation ID" });
    }

    const userId = await getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const formation = await Formation.findById(formationId);
    if (!formation) {
      return res
        .status(404)
        .json({ message: "Associated formation not found" });
    }

    const profileLearner = await Profile.findOne({ userId });
    if (!profileLearner) {
      return res.status(404).json({ message: "Learner profile not found" });
    }

    const profileTrainer = await Profile.findOne({
      userId: formation.InstructorId,
    });
    if (!profileTrainer) {
      return res.status(404).json({ message: "Trainer profile not found" });
    }

    const name = `${profileLearner.lastName} ${profileLearner.name}`;
    const course = formation.title;
    const DirectorTraining = `${profileTrainer.lastName} ${profileTrainer.name}`;
    const date = new Date();

    console.log(name, course, DirectorTraining, date);

    // Generate the PDF buffer and filename
    const { pdfBuffer, fileName } = await generateCertificateFile(
      name,
      course,
      DirectorTraining,
      date
    );

    // Create a temporary file path
    const tempDir = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    const tempFilePath = path.join(tempDir, fileName);

    // Write buffer to temp file
    fs.writeFileSync(tempFilePath, pdfBuffer);

    // Upload to Dropbox
    const dropboxResponse = await uploadPdfToDropbox(
      tempFilePath,
      "/certificates",
      fileName
    );

    // Delete the temporary file
    fs.unlinkSync(tempFilePath);
    const UrlConverted = convertDropboxUrl(dropboxResponse.url);

    const certificateData = {
      name: `${course} Certificate`,
      institution: "SkillShare Hub",
      link: UrlConverted,
      date: date,
    };

    const updatedCV = await CV.findOneAndUpdate(
      { userId },
      { $push: { certificates: certificateData } },
      { upsert: true, new: true }
    );

    console.log(updatedCV)

    res.status(200).json({
      success: true,
      message: "Certificate generated, uploaded, and added to CV successfully",
      fileName: fileName,
      url: UrlConverted,
      dropboxPath: dropboxResponse.path,
      certificate: certificateData,
    });

  } catch (error) {
    console.error("Error generating certificate:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate certificate",
      details: error.message,
    });
  }
};

exports.getCertificateById = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const userId = await getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!certificateId) {
      return res.status(400).json({ error: "Certificate ID is required" });
    }

    // Find the user's CV and the specific certificate
    const cv = await CV.findOne(
      { userId, "certificates._id": certificateId },
      { "certificates.$": 1 }
    );

    if (!cv || !cv.certificates || cv.certificates.length === 0) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    const certificate = cv.certificates[0];

    res.status(200).json({
      success: true,
      certificate: {
        id: certificate._id,
        name: certificate.name,
        institution: certificate.institution,
        link: certificate.link,
        date: certificate.date,
        formation: certificate.name.replace(' Certificate', '') // Extract course name
      }
    });
  } catch (error) {
    console.error("Error fetching certificate:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch certificate",
      details: error.message
    });
  }
};

exports.getAllMyCertificates = async (req, res) => {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find the user's CV with all certificates
    const cv = await CV.findOne({ userId }).select('certificates');

    if (!cv) {
      return res.status(404).json({ message: "CV not found for this user" });
    }

    // Map the certificates to a more structured response
    const certificates = cv.certificates.map(cert => ({
      id: cert._id,
      name: cert.name,
      institution: cert.institution,
      link: cert.link,
      date: cert.date,
      formation: cert.name.replace(' Certificate', '') // Extract course name
    }));

    res.status(200).json({
      success: true,
      count: certificates.length,
      certificates
    });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch certificates",
      details: error.message
    });
  }
};

exports.updateMyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const { name, institution, date } = req.body;
    const certificateFile = req.file;
    const userId = await getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!certificateId) {
      return res.status(400).json({ error: "Certificate ID is required" });
    }

    // Find the existing certificate
    const cv = await CV.findOne(
      { userId, "certificates._id": certificateId },
      { "certificates.$": 1 }
    );

    if (!cv || !cv.certificates || cv.certificates.length === 0) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    const existingCert = cv.certificates[0];
    let updatedCertificate = { ...existingCert._doc };
    let UrlConverted = existingCert.link;
    let newFileName = null;

    // Handle file update if provided
    if (certificateFile) {
      if (certificateFile.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: "Only PDF files are accepted" });
      }

      // Generate new filename
      newFileName = `certificate_${Date.now()}_${userId}.pdf`;
      const tempDir = path.join(__dirname, "../temp");

      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      const tempFilePath = path.join(tempDir, newFileName);
      fs.writeFileSync(tempFilePath, certificateFile.buffer);

      // Upload to Dropbox (in same location as original)
      const dropboxPath = `/certificates/${path.basename(existingCert.link)}`;
      const dropboxResponse = await uploadPdfToDropbox(
        tempFilePath,
        path.dirname(dropboxPath),
        newFileName,
        true // overwrite
      );

      fs.unlinkSync(tempFilePath);
      UrlConverted = convertDropboxUrl(dropboxResponse.url);
    }

    // Update fields if provided
    if (name) updatedCertificate.name = name;
    if (institution) updatedCertificate.institution = institution;
    if (date) updatedCertificate.date = new Date(date);
    updatedCertificate.link = UrlConverted;

    // Update the certificate in database
    const updatedCV = await CV.findOneAndUpdate(
      { userId, "certificates._id": certificateId },
      { $set: { "certificates.$": updatedCertificate } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Certificate updated successfully",
      certificate: {
        id: certificateId,
        name: updatedCertificate.name,
        institution: updatedCertificate.institution,
        link: UrlConverted,
        date: updatedCertificate.date,
        isExternal: updatedCertificate.isExternal || false
      }
    });

  } catch (error) {
    console.error("Error updating certificate:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update certificate",
      details: error.message
    });
  }
};

exports.addCertificateFromOtherPlatform = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { name, institution, date } = req.body;
    const certificateFile = req.file; // PDF file from multipart/form-data

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!certificateFile || !name) {
      return res.status(400).json({
        error: "Certificate file and name are required"
      });
    }

    // Validate PDF file
    if (certificateFile.mimetype !== 'application/pdf') {
      return res.status(400).json({
        error: "Only PDF files are accepted"
      });
    }

    // Generate unique filename
    const fileName = `certificate_${Date.now()}_${userId}.pdf`;
    const tempDir = path.join(__dirname, "../temp");

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const tempFilePath = path.join(tempDir, fileName);

    // Move the uploaded file to temp location
    fs.writeFileSync(tempFilePath, certificateFile.buffer);

    // Upload to Dropbox
    const dropboxResponse = await uploadPdfToDropbox(
      tempFilePath,
      "/external-certificates", // Different folder for external certs
      fileName
    );

    // Clean up temp file
    fs.unlinkSync(tempFilePath);
    const UrlConverted = convertDropboxUrl(dropboxResponse.url);

    // Prepare certificate data
    const certificateData = {
      name: name,
      institution: institution || "External Platform",
      link: UrlConverted,
      date: date ? new Date(date) : new Date(),
      isExternal: true // Flag to identify external certificates
    };

    // Add to user's CV
    await CV.findOneAndUpdate(
      { userId },
      { $push: { certificates: certificateData } },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: "External certificate added successfully",
      certificate: {
        name: certificateData.name,
        institution: certificateData.institution,
        link: UrlConverted,
        date: certificateData.date,
        isExternal: true
      }
    });

  } catch (error) {
    console.error("Error adding external certificate:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add external certificate",
      details: error.message
    });
  }
};