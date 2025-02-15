document.addEventListener('DOMContentLoaded', () => {
    const seriesData = {
        "Dark Series": {
            episodes: {
                "1. Bölüm": { 
                    parts: [
                        "https://drive.google.com/file/d/1ogH9qLTyu-CYMFbfzseLoOMOcxaXEhb_/view", // Part 0
                        "https://drive.google.com/file/d/1zGvUOvChmpqtKDWTCumJ3zktT_y4OFFN/view"  // Part 1
                    ]
                }
            }
        }
    };

    let currentVideoParts = [];
    let currentPartIndex = 0;
    let videoPlayer;

    // Video Player Initialization
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
                playEpisode(data.parts);
            });

            container.appendChild(episodeBtn);
        });
    }

    // Play Episode
    function playEpisode(parts) {
        currentVideoParts = parts;
        currentPartIndex = 0;
        document.querySelector('.video-container').style.display = 'block';
        playNextPart();
    }

    // Play Next Part
    function playNextPart() {
        if(currentPartIndex >= currentVideoParts.length) {
            videoPlayer.dispose();
            return;
        }

        const videoUrl = currentVideoParts[currentPartIndex];
        console.log('Loading:', videoUrl);

        videoPlayer.src({
            src: videoUrl,
            type: 'video/mp4'
        });

        videoPlayer.ready(() => {
            videoPlayer.play().catch(error => {
                console.error('Playback Error:', error);
                videoPlayer.bigPlayButton.show();
            });
        });

        videoPlayer.on('ended', () => {
            currentPartIndex++;
            playNextPart();
        });

        videoPlayer.on('error', () => {
            console.error('Video Error:', videoPlayer.error());
            alert('Video yüklenirken hata oluştu: ' + videoPlayer.error().message);
        });
    }
});