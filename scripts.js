var state = "idle";
var currPixels;
// Title Text
const title = document.getElementById("title-text");
// Video Display
const video = document.getElementById("video");
// Elements for taking the snapshot
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
// Buttons
const takePhotoButton = document.getElementById("snap");
const confirmButton = document.getElementById("confirm");
const resetButton = document.getElementById("reset");
const uploadButton = document.getElementById("upload");

const key = "a9ba303f20ef47aebdb7a18bd3d9a747";
const endpoint = "https://htn-2019.cognitiveservices.azure.com";
const url = `${endpoint}/vision/v2.0/ocr?language=en&detectOrientation=false`;

clearCanvas();

function clearCanvas() {
  context.beginPath();
  context.rect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "white";
  context.fill();
}

function handleFiles(files) {
  const file = files[0];
  processImage(file, true);
  const img = new Image();
  resizeImage(img, canvas.width, canvas.height);
  img.src = URL.createObjectURL(file);
  state = "confirm";
}

function resizeImage(image, width, height) {
  image.onload = () => {
    context.drawImage(image, 0, 0, width, height);
  };
}

async function processImage(image, isFile) {
  const file = new File([image], 'image.png');
  const params = {
    headers: {
      "content-type": "application/octet-stream",
      "Ocp-Apim-Subscription-Key": `${key}`
    },
    body: isFile ? image : file,
    method: "POST"
  };
  const items = [];
  const result = await fetch(url, params).then(response => response.json());
  result.regions.forEach(region => {
    region.lines.forEach(line => {
      let phrase = "";
      line.words.forEach(word => {
        word = word.text.replace(/[^A-Za-z]/g, "");
        phrase = word.length > 0 ? phrase.concat(`${word} `) : phrase;
      });
      phrase.length > 0 && (!phrase.toLowerCase().includes('menu')) ? items.push(phrase) : null;
    });
  });
  console.log(items);
  return items;
}

document.addEventListener("DOMContentLoaded", async function() {});

// State Machine for rendering logic
setInterval(() => {
  video.style.display = state === "recording" ? null : "none";
  canvas.style.display = state === "recording" ? "none" : null;
  takePhotoButton.style.display = state === "confirm" ? "none" : null;
  takePhotoButton.children[0].textContent =
    state === "recording" ? "photo_camera" : "add_a_photo";
  confirmButton.style.display = state === "confirm" ? null : "none";
  resetButton.style.display = state === "idle" ? "none" : null;
  resetButton.children[0].textContent =
    state === "recording" ? "clear" : "undo";
  uploadButton.style.display = state === "idle" ? null : "none";
  if (state === "recording") {
    title.innerText = "Please take a picture!";
  } else if (state === "confirm") {
    title.innerText = "Confirm your photo!";
  } else if (state === "idle") {
    title.innerText = "Take or add a photo!";
  }
}, 50);

// Trigger photo take
takePhotoButton.addEventListener("click", function() {
  if (state === "recording") {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    video.srcObject = null;
    video.pause();
    state = "confirm";
  } else {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(function(stream) {
          video.srcObject = stream;
          video.play();
        });
    }
    state = "recording";
  }
});

resetButton.addEventListener("click", function() {
  video.srcObject = null;
  video.pause();
  clearCanvas();
  state = "idle";
});

confirmButton.addEventListener("click", function() {
  canvas.toBlob(blob => processImage(blob, false));
  clearCanvas();
  state = "idle";
});
