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

async function displayImageOfTheDay() {
    console.log(await fetchImageOfTheDay("2025-01-01"));

    const galleryItem = document.createElement('div');
    galleryItem.classList.add('gallery-item');
    const image = document.createElement('img');
    const caption = document.createElement('p');

    const data = await fetchImageOfTheDay("2025-01-01").catch(error => {
        console.error('Error fetching image of the day:', error);
        return {
            url: 'img/placeholder.jpg', // Fallback image
            title: 'Placeholder Image',
            explanation: 'This is a placeholder image. Please try again later.'
        };
    });

    image.src = data.url;
    image.alt = data.title;
    caption.textContent = data.explanation;

    galleryItem.appendChild(image);
    galleryItem.appendChild(caption);
    document.getElementById('gallery').appendChild(galleryItem);
}

displayImageOfTheDay().catch(error => {
    console.error('Error displaying image:', error);
});
