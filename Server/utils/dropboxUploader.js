const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { Dropbox } = require('dropbox');
require('dotenv').config();

const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN, fetch });

const uploadPdfToDropbox = async (filePath, folder = '/lessons', publicName) => {
  try {
    // Check if file is PDF
    const fileExt = path.extname(filePath).toLowerCase();
    if (fileExt !== '.pdf') {
      throw new Error('Only PDF files are allowed');
    }

    const fileContent = fs.readFileSync(filePath);
    const fileName = publicName || path.basename(filePath);
    
    // Ensure the filename ends with .pdf even if publicName was provided
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      throw new Error('Filename must end with .pdf');
    }

    const dropboxPath = path.posix.join(folder, fileName);
    
    // Upload the file
    const uploadResponse = await dbx.filesUpload({
      path: dropboxPath,
      contents: fileContent,
      mode: 'add',
      autorename: true,
      mute: false,
    });

    // Create a shared link
    const sharedLinkResponse = await dbx.sharingCreateSharedLinkWithSettings({
      path: uploadResponse.result.path_lower,
      settings: {
        requested_visibility: 'public',
        audience: 'public',
        access: 'viewer'
      }
    });

    // Modify URL to force download
    let sharedUrl = sharedLinkResponse.result.url;
    sharedUrl = sharedUrl.replace('?dl=0', '?dl=1');

    console.log("PDF uploaded successfully. Shareable URL:", sharedUrl);
    
    return {
      path: uploadResponse.result.path_display,
      url: sharedUrl,
      id: uploadResponse.result.id
    };
  } catch (err) {
    console.error("Error:", err.message);
    throw err;
  }
};

module.exports = uploadPdfToDropbox;