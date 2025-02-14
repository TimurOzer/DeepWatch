// app.js (Güncel Versiyon)
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
    const videoPlayer = document.getElementById('videoPlayer');
    const seriesList = document.getElementById('series-list');

    // GitHub Pages için Path Ayarları
    const isGitHubPages = window.location.host.includes('github.io');
    
    document.getElementById('series').addEventListener('click', () => {
        showSeriesList();
    });

    function showSeriesList() {
        document.querySelector('.main-menu').style.display = 'none';
        seriesList.innerHTML = '';
        seriesList.style.display = 'block';

        for(const seriesName in seriesData) {
            const seriesCard = createSeriesCard(seriesName);
            seriesList.appendChild(seriesCard);
        }
    }

    function createSeriesCard(seriesName) {
        const seriesCard = document.createElement('div');
        seriesCard.className = 'series-card';
        seriesCard.innerHTML = `
            <h2>${seriesName}</h2>
            <div class="episodes-list" style="display: none;"></div>
        `;

        seriesCard.querySelector('h2').addEventListener('click', () => {
            const episodesList = seriesCard.querySelector('.episodes-list');
            episodesList.style.display = episodesList.style.display === 'none' ? 'block' : 'none';
            loadEpisodes(seriesName, episodesList);
        });

        return seriesCard;
    }

    function loadEpisodes(seriesName, container) {
        container.innerHTML = '';
        const episodes = seriesData[seriesName].episodes;

        for(const [episodeName, data] of Object.entries(episodes)) {
            const episodeBtn = document.createElement('div');
            episodeBtn.className = 'menu-item';
            episodeBtn.textContent = episodeName;
            
            episodeBtn.addEventListener('click', () => {
                playEpisode(data.path, data.parts);
            });

            container.appendChild(episodeBtn);
        }
    }

    function playEpisode(basePath, totalParts) {
        currentVideoParts = Array.from({length: totalParts}, (_, i) => {
            let path = `${basePath}${i}.mp4`;
            // GitHub Pages için özel path düzenlemesi
            if(isGitHubPages) path = `/${path}`;
            return path;
        });
        
        currentPartIndex = 0;
        document.querySelector('.video-container').style.display = 'block';
        videoPlayer.controls = true;
        playNextPart();
    }

    function playNextPart() {
        if(currentPartIndex >= currentVideoParts.length) {
            videoPlayer.style.display = 'none';
            return;
        }

        videoPlayer.src = currentVideoParts[currentPartIndex];
        videoPlayer.load();
        
        videoPlayer.addEventListener('canplay', () => {
            videoPlayer.play().catch(error => {
                console.log('Autoplay engellendi, kullanıcı etkileşimi bekleniyor');
                videoPlayer.controls = true;
            });
        }, { once: true });

        videoPlayer.onended = () => {
            currentPartIndex++;
            playNextPart();
        };
    }
});