document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('verify-button').addEventListener('click', verifyDownloadedFile);
  document.getElementById('upload-file-button').addEventListener('click', handleFileUpload);
  document.getElementById('dark-mode-switch').addEventListener('change', toggleDarkMode);
  document.getElementById('copy-to-clipboard').addEventListener('click', copyToClipboard);

 
});
function validateFileInput(fileInput) {
  // Check if a file is selected
  if (!fileInput.files || fileInput.files.length === 0) {
    alert('Please select a file.');
    return false;
  }

  const selectedFile = fileInput.files[0];

  // Check file size (in bytes)
  const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB
  if (selectedFile.size > maxSizeInBytes) {
    alert('File size exceeds the maximum allowed limit (10 MB).');
    return false;
  }

  // Sanitize and limit filename length
  const originalFileName = selectedFile.name;
  const sanitizedFileName = sanitizeFilename(originalFileName);
  const maxFilenameLength = 255; // Adjust as needed

  if (sanitizedFileName.length > maxFilenameLength) {
    alert('Filename exceeds the maximum allowed length.');
    return false;
  }

  // All checks passed, proceed with further processing
  // (e.g., uploading the file, processing data, etc.)
  alert('File is valid!');

  return true;
}

function sanitizeFilename(filename) {
  // Basic filename sanitization: remove potentially harmful characters
  return filename ? filename.replace(/[^a-zA-Z0-9_.-]/g, '_') : '';
}
let uploadedFile = null; // Global variable to store the uploaded file information
// function updateVerificationStatus(isMatch) {
//   const statusElement = document.getElementById('verification-status');
//   if (isMatch) {
//     statusElement.textContent = 'Matched!';
//     statusElement.style.color = '#4caf50'; // Green color for matched
//   } else {
//     statusElement.textContent = 'Not Matched!';
//     statusElement.style.color = '#f44336'; // Red color for not matched
//   }
// }
function updateVerificationStatus(isMatch) {
  const notificationElement = document.getElementById('verification-notification');
  const notificationTextElement = document.getElementById('notification-text');

  if (isMatch) {
    notificationTextElement.textContent = 'Matched!';
    notificationElement.style.backgroundColor = '#4caf50';
  } else {
    notificationTextElement.textContent = 'Not Matched!';
    notificationElement.style.backgroundColor = '#f44336';
  }

  // Slide in the notification
  notificationElement.style.left = '0';

  // Hide the notification after a delay (e.g., 3000 milliseconds or 3 seconds)
  setTimeout(() => {
    // Slide out the notification
    notificationElement.style.left = '-100%';
  }, 3000); // 3000 milliseconds or 3 seconds
}

function updateFileInfo(uploadedFile) {
  const fileInfoElement = document.getElementById('file-info');

  if (uploadedFile) {
    const name = sanitizeFilename(uploadedFile.filename);
    const path = uploadedFile.path || 'N/A';
    fileInfoElement.textContent = `${name}`;
  } else {
    fileInfoElement.textContent = 'No file selected';
  }
}



updateFileInfo()



function verifyDownloadedFile() {
  // Check if an uploaded file exists
  if (!uploadedFile) {
    alert('Please upload a file first.');
    return;
  }
  // Get user input hash
  const inputHash = sanitizeFilename(
  document.getElementById('hash-input').value.trim());

  // Calculate MD5, SHA1, and SHA256 hashes using CryptoJS
  const md5Hash = CryptoJS.MD5(uploadedFile.content).toString();
  const sha1Hash = CryptoJS.SHA1(uploadedFile.content).toString();
  const sha256Hash = CryptoJS.SHA256(uploadedFile.content).toString();

  // Display hash results and file information
  displayHashResults(md5Hash, sha1Hash, sha256Hash, uploadedFile.filename, uploadedFile.path);

  // Verify user input against the calculated hashes
  const isMd5Match = (md5Hash === inputHash);
  const isSha1Match = (sha1Hash === inputHash);
  const isSha256Match = (sha256Hash === inputHash);

  // Update status based on verification result
  updateVerificationStatus(isMd5Match || isSha1Match || isSha256Match);
}

function handleFileUpload() {
  // Trigger the hidden file input
  document.getElementById('file-input').click();
}

function showVerifyForm() {
  const verifyForm = document.getElementById('verify-form');
  verifyForm.style.display = 'block';
}

function validateInput() {
  const hashInput = document.getElementById('hash-input').value;
  const min = parseInt(document.getElementById('hash-input').getAttribute('minlength'));
  const max = parseInt(document.getElementById('hash-input').getAttribute('maxlength'));

  if (hashInput.length < min || hashInput.length > max) {
    alert(`Input must be between ${min} and ${max} characters.`);
    return false;
  }

  // Additional validation logic if needed
  // ...

  return true;
}
document.getElementById('file-input').addEventListener('change', function (event) {
  const selectedFile = event.target.files[0];
  if (selectedFile) {
    // Check if webkitRelativePath is available

    const reader = new FileReader();

    // Event listener for progress tracking
    reader.onprogress = function (e) {
      if (e.lengthComputable) {
        const percentage = (e.loaded / e.total) * 100;
        updateProgress(percentage);
      }
    };

    reader.onload = function (e) {
      const fileContent = e.target.result;
      showVerifyForm();
      // Update global variable with the uploaded file information
      uploadedFile = {
        content: fileContent,
        filename: selectedFile.name
      };
      console.log(uploadedFile)
      // Calculate MD5, SHA1, and SHA256 hashes using CryptoJS
      const md5Hash = CryptoJS.MD5(fileContent).toString();
      const sha1Hash = CryptoJS.SHA1(fileContent).toString();
      const sha256Hash = CryptoJS.SHA256(fileContent).toString();
      // Assuming you have already defined the uploadedFile object and calculated the hashes

      uploadedFile.md5Hash = CryptoJS.MD5(fileContent).toString();
      uploadedFile.sha1Hash = CryptoJS.SHA1(fileContent).toString();
      uploadedFile.sha256Hash = CryptoJS.SHA256(fileContent).toString();

      // Log the updated uploadedFile object
      console.log(uploadedFile);

      // Store in session storage
      sessionStorage.setItem('uploadedFile', JSON.stringify(uploadedFile));

      // Corrected: Pass the uploadedFile object directly
      updateFileInfo(uploadedFile);

      // Display hash results and file information
      displayHashResults(md5Hash, sha1Hash, sha256Hash, uploadedFile.filename, uploadedFile.path);

      // Cleanup: Reset progress and file input
      resetUI();
    };

    reader.readAsText(selectedFile);
  }
});

// document.getElementById('file-input').addEventListener('change', function (event) {
//   const selectedFile = event.target.files[0];
//   if (selectedFile) {
//     // Check if webkitRelativePath is available

//     const reader = new FileReader();

//     // Event listener for progress tracking
//     reader.onprogress = function (e) {
//       if (e.lengthComputable) {
//         const percentage = (e.loaded / e.total) * 100;
//         updateProgress(percentage);
//       }
//     };

//     reader.onload = function (e) {
//       const fileContent = e.target.result;

//       // Update global variable with the uploaded file information
//       uploadedFile = {
//         content: fileContent,
//         filename: selectedFile.name
//             };

//       // Calculate MD5, SHA1, and SHA256 hashes using CryptoJS
//       const md5Hash = CryptoJS.MD5(fileContent).toString();
//       const sha1Hash = CryptoJS.SHA1(fileContent).toString();
//       const sha256Hash = CryptoJS.SHA256(fileContent).toString();
//       updateFileInfo(uploadedFile);

//       // Display hash results and file information
//       displayHashResults(md5Hash, sha1Hash, sha256Hash, uploadedFile.filename, uploadedFile.path);

//       // Cleanup: Reset progress and file input
//       resetUI();
//     };

//     reader.readAsText(selectedFile);
//   }
// });




function updateProgress(percentage) {
  // Update progress bar or any other UI element to show the progress
  const progressBarContainer = document.getElementById('upload-progress-bar-container');
  progressBarContainer.style.display='block';
  const progressBar = document.getElementById('upload-progress-bar');
  if (progressBar) {

    progressBar.style.display = 'block'; 
    progressBar.style.width = percentage + '%';
  }
}


function displayHashResults(md5Hash, sha1Hash, sha256Hash, filename, path) {
  const hashResultsElement = document.getElementById('hash-results');
  hashResultsElement.style.display = 'block';

  // Display hash results and file information
  document.getElementById('md5-result').textContent = md5Hash;
  document.getElementById('sha1-result').textContent = sha1Hash;
  document.getElementById('sha256-result').textContent = sha256Hash;
}

function resetUI() {
  // Reset progress bar
  const progressBar = document.getElementById('upload-progress-bar');
  if (progressBar) {
    progressBar.style.width = '0%';
  }

  // Reset file input
  document.getElementById('file-input').value = '';
}

function toggleDarkMode() {
  const darkModeSwitch = document.getElementById('dark-mode-switch');
  document.body.classList.toggle('dark-mode', darkModeSwitch.checked);

  // Save the current dark mode state
  const isDarkMode = darkModeSwitch.checked;
  chrome.storage.sync.set({ darkMode: isDarkMode });
}

function copyToClipboard() {
  var md5Result = document.getElementById('md5-result').innerText.trim();
  var sha1Result = document.getElementById('sha1-result').innerText.trim();
  var sha256Result = document.getElementById('sha256-result').innerText.trim();

  if (md5Result || sha1Result || sha256Result) {
    var combinedResult = `MD5: ${md5Result}\nSHA-1: ${sha1Result}\nSHA-256: ${sha256Result}`;

    var textarea = document.createElement('textarea');
    textarea.value = combinedResult;
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Unable to copy to clipboard:', err);
      alert('Copy to clipboard failed. Please try again.');
    } finally {
      document.body.removeChild(textarea);
    }
  } else {
    alert('No hash results to copy!');
  }
}

// popup.js
