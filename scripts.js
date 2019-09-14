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

const searchKey = "0cbaf33d08b84d8497428aca67d6b512";
const searchEndpoint =
    "https://hackthenorth19-bingsearch.cognitiveservices.azure.com";
const searchURL = `${searchEndpoint}/bing/v7.0/images`;

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

function searchImage(queryItem) {
    const queryURL = `${searchURL}/search?q=${queryItem}&mkt=en-us`;
    const params = {
        headers: {
            "Ocp-Apim-Subscription-Key": `${searchKey}`
        },
        method: "GET"
    }
    const result = fetch(queryURL, params).then(async response => {
        const res = await response.json();
        if (!res["value"] || res["value"].length === 0) { return null; }
        return res["value"][0]["contentUrl"];
    });
    return result;
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
    const urlPromisesList = [];
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
    items.forEach((item) => urlPromisesList.push(searchImage(item)));

    const listOfFoodURL = await Promise.all(urlPromisesList);

    const resultURL = [];
    for (index = 0; index < listOfFoodURL.length; index++) {
        const foodDict = {};
        foodDict['name'] = items[index];
        foodDict['contentURL'] = listOfFoodURL[index];
        resultURL.push(foodDict);
    }
    console.log(resultURL);
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