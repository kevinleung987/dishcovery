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
const carousel = document.getElementById("carousel");

const key = "Kevin-key";
const endpoint = "https://htn-2019.cognitiveservices.azure.com";
const url = `${endpoint}/vision/v2.0/ocr?language=en&detectOrientation=false`;

const searchKey = "Jerry-key";
const searchEndpoint =
    "https://hackthenorth19-bingsearch.cognitiveservices.azure.com";
const searchURL = `${searchEndpoint}/bing/v7.0`;
const searchImageURL = `${searchEndpoint}/bing/v7.0/images`;

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
    const queryURL = `${searchImageURL}/search?q=${queryItem}&mkt=en-us`;
    const params = {
        headers: {
            "Ocp-Apim-Subscription-Key": `${searchKey}`
        },
        method: "GET"
    };
    const result = fetch(queryURL, params).then(async response => {
        const res = await response.json();
        if (!res["value"] || res["value"].length === 0) {
            return null;
        }
        const url = res["value"][0]["contentUrl"];
        return url;
    });
    return result;
}

function searchWeb(queryItem) {
    const queryURL = `${searchURL}/search?q=${queryItem}Description&textDecoration=true&textFormat=HTML`;
    const params = {
        headers: {
            "Ocp-Apim-Subscription-Key": `${searchKey}`
        },
        method: "GET"
    };
    const result = fetch(queryURL, params).then(async response => {
        const res = await response.json();
        if (!res["webPages"]["value"] || res["webPages"]["value"].length === 0) {
            return null;
        }
        const description = decodeHtml(res["webPages"]["value"][0]["snippet"]);
        return description;
    });
    return result;
}

function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

async function processImage(image, isFile) {
    const file = new File([image], "image.png");
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
    const descPromiseList = [];
    const result = await fetch(url, params).then(response => response.json());
    result.regions.forEach(region => {
        region.lines.forEach(line => {
            let phrase = "";
            line.words.forEach(word => {
                word = word.text.replace(/[^A-Za-z]/g, "");
                phrase = word.length > 0 ? phrase.concat(`${word} `) : phrase;
            });
            phrase.length > 0 && !phrase.toLowerCase().includes("menu") ?
                items.push(phrase) :
                null;
        });
    });
    console.log(items);
    items.forEach(item => {
        urlPromisesList.push(searchImage(item));
        descPromiseList.push(searchWeb(item));
    });

    const listOfFoodURL = await Promise.all(urlPromisesList);
    const listOfFoodDesc = await Promise.all(descPromiseList);

    const foodResult = [];
    for (index = 0; index < listOfFoodURL.length; index++) {
        const foodDict = {};
        foodDict["name"] = items[index];
        foodDict["contentURL"] = listOfFoodURL[index];
        foodDict["description"] = listOfFoodDesc[index];
        foodResult.push(foodDict);
    }
    displayPicture(foodResult);
    console.log(foodResult);
    return items;
}

document.addEventListener("DOMContentLoaded", async function() {
    setUpCarousel();
});

let active = false;

function displayPicture(res) {
    res.forEach(item => {
        if (item.contentURL) {
            const div = document.createElement("div");
            div.style.backgroundImage = "url(" + item.contentURL + ")";
            // div.id = item.name;
            div.className = "carousel-item display-item";
            if (!active) {
                div.className += " active";
                active = true;
            }

            const p = document.createElement("p");
            p.className = "black-text white";

            const name = document.createElement("b");
            name.innerText = item.name;
            p.appendChild(name);
            const div2 = document.createElement("div");
            div2.innerText = item.description;
            p.appendChild(div2);

            div.appendChild(p);

            carousel.appendChild(div);
        }
    });
    setUpCarousel();
}

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
        title.innerText = "Take a photo or upload an image of a menu.";
    } else if (state === "confirm") {
        title.innerText = "Please confirm your photo.";
    } else if (state === "idle") {
        title.innerText = "Take a photo or upload an image of a menu.";
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
    clearCanvas();
    state = "idle";
});

function setUpCarousel() {
    // start carrousel
    $(".carousel.carousel-slider").carousel({
        fullWidth: true,
        indicators: false
    });

    // move next carousel
    $(".moveNextCarousel").click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(".carousel").carousel("next");
    });

    // move prev carousel
    $(".movePrevCarousel").click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(".carousel").carousel("prev");
    });
}