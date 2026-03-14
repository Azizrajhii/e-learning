function convertDropboxUrl(originalUrl) {
  try {
    const parsedUrl = new URL(originalUrl);

    // Replace hostname for direct download
    parsedUrl.hostname = "dl.dropboxusercontent.com";

    // Clean up the pathname (remove 'scl/fi')
    const pathParts = parsedUrl.pathname.split('/');
    const newPathParts = ['s', ...pathParts.slice(3)];
    parsedUrl.pathname = '/' + newPathParts.join('/');

    // Remove 'dl' parameter from the query string
    parsedUrl.searchParams.delete('dl');

    return parsedUrl.toString();
  } catch (error) {
    console.error("Invalid URL:", error.message);
    return null;
  }
}

module.exports = { convertDropboxUrl };