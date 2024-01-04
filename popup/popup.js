document.addEventListener('DOMContentLoaded', function () {
  // Add event listeners
  document.getElementById('verify-button').addEventListener('click', verifyDownloadedFile);
  document.getElementById('upload-file-button').addEventListener('click', handleFileUpload);
  document.getElementById('dark-mode-switch').addEventListener('change', toggleDarkMode);
  document.getElementById('copy-to-clipboard').addEventListener('click', copyToClipboard);
  document.getElementById('my-file').addEventListener('click', handleFileUpload); // Add listener for #my-file

  // Function to handle file input validation
  function validateFileInput(fileInput) {
    if (!fileInput.files || fileInput.files.length === 0) {
      alert('Please select a file.');
      return false;
    }

    const selectedFile = fileInput.files[0];

    const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB
    if (selectedFile.size > maxSizeInBytes) {
      alert('File size exceeds the maximum allowed limit (10 MB).');
      return false;
    }

    const originalFileName = selectedFile.name;
    const sanitizedFileName = sanitizeFilename(originalFileName);
    const maxFilenameLength = 255;

    if (sanitizedFileName.length > maxFilenameLength) {
      alert('Filename exceeds the maximum allowed length.');
      return false;
    }

    alert('File is valid!');
    return true;
  }

  // Function to sanitize filename
  function sanitizeFilename(filename) {
    return filename ? filename.replace(/[^a-zA-Z0-9_.-]/g, '_') : '';
  }

  let uploadedFile = null;

  function updateVerificationStatus(isMatch) {
    const notificationElement = document.getElementById('verification-notification');
    const notificationTextElement = document.getElementById('notification-text');
  
    notificationTextElement.textContent = isMatch ? 'Matched!' : 'Not Matched!';
    notificationElement.style.backgroundColor = isMatch ? '#4caf50' : '#f44336';
  
    // Slide in the notification
    notificationElement.style.left = '0';
  
    // Display close button
    const closeButton = document.createElement('div');
    closeButton.classList.add('close-button');
    closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path></svg>';  
    closeButton.addEventListener('click', function () {
      // Slide out the notification when the close button is clicked
      notificationElement.style.left = '-100%';
      closeButton.remove();
    });
  
    // Append close button to the notification
    notificationElement.appendChild(closeButton);
  }
  

  function updateFileInfo(uploadedFile) {
    const fileInfoElement = document.getElementById('file-info');

    if (uploadedFile) {
      const name = sanitizeFilename(uploadedFile.filename);
      fileInfoElement.textContent = name;
    } else {
      fileInfoElement.textContent = 'No file selected';
    }
  }

  function verifyDownloadedFile() {
    if (!uploadedFile) {
      alert('Please upload a file first.');
      return;
    }

    const inputHash = sanitizeFilename(document.getElementById('hash-input').value.trim());
    const md5Hash = CryptoJS.MD5(uploadedFile.content).toString();
    const sha1Hash = CryptoJS.SHA1(uploadedFile.content).toString();
    const sha256Hash = CryptoJS.SHA256(uploadedFile.content).toString();

    displayHashResults(md5Hash, sha1Hash, sha256Hash, uploadedFile.filename, uploadedFile.path);

    const isMd5Match = md5Hash === inputHash;
    const isSha1Match = sha1Hash === inputHash;
    const isSha256Match = sha256Hash === inputHash;

    updateVerificationStatus(isMd5Match || isSha1Match || isSha256Match);
  }

  function handleFileUpload() {
    document.getElementById('file-input').click();
  }

  function showVerifyForm() {
    document.getElementById('verify-form').style.display = 'block';
  }

  function validateInput() {
    const hashInput = document.getElementById('hash-input').value;
    const min = parseInt(document.getElementById('hash-input').getAttribute('minlength'));
    const max = parseInt(document.getElementById('hash-input').getAttribute('maxlength'));

    if (hashInput.length < min || hashInput.length > max) {
      alert(`Input must be between ${min} and ${max} characters.`);
      return false;
    }

    return true;
  }

  document.getElementById('file-input').addEventListener('change', function (event) {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      const reader = new FileReader();

      reader.onprogress = function (e) {
        if (e.lengthComputable) {
          const percentage = (e.loaded / e.total) * 100;
          updateProgress(percentage);
        }
      };

      reader.onload = function (e) {
        const fileContent = e.target.result;
        showVerifyForm();

        uploadedFile = {
          content: fileContent,
          filename: selectedFile.name
        };

        const md5Hash = CryptoJS.MD5(fileContent).toString();
        const sha1Hash = CryptoJS.SHA1(fileContent).toString();
        const sha256Hash = CryptoJS.SHA256(fileContent).toString();

        uploadedFile.md5Hash = md5Hash;
        uploadedFile.sha1Hash = sha1Hash;
        uploadedFile.sha256Hash = sha256Hash;

        sessionStorage.setItem('uploadedFile', JSON.stringify(uploadedFile));
        updateFileInfo(uploadedFile);
        displayHashResults(md5Hash, sha1Hash, sha256Hash, uploadedFile.filename, uploadedFile.path);
        resetUI();
      };

      reader.readAsText(selectedFile);
    }
  });

  function updateProgress(percentage) {
    const progressBarContainer = document.getElementById('upload-progress-bar-container');
    progressBarContainer.style.display = 'block';
    const progressBar = document.getElementById('upload-progress-bar');

    if (progressBar) {
      progressBar.style.display = 'block';
      progressBar.style.width = percentage + '%';
    }
  }

  function displayHashResults(md5Hash, sha1Hash, sha256Hash, filename, path) {
    const hashResultsElement = document.getElementById('hash-results');
    hashResultsElement.style.display = 'block';

    document.getElementById('md5-result').textContent = md5Hash;
    document.getElementById('sha1-result').textContent = sha1Hash;
    document.getElementById('sha256-result').textContent = sha256Hash;
  }

  function resetUI() {
    const progressBar = document.getElementById('upload-progress-bar');

    if (progressBar) {
      progressBar.style.width = '0%';
    }

    document.getElementById('file-input').value = '';
  }

  function toggleDarkMode() {
    const darkModeSwitch = document.getElementById('dark-mode-switch');
    document.body.classList.toggle('dark-mode', darkModeSwitch.checked);

    const isDarkMode = darkModeSwitch.checked;
    chrome.storage.sync.set({ darkMode: isDarkMode });
  }

  function copyToClipboard() {
    const md5Result = document.getElementById('md5-result').innerText.trim();
    const sha1Result = document.getElementById('sha1-result').innerText.trim();
    const sha256Result = document.getElementById('sha256-result').innerText.trim();

    if (md5Result || sha1Result || sha256Result) {
      const combinedResult = `MD5: ${md5Result}\nSHA-1: ${sha1Result}\nSHA-256: ${sha256Result}`;

      const textarea = document.createElement('textarea');
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
});
