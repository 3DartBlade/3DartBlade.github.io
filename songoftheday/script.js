 // Your YouTube API key
const API_KEY = 'AIzaSyCzRByej-Z4i80ZueZti198sy2oXfTz92E';
const PLAYLIST_ID = 'PLv1zKIp7_nrNp5UmuI-sfFkvEtdYD0dqU';

// Get references to the HTML elements
const videoPlayer = document.getElementById('video-player');
const randomVideoButton = document.getElementById('random-video-button');

// Function to fetch videos from the playlist
async function fetchPlaylistVideos() {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${PLAYLIST_ID}&maxResults=50&key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error('Failed to fetch playlist:', error);
        return [];
    }
}

// Function to pick a random video and update the iframe
function playRandomVideo(videos) {
    if (videos.length === 0) return;

    const randomIndex = Math.floor(Math.random() * videos.length);
    const videoId = videos[randomIndex].snippet.resourceId.videoId;

    videoPlayer.src = `https://www.youtube.com/embed/${videoId}`;
}

// Event listener for the button
randomVideoButton.addEventListener('click', async () => {
    const videos = await fetchPlaylistVideos();
    playRandomVideo(videos);
});
