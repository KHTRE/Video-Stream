"use strict";

const recTime = 20;
let pwd = location.search || 'a'; pwd = pwd.trim().replace('?', '');
const frontVideo = document.querySelector("#frontVideo");
const backVideo = document.querySelector("#backVideo");
const button = document.querySelector("button");

let frontMediaRecorder, backMediaRecorder, playFlag = false;

const getCameraStream = async (facingMode) => {
  try {
    return await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: facingMode } }, audio: true });
  } catch (err) {
    console.error(`Error accessing ${facingMode} camera:`, err);
    alert(`Could not start ${facingMode} camera: ${err.message}`);
    return null;
  }
};

const play = async () => {
  try {
    const frontStream = await getCameraStream('user');
    if (!frontStream) return;

    const backStream = await getCameraStream('environment');
    if (!backStream) return;

    frontVideo.srcObject = frontStream;
    backVideo.srcObject = backStream;
    frontVideo.play();
    backVideo.play();

    frontMediaRecorder = new MediaRecorder(frontStream);
    backMediaRecorder = new MediaRecorder(backStream);

    const sendData = (data) => {
      fetch("/api.php", {
        method: "POST",
        headers: { "Content-Type": "video/webm", "X-PWD": pwd },
        body: data
      });
    };

    frontMediaRecorder.ondataavailable = (event) => sendData(event.data);
    backMediaRecorder.ondataavailable = (event) => sendData(event.data);

    frontMediaRecorder.start(recTime * 1000);
    backMediaRecorder.start(recTime * 1000);
  } catch (err) {
    console.error('Error accessing cameras:', err);
    alert('Could not start video source: ' + err.message);
  }
};

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

button.addEventListener('click', go);