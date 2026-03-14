const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { PassThrough } = require('stream');

// Font paths
const regular = path.join(__dirname, "../assets/merriweather.regular.ttf");
const bold = path.join(__dirname, "../assets/merriweather.bold.ttf");
const light = path.join(__dirname, "../assets/merriweather.light.ttf");

function formatExpirationDate(dateString) {
  const date = new Date(dateString);
  const nextYear = new Date(date.setFullYear(date.getFullYear() + 1));
  const formattedDate = nextYear.toISOString().split('T')[0];
  return `Expires on ${formattedDate}`;
}

async function generateCertificateFile(name, course, DirectorTraining, date) {
  const fileName = `${name.replace(/\s+/g, "_")}_${course.replace(
    /\s+/g,
    "_"
  )}_Certificate.pdf`;

  const doc = new PDFDocument({
    size: [500, 800],
    layout: "landscape",
    margin: 10,
  });

  const stream = new PassThrough();
  doc.pipe(stream);

  // Register fonts
  doc.registerFont("Merriweather-Regular", regular);
  doc.registerFont("Merriweather-Bold", bold);
  doc.registerFont("Merriweather-Light", light);

  // White background
  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#ffffff");

  // Border
  const outerMargin = 20;
  doc.lineWidth(1.5);
  doc.strokeColor("#4f46e5");
  doc
    .rect(
      outerMargin,
      outerMargin,
      doc.page.width - outerMargin * 2,
      doc.page.height - outerMargin * 2
    )
    .stroke();

  const innerMargin = outerMargin + 3;
  doc.lineWidth(1.5);
  doc.strokeColor("#4f46e5");
  doc
    .rect(
      innerMargin,
      innerMargin,
      doc.page.width - innerMargin * 2,
      doc.page.height - innerMargin * 2
    )
    .stroke();

  const contentPadding = 60;

  // Logo
  const logoPath = path.join(__dirname, "../assets/logo.png");
  if (fs.existsSync(logoPath)) {
    const logoWidth = 120;
    const logoX = (doc.page.width - logoWidth) / 2;
    const logoY = contentPadding;
    doc.image(logoPath, logoX, logoY - 10, { width: logoWidth });
  }

  // Certificate title
  doc.moveDown(14);
  doc.fontSize(24);
  doc.font("Merriweather-Bold");
  doc.fillColor("#1f2937");
  doc.text("CERTIFICATE OF ACHIEVEMENT", {
    align: "center",
  });

  // Name
  doc.moveDown(0.7);
  doc.fontSize(24);
  doc.font("Merriweather-Bold");
  doc.fillColor("#4f46e5");
  doc.text(name.toUpperCase(), {
    align: "center",
  });

  // Description
  doc.moveDown(0.5);
  doc.fontSize(14);
  doc.font("Merriweather-Light");
  doc.fillColor("#374151");
  doc.text(
    "Has successfully completed the "+ course + " Certified exam requirements and is",
    { align: "center" }
  );
  doc.text("now a Certified "+ course.toUpperCase() , { align: "center" });

  doc.moveDown(2);
  doc.fontSize(18);

  const reactText = course.toUpperCase();
  const developerText = " DEVELOPER";

  // Measure combined width
  const reactWidth = doc.widthOfString(reactText, {
    font: "Merriweather-Bold",
  });
  const developerWidth = doc.widthOfString(developerText, {
    font: "Merriweather-Bold",
  });
  const totalWidth = reactWidth + developerWidth;
  const x = (doc.page.width - totalWidth) / 2;
  const y = doc.y;

  // Draw REACT
  doc
    .font("Merriweather-Bold")
    .fillColor("#10b981")
    .text(reactText, x, y, { continued: true });

  // Draw DEVELOPER
  doc.font("Merriweather-Bold").fillColor("#3b82f6").text(developerText);

  // Footer layout
  const footerY = doc.page.height - 70;
  const col1X = contentPadding + 20;
  const col2X = doc.page.width / 2 - 80;
  const col3X = doc.page.width - contentPadding - 180;

  const signerName = DirectorTraining;
  const signerRole = "Director of Training";

  // Register the light font if not already
  doc.registerFont("Merriweather-Light", light);

  // Draw name (left aligned)
  doc
    .font("Merriweather-Light")
    .fontSize(12)
    .fillColor("#000000")
    .text(signerName, col1X, footerY);

  // Measure width of role and center it below the name
  doc.font("Merriweather-Light").fontSize(10);
  const roleWidth = doc.widthOfString(signerRole);
  const roleX = col1X + (doc.widthOfString(signerName) - roleWidth / 1.25) / 2;

  doc
    .font("Merriweather-Light")
    .fontSize(10)
    .fillColor("#666666")
    .text(signerRole, roleX, footerY + 18);
  // Certification center
  const certifiedText = "CERTIFIED";
  const subText = " On "+course; // note the leading space

  // Font sizes
  const certifiedFontSize = 12;
  const subFontSize = 12;

  // Measure individual widths
  doc.font("Merriweather-Bold").fontSize(certifiedFontSize);
  const certifiedWidth = doc.widthOfString(certifiedText);

  doc.font("Merriweather-Light").fontSize(subFontSize);
  const subWidth = doc.widthOfString(subText);

  const totalWidth1 = certifiedWidth + subWidth;
  const startX = (doc.page.width - totalWidth1) / 2;

  // Draw CERTIFIED
  doc
    .font("Merriweather-Bold")
    .fontSize(certifiedFontSize)
    .fillColor("#10b981")
    .text(certifiedText, startX, footerY, { continued: true });

  // Draw On React
  doc
    .font("Merriweather-Light")
    .fontSize(subFontSize)
    .fillColor("#4b5563")
    .text(subText);

  // Expiration
  doc
    .fontSize(10)
    .fillColor("#666666")
    .text(formatExpirationDate(date), col3X, footerY , {
      width: 160,
      align: "right",
    });

  // Signature image
  const signaturePath = path.join(__dirname, "../assets/Sign.png");
  if (fs.existsSync(signaturePath)) {
    doc.image(signaturePath, col3X + 30, footerY - 40, { width: 180 });
  }

  // Stamp image
  const stampPath = path.join(__dirname, "../assets/stamp.png");
  if (fs.existsSync(stampPath)) {
    const stampSize = 80;
    doc.image(
      stampPath,
      doc.page.width - contentPadding - stampSize,
      footerY - 40,
      {
        width: stampSize,
      }
    );
  }

 doc.end();

  // Collect PDF data
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  const pdfBuffer = Buffer.concat(chunks);

  return { pdfBuffer, fileName };
}

module.exports = generateCertificateFile;