// app.js
document.addEventListener('DOMContentLoaded', () => {
    const seriesData = {
        "Dark Series": {
            episodes: {
                "1. Bölüm": { 
                    parts: 3, 
                    path: "series/dark-series/eps1/part" 
                }
            }
        }
    };

    let currentVideoParts = [];
    let currentPartIndex = 0;
    let videoPlayer;

// Video player initialization
const initVideoPlayer = () => {
    if(videoPlayer) videoPlayer.dispose();
    videoPlayer = videojs('videoPlayer', {
        controls: true,
        autoplay: false,
        preload: 'auto',
        responsive: true,
        playbackRates: [0.5, 1, 1.5, 2],
        userActions: {
            hotkeys: true
        }
    });
};

    // GitHub Pages Path Correction
    const getCorrectPath = (path) => {
        const isGitHub = window.location.host.includes('github.io');
        return isGitHub ? `/DeepWatch/${path}` : `/${path}`;
    };

    // Event Listeners
    document.getElementById('series').addEventListener('click', showSeriesList);

    // Show Series List
    function showSeriesList() {
        document.querySelector('.main-menu').style.display = 'none';
        document.getElementById('series-list').innerHTML = '';
        document.getElementById('series-list').style.display = 'block';

        Object.keys(seriesData).forEach(seriesName => {
            const seriesCard = createSeriesCard(seriesName);
            document.getElementById('series-list').appendChild(seriesCard);
        });
    }

    // Create Series Card
    function createSeriesCard(seriesName) {
        const seriesCard = document.createElement('div');
        seriesCard.className = 'series-card';
        seriesCard.innerHTML = `
            <h2>${seriesName}</h2>
            <div class="episodes-list" style="display: none;"></div>
        `;

        seriesCard.querySelector('h2').addEventListener('click', function() {
            const episodesList = this.nextElementSibling;
            episodesList.style.display = episodesList.style.display === 'none' ? 'block' : 'none';
            loadEpisodes(seriesName, episodesList);
        });

        return seriesCard;
    }

    // Load Episodes
    function loadEpisodes(seriesName, container) {
        container.innerHTML = '';
        const episodes = seriesData[seriesName].episodes;

        Object.entries(episodes).forEach(([episodeName, data]) => {
            const episodeBtn = document.createElement('div');
            episodeBtn.className = 'menu-item';
            episodeBtn.textContent = episodeName;
            
            episodeBtn.addEventListener('click', () => {
                initVideoPlayer();
                playEpisode(data.path, data.parts);
            });

            container.appendChild(episodeBtn);
        });
    }

    // Play Episode
    function playEpisode(basePath, totalParts) {
        currentVideoParts = Array.from({length: totalParts}, (_, i) => 
            getCorrectPath(`${basePath}${i}.mp4`)
        );
        
        currentPartIndex = 0;
        document.querySelector('.video-container').style.display = 'block';
        playNextPart();
    }

// app.js içinde video yükleme fonksiyonunu güncelleyelim
function playNextPart() {
    if(currentPartIndex >= currentVideoParts.length) return;

    const videoUrl = currentVideoParts[currentPartIndex];
    console.log('Loading:', videoUrl);

    // Fetch API ile video yükleme
    fetch(videoUrl)
        .then(response => {
            if(!response.ok) throw new Error('Network response was not ok');
            return response.blob();
        })
        .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            videoPlayer.src({ 
                src: blobUrl, 
                type: 'video/mp4; codecs="avc1.64001e, mp4a.40.2"' 
            });
            return videoPlayer.play();
        })
        .catch(error => {
            console.error('Video Load Error:', error);
            alert('Video yüklenemedi: ' + error.message);
        });
}

});