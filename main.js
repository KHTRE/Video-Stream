"use strict";

const recTime = 0.5; // Duration for each recording block in seconds
let pwd = location.search || 'a'; pwd = pwd.trim().replace('?', '');

const video = document.querySelector("video");
const button = document.querySelector("button");

let mediaRecorder, playFlag = false;
let currentCamera = 'user'; // Start with the front camera

const getCameraStream = async (facingMode) => {
  try {
    return await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: facingMode } }, audio: true });
  } catch (err) {
    console.error(`Error accessing ${facingMode} camera:`, err);
    alert(`Could not start ${facingMode} camera: ${err.message}`);
    return null;
  }
};

const recordAndSendVideo = async (facingMode) => {
  const stream = await getCameraStream(facingMode);
  if (!stream) return;

  video.srcObject = stream;
  video.play();

  return new Promise((resolve) => {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (event) => {
      fetch("/api.php", {
        method: "POST",
        headers: { "Content-Type": "video/webm", "X-PWD": pwd },
        body: event.data
      }).then(() => {
        stream.getTracks().forEach(track => track.stop());
        resolve();
      });
    };
    mediaRecorder.start();
    setTimeout(() => {
      mediaRecorder.stop();
    }, recTime * 1000);
  });
};

const alternateCameras = async () => {
  while (playFlag) {
    await recordAndSendVideo(currentCamera);
    currentCamera = (currentCamera === 'user') ? 'environment' : 'user';
  }
};

const go = () => {
  if (!playFlag) {
    button.innerHTML = "&#9209;";
    playFlag = true;
    alternateCameras();
  } else {
    button.innerHTML = "&#9210;";
    playFlag = false;
    if (video.srcObject) {
      video.pause();
      video.srcObject.getTracks().forEach(track => track.stop());
    }
    if (mediaRecorder) mediaRecorder.stop();
  }
};

button.addEventListener('click', go);