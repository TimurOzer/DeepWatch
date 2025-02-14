document.addEventListener('DOMContentLoaded', () => {
    const seriesData = {
        "Dark Series": {
            episodes: {
                "1. Bölüm": { parts: 3, path: "series/dark-series/eps1/part" },
                "2. Bölüm": { parts: 3, path: "series/dark-series/eps2/part" }
            }
        }
    };

    let currentVideoParts = [];
    let currentPartIndex = 0;

    const videoPlayer = document.getElementById('videoPlayer');
    const seriesList = document.getElementById('series-list');

    document.getElementById('series').addEventListener('click', () => {
        showSeriesList();
    });

    function showSeriesList() {
        document.querySelector('.main-menu').style.display = 'none';
        seriesList.innerHTML = '';
        seriesList.style.display = 'block';

        for(const seriesName in seriesData) {
            const seriesCard = document.createElement('div');
            seriesCard.className = 'series-card';
            seriesCard.innerHTML = `
                <h2>${seriesName}</h2>
                <div class="episodes-list" style="margin-top: 15px; display: none;"></div>
            `;

            seriesCard.querySelector('h2').addEventListener('click', () => {
                const episodesList = seriesCard.querySelector('.episodes-list');
                episodesList.style.display = episodesList.style.display === 'none' ? 'block' : 'none';
                loadEpisodes(seriesName, episodesList);
            });

            seriesList.appendChild(seriesCard);
        }
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
    currentVideoParts = Array.from({length: totalParts}, (_, i) => `https://github.com/TimurOzer/DeepWatch/raw/main/${basePath}${i}.mp4`);
    currentPartIndex = 0;
    
    document.querySelector('.video-container').style.display = 'block';
    playNextPart();
}


    function playNextPart() {
        if(currentPartIndex >= currentVideoParts.length) return;

        videoPlayer.src = currentVideoParts[currentPartIndex];
        videoPlayer.play();
        
        videoPlayer.onended = () => {
            currentPartIndex++;
            if(currentPartIndex < currentVideoParts.length) {
                playNextPart();
            }
        };
    }
});
