 // Your YouTube API key
 // Please be nice
const API_KEY = 'AIzaSyCzRByej-Z4i80ZueZti198sy2oXfTz92E';
const PLAYLIST_ID = 'PLv1zKIp7_nrNp5UmuI-sfFkvEtdYD0dqU';

// Get references to the HTML elements
const videoPlayer = document.getElementById('video-player');
const randomVideoButton = document.getElementById('random-video-button');

async function fetchPlaylistLength() {
    const url = `https://www.googleapis.com/youtube/v3/playlists?part=contentDetails&id=${PLAYLIST_ID}&key=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.items[0].contentDetails.itemCount; // The total number of videos in the playlist
    } catch (error) {
        console.error('Failed to fetch playlist length:', error);
        return 0;
    }
}

// Function to fetch a specific video by its index
async function fetchVideoByIndex(index) {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${PLAYLIST_ID}&maxResults=1&pageToken=${calculatePageToken(index)}&key=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.items[0].snippet.resourceId.videoId;
    } catch (error) {
        console.error('Failed to fetch video by index:', error);
        return null;
    }
}

// Function to calculate the appropriate page token
function calculatePageToken(index) {
    // The API doesn't provide a direct way to get a specific index; you'd need to iterate through pages.
    // As an alternative, you could request 50 items at a time and use the index to find the correct item.

    const maxResults = 50;
    const page = Math.floor(index / maxResults);
    return page > 0 ? `&pageToken=${page}` : '';
}

// Function to play a random video
async function playRandomVideo() {
    var now = new Date();
    const totalVideos = await fetchPlaylistLength();
    if (totalVideos === 0) return;
    
    const randomIndex = Math.floor(RandomWithSeed(Math.floor(now/8.64e7)) * totalVideos);
    const videoId = await fetchVideoByIndex(randomIndex);
    
    if (videoId) {
        videoPlayer.src = `https://www.youtube.com/embed/${videoId}`;
    }
}
function RandomWithSeed(seed){
    // the initial seed
    Math.seed = seed;

    // in order to work 'Math.seed' must NOT be undefined,
    // so in any case, you HAVE to provide a Math.seed
    Math.seededRandom = function(max, min) {
        max = max || 1;
        min = min || 0;
 
        Math.seed = (Math.seed * 9301 + 49297) % 233280;
        var rnd = Math.seed / 233280;

        return min + rnd * (max - min);
    }
 return Math.seededRandom();
}
// Event listener for the button
randomVideoButton.addEventListener('click', playRandomVideo);
