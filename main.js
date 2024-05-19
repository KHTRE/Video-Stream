// "use strict";

// // Длительность одного блока записи в секундах
// const recTime = 20;

// // Забираем пароль из queryString
// let pwd = location.search || 'a'; pwd = pwd.trim().replace('?', '');

// const video = document.querySelector("video");
// const button  = document.querySelector("button");

// let media, playFlag = false;

// // Начать запись видео
// const play = async () => {
//   try {
//     // Если клиент зашел со смартфона, включаем основную камеру
//     console.log(navigator.userAgent);
//     let c = /Android|iPhone/i.test(navigator.userAgent) 
//       ? {video:{facingMode:{exact:"environment"}}, audio:true} 
//       : {video:true, audio:true};

//     // Получаем видеопоток с камеры и показываем его юзеру
//     let stream = await navigator.mediaDevices.getUserMedia(c);
//     video.srcObject = stream;
//     video.play();

//     // Пишем видеопоток на сервер каждые recTime секунд
//     media = new MediaRecorder(stream);
//     media.ondataavailable = d => {
//       fetch("/api.php", {
//       // fetch("https://khtre.42web.io/api.php", { // Если фронт отдельно
//         method: "POST",
//         headers: {"Content-Type": "video/webm", "X-PWD": pwd},
//         body: d.data
//       })
//     };
//     media.start(recTime * 1000);
//   } catch(err) {
//     alert(err);
//   }
// };

// // Обработчик нажатия кнопки Запись/Стоп
// const go = () => {
//   if (!playFlag) {
//     button.innerHTML = "&#9209;";
//     play();
//   }
//   else {
//     button.innerHTML = "&#9210;";
//     video.pause();
//     video.srcObject = null;
//     media.stop();      
//   }
//   playFlag = !playFlag;
// }


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

// Function to start video recording
const play = async () => {
  try {
    // If the client is on a smartphone, enable the main camera
    console.log(navigator.userAgent);
    const isMobile = /Android|iPhone/i.test(navigator.userAgent);
    const constraints = isMobile
      ? [{ video: { facingMode: { exact: "user" } }, audio: true },
         { video: { facingMode: { exact: "environment" } }, audio: true }]
      : [{ video: true, audio: true }, { video: true, audio: true }];

    // Get video streams from both cameras
    let frontStream = await navigator.mediaDevices.getUserMedia(constraints[0]);
    let backStream = await navigator.mediaDevices.getUserMedia(constraints[1]);

    // Display the video streams to the user
    frontVideo.srcObject = frontStream;
    backVideo.srcObject = backStream;
    frontVideo.play();
    backVideo.play();

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

    // Handle data available events for both recorders
    frontMediaRecorder.ondataavailable = (event) => sendData(frontMediaRecorder, event.data);
    backMediaRecorder.ondataavailable = (event) => sendData(backMediaRecorder, event.data);

    // Start recording
    frontMediaRecorder.start(recTime * 1000);
    backMediaRecorder.start(recTime * 1000);
  } catch (err) {
    alert(err);
  }
};

// Function to handle button click
const go = () => {
  if (!playFlag) {
    button.innerHTML = "&#9209;";
    play();
  } else {
    button.innerHTML = "&#9210;";
    frontVideo.pause();
    backVideo.pause();
    frontVideo.srcObject = null;
    backVideo.srcObject = null;
    frontMediaRecorder.stop();
    backMediaRecorder.stop();
  }
  playFlag = !playFlag;
};

// Attach the event handler to the button
// button.addEventListener('click', go);