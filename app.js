// app.js (Güncellenmiş Versiyon)
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

    const initVideoPlayer = () => {
        videoPlayer = videojs('videoPlayer', {
            controls: true,
            autoplay: false,
            preload: 'auto',
            responsive: true,
            playbackRates: [0.5, 1, 1.5, 2]
        });
    };

// Path düzenleme fonksiyonunu güncelleyelim
const getCorrectPath = (path) => {
    const isGitHub = window.location.host.includes('github.io');
    const repoName = window.location.pathname.split('/')[1] || '';
    return isGitHub 
        ? `${window.location.origin}/${repoName}/${path}` 
        : `${window.location.origin}/${path}`;
};

    document.getElementById('series').addEventListener('click', showSeriesList);

    function showSeriesList() {
        document.querySelector('.main-menu').style.display = 'none';
        document.getElementById('series-list').innerHTML = '';
        document.getElementById('series-list').style.display = 'block';

        Object.keys(seriesData).forEach(seriesName => {
            const seriesCard = createSeriesCard(seriesName);
            document.getElementById('series-list').appendChild(seriesCard);
        });
    }

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

    function playEpisode(basePath, totalParts) {
        currentVideoParts = Array.from({length: totalParts}, (_, i) => 
            getCorrectPath(`${basePath}${i}.mp4`)
        );
        
        currentPartIndex = 0;
        document.querySelector('.video-container').style.display = 'block';
        playNextPart();
    }

    function playNextPart() {
        if(currentPartIndex >= currentVideoParts.length) {
            videoPlayer.dispose();
            return;
        }

        videoPlayer.src({
            src: currentVideoParts[currentPartIndex],
            type: 'video/mp4'
        });

        videoPlayer.ready(() => {
            videoPlayer.play().catch(error => {
                videoPlayer.bigPlayButton.show();
                console.log('Oynatma başlatılamadı:', error);
            });
        });

        videoPlayer.on('ended', () => {
            currentPartIndex++;
            playNextPart();
        });

// Hata durumunda bildirim ekleyelim
videoPlayer.on('error', (e) => {
    console.error('Video Player Error:', videoPlayer.error());
    alert(`Video yüklenemedi: ${videoPlayer.error().message}`);
});

    }
});