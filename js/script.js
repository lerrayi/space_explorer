// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const fetchImagesButton = document.getElementById('fetchImagesButton');
const gallery = document.getElementById('gallery');
const loadingMessage = document.getElementById('loading-message');
const loadingHeader = document.getElementById('loading-header');
const loadingText = document.getElementById('loading-text');

const spaceFacts = [
    "A day on Venus is longer than a year on Venus.",
    "The universe is about 13.8 billion years old!",
    "NASA's spacesuits would have cost $150 million if they were made today.",
    "The footprints on the Moon will last for millions of years because there is no wind!",
    "The Milky Way and the Andromeda Galaxy will collide in 3.75 billion years."
]

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

async function fetchImageOfTheDay(date) {
    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${date}`);
    if (!response.ok) {
        throw new Error("Failed to fetch image of the day");
    }
    return await response.json();
}

function isVideoMedia(data) {
    return data.media_type === 'video';
}

function createVideoElement(data) {
    const video = document.createElement('iframe');
    video.src = data.url;
    video.alt = data.title;
    video.setAttribute('frameborder', '0');
    video.setAttribute('allowfullscreen', 'true');
    video.style.width = '100%';
    video.style.height = '315px';
    return video;
}

async function createGalleryItem(selectedDate) {
    const galleryItem = document.createElement('div');
    galleryItem.classList.add('gallery-item');
    galleryItem.tabIndex = 0; // Make it focusable for accessibility
    const title = document.createElement('h2');
    const date = document.createElement('p');

    const data = await fetchImageOfTheDay(selectedDate).catch(error => {
        console.error('Error fetching image of the day:', error);
        return {
            url: 'img/placeholder.jpg', // Fallback image
            date: selectedDate,
            title: 'Image Not Found',
            explanation: 'An image could not be found for this date. Please try again later.',
            media_type: 'image'
        };
    });

    console.log(data);

    date.classList.add('lead');

    // Create media element based on type
    let mediaElement;
    if (isVideoMedia(data)) {
        mediaElement = createVideoElement(data);
    } else {
        mediaElement = document.createElement('img');
        mediaElement.src = data.url;
        mediaElement.alt = data.title;
    }

    title.textContent = data.title;
    date.textContent = data.date;

    galleryItem.appendChild(title);
    galleryItem.appendChild(date);
    galleryItem.appendChild(mediaElement);
    
    // Add click event listener to open modal
    galleryItem.addEventListener('click', () => openModal(data));
        galleryItem.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal(data);
        }
    });
    galleryItem.style.cursor = 'pointer';
    
    return galleryItem;

}

async function createImagesForDateRange() {
    const startDate = new Date(startInput.value);
    const endDate = new Date(endInput.value);
    let galleryItems = [];
    
    // Generate all dates between start and end (inclusive)
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        const galleryItem = await createGalleryItem(dateString);
        galleryItems.push(galleryItem);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return galleryItems;
}

async function displayImagesForDateRange() {
    gallery.innerHTML = ''; // Clear previous content
    displaySpaceFact();

    try {
        const galleryItems = await createImagesForDateRange();
        clearSpaceFact();
        galleryItems.forEach(item => gallery.appendChild(item));
    } catch (error) {
        clearSpaceFact();
        loadingHeader.textContent = 'Error displaying images. Please try again later.';
        console.error('Error displaying images for date range:', error);
    }
}

function displaySpaceFact() {
    const randomFact = generateSpaceFact();
    loadingHeader.textContent = 'Did You Know?';
    loadingText.textContent = randomFact;
}

function clearSpaceFact() {
    loadingHeader.textContent = '';
    loadingText.textContent = '';
}

function generateSpaceFact() {
    const randomIndex = Math.floor(Math.random() * spaceFacts.length);
    return spaceFacts[randomIndex];
}

// Add modal styles to the document
function addModalStyles() {
    if (document.getElementById('modal-styles')) return; // Styles already added
    
    const link = document.createElement('link');
    link.id = 'modal-styles';
    link.rel = 'stylesheet';
    link.href = 'modal.css';
    document.head.appendChild(link);
}

function openModal(data) {
    // Add modal styles if not already added
    addModalStyles();
    
    // Create appropriate media element for modal
    let mediaHtml;
    if (isVideoMedia(data)) {
        mediaHtml = `<iframe src="${data.url}" frameborder="0" allowfullscreen="true" class="modal-video"></iframe>`;
    } else {
        mediaHtml = `<img src="${data.url}" alt="${data.title}" class="modal-image">`;
    }
    
    // Create modal elements
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <h2>${data.title}</h2>
            <p class="modal-date">${data.date}</p>
            ${mediaHtml}
            <p class="modal-explanation">${data.explanation}</p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    const closeButton = modal.querySelector('.close-button');
    closeButton.addEventListener('click', () => closeModal(modal));
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
    
    // Show modal
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.removeChild(modal);
}

// Add event listeners to date inputs
fetchImagesButton.addEventListener('click', displayImagesForDateRange);