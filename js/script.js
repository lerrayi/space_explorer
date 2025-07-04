// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

async function fetchImageOfTheDay(date) {
    const apiKey = "lI2KOgbdKZatYeUAfiPx95ajy7cMXg2kuR8gST4v";
    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${date}`);
    if (!response.ok) {
        throw new Error("Failed to fetch image of the day");
    }
    return await response.json();
}

async function displayImageOfTheDay(selectedDate) {
    const galleryItem = document.createElement('div');
    galleryItem.classList.add('gallery-item');
    const title = document.createElement('h2');
    const date = document.createElement('p');
    const image = document.createElement('img');
    const caption = document.createElement('p');

    const data = await fetchImageOfTheDay(selectedDate).catch(error => {
        console.error('Error fetching image of the day:', error);
        return {
            url: 'img/placeholder.jpg', // Fallback image
            title: 'Placeholder Image',
            explanation: 'This is a placeholder image. Please try again later.'
        };
    });

    console.log(data);

    image.src = data.url;
    image.alt = data.title;
    title.textContent = data.title;
    date.textContent = data.date;

    caption.textContent = data.explanation;

    galleryItem.appendChild(title);
    galleryItem.appendChild(date);
    galleryItem.appendChild(image);
    galleryItem.appendChild(caption);
    document.getElementById('gallery').appendChild(galleryItem);
}

async function displayImagesForDateRange() {
    const startDate = new Date(startInput.value);
    const endDate = new Date(endInput.value);
    
    // Clear existing gallery
    document.getElementById('gallery').innerHTML = '';
    
    // Generate all dates between start and end (inclusive)
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        await displayImageOfTheDay(dateString);
        currentDate.setDate(currentDate.getDate() + 1);
    }
}

// Add event listeners to date inputs
startInput.addEventListener('change', displayImagesForDateRange);
endInput.addEventListener('change', displayImagesForDateRange);

// Initial load of images when page loads
window.addEventListener('load', displayImagesForDateRange);
