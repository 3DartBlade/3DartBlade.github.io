 // Your YouTube API key
 // Please be nice
const API_KEY = 'AIzaSyCzRByej-Z4i80ZueZti198sy2oXfTz92E';
const PLAYLIST_ID = 'PLv1zKIp7_nrNp5UmuI-sfFkvEtdYD0dqU';

// Get references to the HTML elements
const videoPlayer = document.getElementById('video-player');
const randomVideoButton = document.getElementById('random-video-button');

// Function to fetch videos from the playlist
async function fetchPlaylistVideos() {
    let videos = [];
    let nextPageToken = '';
    const maxResults = 50;

    do {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${PLAYLIST_ID}&maxResults=${maxResults}&pageToken=${nextPageToken}&key=${API_KEY}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            videos = videos.concat(data.items);
            nextPageToken = data.nextPageToken || ''; // If nextPageToken is undefined, stop fetching
        } catch (error) {
            console.error('Failed to fetch playlist:', error);
            break;
        }
    } while (nextPageToken); // Continue fetching as long as there is a nextPageToken

    return videos;
}

// Function to pick a random video and update the iframe
function playRandomVideo(videos) {
    var now = new Date();
    if (videos.length === 0) return;

    const randomIndex = Math.floor(RandomWithSeed(Math.floor(now/8.64e7)) * videos.length);
    const videoId = videos[randomIndex].snippet.resourceId.videoId;

    videoPlayer.src = `https://www.youtube.com/embed/${videoId}`;
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
// Event listener for the button
randomVideoButton.addEventListener('click', async () => {
    const videos = await fetchPlaylistVideos();
    playRandomVideo(videos);
});
