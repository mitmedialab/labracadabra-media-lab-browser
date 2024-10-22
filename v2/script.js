const apiKey = "";
const defaultImageSources = []; // default empty array

// Function to load and add image sources from localStorage
function loadImageSources() {
    const data = localStorage.getItem('imageSources');
    return data ? JSON.parse(data) : defaultImageSources;
}

function addImageSource(id, path) {
    imageSources.unshift([id, path]);
    localStorage.setItem('imageSources', JSON.stringify(imageSources));
}

const imageSources = loadImageSources();

const yearElement = document.getElementById('year');

const digits = [
    document.getElementById('digit1'),
    document.getElementById('digit2'),
    document.getElementById('digit3'),
    document.getElementById('digit4')
];
const tickSound = document.getElementById('tickSound');

let currentYear = 2024; // Initialize the current year
let currentIndex = 0;
let isScrolling = false; // Flag to prevent multiple scrolls at once

document.addEventListener('keydown', onWheel);

yearElement.addEventListener('mouseenter', () => {
    document.addEventListener('wheel', onWheel);
});

yearElement.addEventListener('mouseleave', () => {
    document.removeEventListener('wheel', onWheel);
});

function onWheel(event) {
    event.preventDefault(); // Prevent page scrolling

    let deltaY = 0;
    if (event.key === 'ArrowUp') {
        console.log("up")
        deltaY = 1;
    }
    else if(event.key === 'ArrowDown'){
        console.log("down");
        deltaY = -1;
    }
    else if(event.key==='Enter'){
        console.log("enter");
        document.removeEventListener('keydown', onWheel);
        showVideo();
        return;
    }
    else{
        deltaY = event.deltaY;
    }

    if (deltaY < 0) {
        if (currentYear > 1985 && currentYear <= 2024) {
            currentYear--;
            playTickSound();
        } else if (currentYear === 2050) {
            currentYear = 2024;
            playTickSound();
        }
    } else {
        if (currentYear < 2024) {
            currentYear++;
            playTickSound();
        } else if (currentYear === 2024) {
            currentYear = 2050;
            playTickSound();
        }
    }
    updateDigits(currentYear);
}

function updateDigits(year) {
    const yearString = year.toString();
    for (let i = 0; i < digits.length; i++) {
        digits[i].textContent = yearString[i];
    }
}

function playTickSound() {
    tickSound.currentTime = 0; // Rewind to the start
    tickSound.play();
}

async function showVideo() {
    const container = document.querySelector('.container');
    const videoColumn = document.getElementById('video-column');
    const currentYear = Number(digits.map(digit => digit.textContent).join(''));
    
    async function loadVideoSources(jsonPath) {
        const response = await fetch(jsonPath);  // Fetch the JSON file
        const videoSources = await response.json();  // Parse the JSON file
        console.log(videoSources);  // Use the loaded JSON data

        return videoSources;
    }
    
    // Call the function with the path to your JSON file
    let videoSources = await loadVideoSources('vids.json');

    // Clear existing video wrappers
    videoColumn.innerHTML = '';

    // Move
    container.style.transform = 'translateX(-33vw)';
    videoColumn.classList.add('visible');

    // Go to generate future
    if (currentYear == 2050){
        createGenerationUI(videoColumn);
        return;
    }
    
    // Add wheel event listener for scrolling through videos
    videoColumn.addEventListener('wheel', onVideoScroll);
    document.addEventListener('keydown', onVideoScroll);

    // Create video wrappers based on videoSources
    const randomizedSources = videoSources[currentYear].sort(() => Math.random() - 0.5);
    randomizedSources.forEach((src, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'video-wrapper';
        if (index === 0) wrapper.classList.add('active'); // Initial video active

        const video = document.createElement('video');
        console.log(src);
        video.src = src;
        video.controls = false;

        // Add video
        wrapper.appendChild(video);
        videoColumn.appendChild(wrapper);
    });

    // Start video
    var video = document.querySelector('.video-wrapper.active video');
    video.currentTime = 0; // Set video time to zero
    video.play(); // Play the video
}

function onVideoScroll(event) {
    if (isScrolling) return; // Prevent handling multiple scrolls at once

    const yearVideos = document.querySelectorAll('.video-wrapper');
    let deltaY = 0;

    if (event.key === 'ArrowUp') {
        deltaY = 1;
    }
    else if(event.key === 'ArrowDown'){
        deltaY = -1;
    }
    else if(event.key === 'Enter'){
        currentIndex = 0;
        const container = document.querySelector('.container');
        const videoColumn = document.getElementById('video-column');
        
        container.style.transform = 'translateX(0vw)';
        videoColumn.removeEventListener('keydown', onVideoScroll);
        videoColumn.classList.remove('visible');
        document.addEventListener('keydown', onWheel);

        // Start video
        var video = document.querySelector('.video-wrapper.active video');
        video.pause(); // Play the video
        video.currentTime = 0; // Set video time to zero
    }
    else{
        deltaY = event.deltaY;
    }

    // Scroll Down
    if (deltaY > 0 && currentIndex < yearVideos.length - 1) {
        isScrolling = true;

        // Stop video
        var video = document.querySelector('.video-wrapper.active video');
        video.pause();
        video.currentTime = 0; // Set video time to zero

        yearVideos[currentIndex].classList.remove('active');
        yearVideos[currentIndex].classList.add('previous');
        
        currentIndex++;
        yearVideos[currentIndex].classList.remove('next');
        yearVideos[currentIndex].classList.add('active');
        
        // Start video
        var video = document.querySelector('.video-wrapper.active video');
        video.currentTime = 0; // Set video time to zero
        video.play(); // Play the video

        setTimeout(() => {
            isScrolling = false;
        }, 2000); // Timeout duration matches transition duration

    // Scroll Up
    } else if (deltaY < 0 && currentIndex > 0) {
        isScrolling = true;

        // Stop video
        var video = document.querySelector('.video-wrapper.active video');
        video.pause();
        video.currentTime = 0; // Set video time to zero
        
        // Check if 'yearVideos' and 'currentIndex' are correctly set
        if (yearVideos[currentIndex]) {
            yearVideos[currentIndex].classList.remove('active');
        }
        yearVideos[currentIndex].classList.add('next');

        currentIndex--;
        yearVideos[currentIndex].classList.remove('previous');
        yearVideos[currentIndex].classList.add('active');

        // Start video
        var video = document.querySelector('.video-wrapper.active video');
        video.currentTime = 0; // Set video time to zero
        video.play(); // Play the video

        setTimeout(() => {
            isScrolling = false;
        }, 2000); // Timeout duration matches transition duration
    }
    else if (deltaY < 0 && currentIndex == 0){

        // If top video
        const container = document.querySelector('.container');
        const videoColumn = document.getElementById('video-column');
        
        container.style.transform = 'translateX(0vw)';
        videoColumn.classList.remove('visible');
        
        // Add wheel event listener for scrolling through videos
        document.addEventListener('keydown', onWheel);
        videoColumn.removeEventListener('wheel', onVideoScroll);
        videoColumn.removeEventListener('keydown', onVideoScroll);
        
        // Stop video
        var video = document.querySelector('.video-wrapper.active video');
        video.pause();
        video.currentTime = 0; // Set video time to zero

        isScrolling = false;
    }

    else if (deltaY > 0 && currentIndex == yearVideos.length - 1){
        // play thud sound
    }
}


async function createGenerationUI(column) {

    // Remove event listeners
    document.removeEventListener('wheel', onVideoScroll);
    document.removeEventListener('keydown', onVideoScroll);
    document.removeEventListener('wheel', onWheel);
    document.removeEventListener('keydown', onWheel);

    // Create elements
    const wrapper = document.createElement('div');
    const inputBar = document.createElement('div');
    const submitButton = document.createElement('div');
    const videoColumn = document.createElement('div');
    const UI = document.createElement('div');

    // Set attributes and styles
    wrapper.className = 'future-wrapper';
    inputBar.className = 'input-bar';

    // Start with one input character
    const initialCharacter = document.createElement('div');
    initialCharacter.className = 'character focus';
    initialCharacter.setAttribute('data-locked', 'false');
    initialCharacter.tabIndex = 0;
    initialCharacter.textContent = 'A';
    inputBar.appendChild(initialCharacter);

    submitButton.className = 'submit-button';
    submitButton.tabIndex = 0;
    submitButton.textContent = 'Submit';
    inputBar.appendChild(submitButton);

    videoColumn.className = 'img-column';

    UI.className = 'UI';

    // Create image wrappers based on imageSources
    imageSources.forEach((src, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'video-wrapper';
        if (index === 0) wrapper.classList.add('active'); // Initial video active

        const img = document.createElement('img');
        img.src = src[1];

        const text = document.createElement('span');
        text.innerHTML = src[0];

        wrapper.appendChild(img);
        wrapper.appendChild(text);
        videoColumn.appendChild(wrapper);
    });

    // Append elements
    wrapper.append(inputBar);
    wrapper.append(videoColumn);
    wrapper.append(UI);
    column.append(wrapper);

    // JavaScript for input logic
    let currentFocus = 0;
    let imageFocus = false;

    document.addEventListener('keydown', handleKeydown);

    async function handleKeydown(e) {
        const focusedElement = inputBar.children[currentFocus];
        const images = videoColumn.querySelectorAll('.video-wrapper');
        const focusedImage = [...images].find(img => img.classList.contains('active'));

        if (imageFocus) {
            if (e.key === 'ArrowUp') {
                let nextImage = (focusedImage ? [...images].indexOf(focusedImage) + 1 : 0) % images.length;
                focusedImage.classList.remove('active');
                images[nextImage].classList.add('active');
            } else if (e.key === 'ArrowDown') {
                let prevImageIndex = [...images].indexOf(focusedImage) - 1;
                focusedImage.classList.remove('active');
                if (prevImageIndex < 0) {
                    imageFocus = false;
                    currentFocus = inputBar.children.length - 1;
                    inputBar.children[currentFocus].classList.add('focus');
                } else {
                    images[prevImageIndex].classList.add('active');
                }
            }
        } else {
            if (e.key === 'ArrowRight' && focusedElement.dataset.locked !== 'true') {
                moveFocus(1);
                playTickSound();
            } else if (e.key === 'ArrowLeft' && focusedElement.dataset.locked !== 'true') {
                moveFocus(-1);
                playTickSound();
            } else if (e.key === 'Enter') {
                if (currentFocus === inputBar.children.length - 1) {

                    // Generate image if button pressed
                    console.log("Generating image");
                    playTickSound();
                    let prompt = Array.from(inputBar.querySelectorAll('.character')).map(c => c.textContent).join('');
                    imageUrl = await generateImage("DSLR Photo of "+prompt);
                    addImageSource(prompt, imageUrl);
                    showVideo();

                } else {
                    toggleLock(focusedElement);
                    if (currentFocus === inputBar.children.length - 2 && focusedElement.dataset.locked === 'true') {
                        addEmptyCharacter();
                    }
                }
            } else if (e.key === 'ArrowUp') {
                if (currentFocus === inputBar.children.length - 1) {
                    if (images.length <= 0){
                        console.log("Is zero")
                        return;
                    }
                    imageFocus = true;
                    if (focusedImage) {
                        focusedImage.classList.remove('active');
                    }
                    images[0].classList.add('active');
                    inputBar.children[currentFocus].classList.remove('focus');
                } else if (focusedElement.dataset.locked === 'true') {
                    changeCharacter(e.key, focusedElement);
                    playTickSound();
                } else {
                    moveFocus(1);
                    playTickSound();
                }
            } else if (e.key === 'ArrowDown') {
                if (focusedElement.dataset.locked === 'true') {
                    changeCharacter(e.key, focusedElement);
                    playTickSound();
                }
                else if (currentFocus > 0) {
                    moveFocus(-1);
                    playTickSound();
                }
                else if (currentFocus == 0){
                    // If top video
                    const container = document.querySelector('.container');
                    const videoColumn = document.getElementById('video-column');
                    document.removeEventListener('keydown', handleKeydown);
                    
                    container.style.transform = 'translateX(0vw)';
                    videoColumn.classList.remove('visible');
                    
                    // Add wheel event listener for scrolling through videos
                    document.addEventListener('keydown', onWheel);
                }
            }
        }
    }

    function moveFocus(direction) {
        inputBar.children[currentFocus].classList.remove('focus');
        currentFocus = (currentFocus + direction + inputBar.children.length) % inputBar.children.length;
        inputBar.children[currentFocus].classList.add('focus');
    }

    function toggleLock(element) {
        if (element.dataset.locked === 'true') {
            element.dataset.locked = 'false';
            moveFocus(1);
        } else {
            element.dataset.locked = 'true';
        }
    }

    function changeCharacter(key, element) {
        const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ ';
        const charIndex = validChars.indexOf(element.textContent);
        if (key === 'ArrowDown') {
            element.textContent = validChars[(charIndex + 1) % validChars.length];
        } else if (key === 'ArrowUp') {
            element.textContent = validChars[(charIndex - 1 + validChars.length) % validChars.length];
        }
    }

    function addEmptyCharacter() {
        const newChar = document.createElement('div');
        newChar.className = 'character';
        newChar.dataset.locked = 'false';
        newChar.textContent = ' ';
        newChar.tabIndex = 0;
        inputBar.insertBefore(newChar, submitButton);
    }
}

async function generateImage(prompt) {
    console.log(prompt);
    const apiUrl = 'https://api.openai.com/v1/images/generations';
    
    const data = {
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1792x1024"
    };
    
    try{
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
                },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();
        return responseData.data[0].url; 
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error;
      }
  }


  /* Screensaver */
  let screensaverTimeout;
const SCREENSAVER_DELAY = 10000; // 10 seconds
const screensaverVideo = document.createElement('video');
screensaverVideo.src = 'labratitle.mov';
screensaverVideo.loop = true; // Ensure it loops
screensaverVideo.classList.add('screensaver'); // Ensure it loops


document.body.appendChild(screensaverVideo);

function resetScreensaverTimer() {
    if (screensaverTimeout) {
        clearTimeout(screensaverTimeout);
    }
    screensaverTimeout = setTimeout(startScreensaver, SCREENSAVER_DELAY);
}

function startScreensaver() {
    if (!isAnyVideoPlaying() && !screensaverVideoPlaying) {
        screensaverVideo.style.display = 'block';    // Make the screensaver video visible
        screensaverVideo.play();
    }
}

function stopScreensaver() {
    if (screensaverVideoPlaying) {
        screensaverVideo.pause();
        screensaverVideo.currentTime = 0;
        screensaverVideo.style.display = 'none';
    }
}

function isAnyVideoPlaying() {
    const videos = document.querySelectorAll('video');
    return Array.from(videos).some(video => !video.paused && video !== screensaverVideo);
}

function userActivityDetected() {
    stopScreensaver();
    resetScreensaverTimer();
}

let screensaverVideoPlaying = false;

screensaverVideo.addEventListener('play', () => {
    screensaverVideoPlaying = true;
});

screensaverVideo.addEventListener('pause', () => {
    screensaverVideoPlaying = false;
});

// Reset the screensaver timer on key press or mouse movement
document.addEventListener('keydown', userActivityDetected);
document.addEventListener('mousemove', userActivityDetected);
document.addEventListener('mousedown', userActivityDetected);

// Initially set the timer
resetScreensaverTimer();