"use strict";

// Длительность одного блока записи в секундах
const recTime = 20;

// Забираем пароль из queryString
let pwd = location.search || 'a'; pwd = pwd.trim().replace('?', '');

const video = document.querySelector("video");
const button  = document.querySelector("button");

let media, playFlag = false;

// Начать запись видео
const play = async () => {
  console.log(navigator.userAgent);

  try {
    // Если клиент зашел со смартфона, включаем основную камеру
    let c = /Android|iPhone/i.test(navigator.userAgent) 
      ? {video:{facingMode:{exact:"environment"}}, audio:true} 
      : {video:true, audio:true};

    // Получаем видеопоток с камеры и показываем его юзеру
    let stream = await navigator.mediaDevices.getUserMedia({
      video:true, 
      audio:true,
    });
    // let stream = await navigator.mediaDevices.getUserMedia(c);
    console.log('stream: ', stream);
    alert('stream 1');

    // let stream2 = await navigator.mediaDevices.getUserMedia({
    //   video:{facingMode:{exact:"user"}}, 
    //   audio:true,
    // });
    // console.log('stream2: ', stream2);
    alert('streams');
    video.srcObject = stream;
    video.play();

    // Пишем видеопоток на сервер каждые recTime секунд
    media = new MediaRecorder(stream);
    media.ondataavailable = d => {
      fetch("/api.php", {
      // fetch("https://khtre.42web.io/api.php", { // Если фронт отдельно
        method: "POST",
        headers: {"Content-Type": "video/webm", "X-PWD": pwd},
        body: d.data
      })
    };
    media.start(recTime * 1000);
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