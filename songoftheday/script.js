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
    const maxResults = 50;
    const page = Math.floor(index / maxResults);
    const videoIndexInPage = index % maxResults;

    let pageToken = '';
    for (let i = 0; i < page; i++) {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${PLAYLIST_ID}&maxResults=${maxResults}&pageToken=${pageToken}&key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        pageToken = data.nextPageToken;
    }

    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${PLAYLIST_ID}&maxResults=${maxResults}&pageToken=${pageToken}&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.items[videoIndexInPage].snippet.resourceId.videoId;
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
