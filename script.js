function showSeries() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="episode-list">
            <h2>Diziler</h2>
            <button onclick="showEpisodes('HOTD')">House of the Dragon (HOTD)</button>
        </div>
    `;
}

function showMovies() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="episode-list">
            <h2>Filmler</h2>
            <p>Filmler yakında eklenecek...</p>
        </div>
    `;
}

function showEpisodes(series) {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="episode-list">
            <h2>${series}</h2>
            <button onclick="playEpisode('HOTD', 'eps1')">Bölüm 1</button>
            <button onclick="playEpisode('HOTD', 'eps2')">Bölüm 2</button>
        </div>
    `;
}

function playEpisode(series, episode) {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="video-player">
            <h2>${series} - ${episode}</h2>
            <video id="videoPlayer" controls>
                <source src="series/${series}/${episode}/part0.mp4" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        </div>
    `;

    const videoPlayer = document.getElementById('videoPlayer');
    let currentPart = 0;

    videoPlayer.addEventListener('ended', () => {
        currentPart++;
        const nextPart = `series/${series}/${episode}/part${currentPart}.mp4`;
        fetch(nextPart)
            .then(response => {
                if (response.ok) {
                    videoPlayer.src = nextPart;
                    videoPlayer.play();
                } else {
                    console.log('Bölüm sona erdi.');
                }
            })
            .catch(error => console.log('Bölüm sona erdi.'));
    });
}