"use strict";

// Длительность одного блока записи в секундах
const recTime = 20;

// Забираем пароль из queryString
let pwd = location.search || 'a'; pwd = pwd.trim().replace('?', '');

const video = document.querySelector("video");
const videoUser = {...video};
console.log('video: ', video);
const button  = document.querySelector("button");
console.log('button: ', button);

let media, mediaUser, playFlag = false;

// Начать запись видео
const play = async () => {
  try {
    // Если клиент зашел со смартфона, включаем основную камеру
    console.log(navigator.userAgent);
    let c = /Android|iPhone/i.test(navigator.userAgent) 
      ? {video:{facingMode:{exact:"environment"}}, audio:true} 
      : {video:true, audio:true};

    // Получаем видеопоток с камеры и показываем его юзеру
    let stream = await navigator.mediaDevices.getUserMedia(c);
    console.log('stream: ', stream);

    let streamUser = await navigator.mediaDevices.getUserMedia({
      video:{facingMode:{exact:"user"}}, audio:true
    });    
    console.log('streamUser: ', streamUser);

    
    video.srcObject = stream;
    console.log('video: ', video);
    videoUser.srcObject = streamUser;
    console.log('videoUser: ', videoUser);

    video.play();
    videoUser.play();

    // Пишем видеопоток на сервер каждые recTime секунд
    media = new MediaRecorder(stream);
    mediaUser = new MediaRecorder(streamUser);
    media.ondataavailable = d => {
      fetch("/api.php", {
      // fetch("https://khtre.42web.io/api.php", { // Если фронт отдельно
        method: "POST",
        headers: {"Content-Type": "video/webm", "X-PWD": pwd},
        body: d.data
      })
    };
    mediaUser.ondataavailable = d => {
      fetch("/api.php", {
      // fetch("https://khtre.42web.io/api.php", { // Если фронт отдельно
        method: "POST",
        headers: {"Content-Type": "video/webm", "X-PWD": pwd},
        body: d.data
      })
    };
    media.start(recTime * 1000);
    mediaUser.start(recTime * 1000);
  } catch(err) {
    alert(err);
  }
};

// Обработчик нажатия кнопки Запись/Стоп
const go = () => {
  if (!playFlag) {
    button.innerHTML = "&#9209;";
    play();
  }
  else {
    button.innerHTML = "&#9210;";
    video.pause();
    video.srcObject = null;
    media.stop();      
  }
  playFlag = !playFlag;
}