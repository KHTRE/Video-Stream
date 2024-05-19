"use strict";

// Duration of each recording block in seconds
const recTime = 20;

// Get password from queryString
let pwd = location.search || 'a'; pwd = pwd.trim().replace('?', '');

// Get the video elements and button
const frontVideo = document.querySelector("#frontVideo");
alert('frontVideo', frontVideo);

const backVideo = document.querySelector("#backVideo");
alert('backVideo', backVideo);

const button = document.querySelector("button");

let frontMediaRecorder, backMediaRecorder, playFlag = false;

const getStream = async (constraints) => {
  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err) {
    console.error('Error accessing camera:', err);
    alert('Could not start video source: ' + err.message);
    return null;
  }
};

// Function to start video recording
const play = async () => {
  try {
    // Check for mobile devices
    const isMobile = /Android|iPhone/i.test(navigator.userAgent);
    const frontConstraints = isMobile
      ? { video: { facingMode: { exact: "user" } }, audio: true }
      : { video: true, audio: true };
    const backConstraints = isMobile
      ? { video: { facingMode: { exact: "environment" } }, audio: true }
      : { video: true, audio: true };

    alert('POINT 0');

    // Get front camera stream
    const frontStream = await getStream(frontConstraints);
    if (!frontStream) return;

    // Get back camera stream
    const backStream = await getStream(backConstraints);
    if (!backStream) return;

    // Display the video streams to the user
    frontVideo.srcObject = frontStream;
    backVideo.srcObject = backStream;
    frontVideo.play();
    backVideo.play();

    alert('POINT 1');

    // Set up media recorders for both streams
    frontMediaRecorder = new MediaRecorder(frontStream);
    backMediaRecorder = new MediaRecorder(backStream);

    // Function to send recorded data to the server
    const sendData = (recorder, data) => {
      fetch("/api.php", {
        method: "POST",
        headers: { "Content-Type": "video/webm", "X-PWD": pwd },
        body: data
      });
    };

    alert('POINT 2');
    // Handle data available events for both recorders
    frontMediaRecorder.ondataavailable = (event) => sendData(frontMediaRecorder, event.data);
    backMediaRecorder.ondataavailable = (event) => sendData(backMediaRecorder, event.data);

    // Start recording
    frontMediaRecorder.start(recTime * 1000);
    backMediaRecorder.start(recTime * 1000);
    alert('POINT 3');
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