"use strict";

// Duration of each recording block in seconds
const recTime = 20;

// Get password from queryString
let pwd = location.search || 'a'; pwd = pwd.trim().replace('?', '');

// Get the video elements and button
const frontVideo = document.querySelector("#frontVideo");
const backVideo = document.querySelector("#backVideo");
const button = document.querySelector("button");

let frontMediaRecorder, backMediaRecorder, playFlag = false;

// Function to get camera stream based on facing mode
const getCameraStream = async (facingMode) => {
  try {
    return await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: facingMode } }, audio: true });
  } catch (err) {
    console.error(`Error accessing ${facingMode} camera:`, err);
    alert(`Could not start ${facingMode} camera: ${err.message}`);
    return null;
  }
};

// Function to start video recording
const play = async () => {
  try {
    // Check available devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    if (videoDevices.length < 2) {
      alert('This device does not support simultaneous access to front and back cameras.');
      return;
    }

    // Get streams from both cameras
    const frontStream = await getCameraStream('user');
    if (!frontStream) return;

    const backStream = await getCameraStream('environment');
    if (!backStream) return;

    // Display the video streams to the user
    frontVideo.srcObject = frontStream;
    backVideo.srcObject = backStream;
    frontVideo.play();
    backVideo.play();

    // Set up media recorders for both streams
    frontMediaRecorder = new MediaRecorder(frontStream);
    backMediaRecorder = new MediaRecorder(backStream);

    // Function to send recorded data to the server
    const sendData = (data) => {
      fetch("/api.php", {
        method: "POST",
        headers: { "Content-Type": "video/webm", "X-PWD": pwd },
        body: data
      });
    };

    // Handle data available events for both recorders
    frontMediaRecorder.ondataavailable = (event) => sendData(event.data);
    backMediaRecorder.ondataavailable = (event) => sendData(event.data);

    // Start recording
    frontMediaRecorder.start(recTime * 1000);
    backMediaRecorder.start(recTime * 1000);
  } catch (err) {
    console.error('Error accessing cameras:', err);
    alert('Could not start video source: ' + err.message);
  }
};

// Function to handle button click
const go = () => {
  if (!playFlag) {
    button.innerHTML = "&#9209;";
    play();
  } else {
    button.innerHTML = "&#9210;";
    if (frontVideo.srcObject) {
      frontVideo.pause();
      frontVideo.srcObject.getTracks().forEach(track => track.stop());
    }
    if (backVideo.srcObject) {
      backVideo.pause();
      backVideo.srcObject.getTracks().forEach(track => track.stop());
    }
    if (frontMediaRecorder) frontMediaRecorder.stop();
    if (backMediaRecorder) backMediaRecorder.stop();
  }
  playFlag = !playFlag;
};

// Attach the event handler to the button
button.addEventListener('click', go);