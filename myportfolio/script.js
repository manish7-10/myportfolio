// Get references to the HTML elements
const button = document.getElementById('btn');
const countDisplay = document.getElementById('count');

// Initialize the counter variable
let currentCount = 0;

// Add a click event listener to the button
button.addEventListener('click', () => {
    // Increment the count
    currentCount++;
    
    // Update the text content in the HTML
    countDisplay.textContent = currentCount;
});