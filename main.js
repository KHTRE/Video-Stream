"use strict";

const recTime = 500; // Duration for each recording block in milliseconds
let pwd = location.search || 'a'; pwd = pwd.trim().replace('?', '');

const frontVideo = document.querySelector("#frontVideo");
const backVideo = document.querySelector("#backVideo");
const canvas = document.querySelector("#compositeCanvas");
const button = document.querySelector("#startButton");

let mediaRecorder, playFlag = false;

const getCameraStream = async (facingMode) => {
  try {
    return await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: facingMode } }, audio: false });
  } catch (err) {
    console.error(`Error accessing ${facingMode} camera:`, err);
    alert(`Could not start ${facingMode} camera: ${err.message}`);
    return null;
  }
};

const startRecording = async () => {
  const frontStream = await getCameraStream('user');
  const backStream = await getCameraStream('environment');
  if (!frontStream || !backStream) return;

  frontVideo.srcObject = frontStream;
  backVideo.srcObject = backStream;

  const [frontTrack] = frontStream.getVideoTracks();
  const [backTrack] = backStream.getVideoTracks();

  const canvasStream = canvas.captureStream(30); // 30 FPS
  mediaRecorder = new MediaRecorder(canvasStream);

  mediaRecorder.ondataavailable = async (event) => {
    if (event.data.size > 0) {
      await fetch("/api.php", {
        method: "POST",
        headers: { "Content-Type": "video/webm", "X-PWD": pwd },
        body: event.data
      });
    }
  };

  mediaRecorder.start();

  const ctx = canvas.getContext('2d');
  const width = frontVideo.videoWidth;
  const height = frontVideo.videoHeight;
  canvas.width = width * 2; // Side by side
  canvas.height = height;

  const drawCompositeFrame = () => {
    if (!playFlag) return;

    ctx.drawImage(frontVideo, 0, 0, width, height);
    ctx.drawImage(backVideo, width, 0, width, height);

    requestAnimationFrame(drawCompositeFrame);
  };

  frontVideo.onloadedmetadata = () => {
    drawCompositeFrame();
  };

  backVideo.onloadedmetadata = () => {
    drawCompositeFrame();
  };

  frontVideo.play();
  backVideo.play();
};

const stopRecording = () => {
  playFlag = false;
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  [frontVideo, backVideo].forEach(video => {
    if (video.srcObject) {
      video.pause();
      video.srcObject.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
  });
};

button.addEventListener('click', () => {
  playFlag = !playFlag;
  if (playFlag) {
    button.textContent = 'Stop';
    startRecording();
  } else {
    button.textContent = 'Start';
    stopRecording();
  }
});