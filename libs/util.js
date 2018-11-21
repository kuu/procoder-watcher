const fs = require('fs');
const path = require('path');

function getFileList(dir, extension) {
  return fs.readdirSync(dir).filter(file => {
    if (!fs.statSync(path.join(dir, file)).isFile()) {
      return false;
    }
    if (file.startsWith('.')) {
      // Ignore dot files
      return false;
    }
    if (!extension.startsWith('.')) {
      extension = `.${extension}`;
    }
    if (!file.endsWith(extension)) {
      return false;
    }
    return true;
  });
}

function getFileData(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function getFileTimestamp(filePath) {
  return new Date(fs.statSync(filePath).mtime);
}

function getFileBaseName(filePath, sep) {
  const arr = filePath.split(sep);
  if (arr.length > 0) {
    return arr[arr.length - 1];
  }
  return null;
}

function config() {
  return {
    port: normalizePort(process.env.PORT || '3000'),
    logDir: process.env.LOG_DIR || process.cwd(),
    interval: process.env.INTERVAL || 1000
  };
}

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}

module.exports = {
  getFileList,
  getFileData,
  getFileTimestamp,
  getFileBaseName,
  config,
  SEP: path.sep
};
