 // Your YouTube API key
 // Please be nice
const API_KEY = 'AIzaSyCzRByej-Z4i80ZueZti198sy2oXfTz92E';
const PLAYLIST_ID = 'PLv1zKIp7_nrNp5UmuI-sfFkvEtdYD0dqU';

// Get references to the HTML elements
const videoPlayer = document.getElementById('video-player');
const randomVideoButton = document.getElementById('random-video-button');

//////////////////////////////////////////////////////////////////////////////////

function RangeArray(start, stop, step){
    return Array.from(
    		  { length: (stop - start) / step + 1 },
    		  (value, index) => start + index * step);
}
function RemoveAt(arr, index){
 		 if (index < 0 || index >= arr.length) return arr;
		  return arr.slice(0, index).concat(arr.slice(index+1));
}
function DotProd(a, b){
		  return a[0] * b[0] + a[1] + b[1];
}
function RandomWithSeed(seed){
    return Math.abs((Math.sin(DotProd([seed, seed/2], [12.9898, 4.1414])) * 43758.5453) % 1);
}
function ScrambleWithSeed(ordered, seed)
{
	console.log(ordered);
var scrambled = [];
while (ordered.length > 0){
	seed += 1;
	var index = Math.floor(RandomWithSeed(seed) * ordered.length - 1);
        scrambled = scrambled.concat(ordered[index]);
        ordered = RemoveAt(ordered, index);
    }
	console.log(scrambled);
    return scrambled;
}
//////////////////////////////////////////////////////////////////////////////////

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
    const items = data.items;
    const item = items[videoIndexInPage];
    const snippet = item['snippet'];
    const resourceId = snippet['resourceId'];
    const videoId = resourceId['videoId'];
    return videoId;
    //return data.items[index % maxResults]['snippet']['resourceId']['videoId'];
}

// Function to play a random video
async function playRandomVideo() {
    var now = new Date();
    const totalVideos = await fetchPlaylistLength();
    if (totalVideos === 0) return;

    var scrambled = ScrambleWithSeed(RangeArray(0, totalVideos-1), 1, 627151);
    var daysSinceEpoch = Math.floor((new Date() - new Date('2024-08-24T00:00:00')) / 8.64e7);
	console.log(scrambled);
    const videoId = await fetchVideoByIndex(scrambled[daysSinceEpoch]);
    
    if (videoId) {
        videoPlayer.src = `https://www.youtube.com/embed/${videoId}`;
    }
}
// Event listener for the button
//randomVideoButton.addEventListener('click', playRandomVideo);
