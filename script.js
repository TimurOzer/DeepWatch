// Veri Yapısı (Örnek Dizi ve Filmler)
const mediaData = {
    series: [
        {
            id: "HOTD",
            title: "House of the Dragon",
            image: "assets/series/hotd.jpg",
            episodes: ["eps1", "eps2"]
        }
    ],
    movies: [
        {
            id: "inception",
            title: "Inception",
            image: "assets/movies/inception.jpg"
        }
    ]
};

// İlk Açılışta Dizileri Göster
showContent('series');

function showContent(type) {
    const content = document.getElementById('content');
    content.innerHTML = '';
    
    // Tab Butonlarını Güncelle
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === type) btn.classList.add('active');
    });

    // Medya Kartlarını Oluştur
    mediaData[type].forEach(item => {
        const card = document.createElement('div');
        card.className = 'media-card';
        card.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="media-title">${item.title}</div>
        `;
        
        // Tıklama Olayı
        card.onclick = () => {
            if (type === 'series') showEpisodes(item);
            else playMedia(item);
        };
        
        content.appendChild(card);
    });
}

function showEpisodes(series) {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2 style="grid-column: 1 / -1; text-align: center;">${series.title}</h2>
    `;
    
    series.episodes.forEach(episode => {
        const card = document.createElement('div');
        card.className = 'media-card';
        card.innerHTML = `
            <img src="assets/series/${series.id}/${episode}.jpg" alt="${episode}">
            <div class="media-title">${episode.toUpperCase()}</div>
        `;
        
        card.onclick = () => playEpisode(series.id, episode);
        content.appendChild(card);
    });
}

function playEpisode(series, episode) {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="video-player">
            <h2>${series} - ${episode}</h2>
            <video id="videoPlayer" controls>
                <source src="series/${series}/${episode}/part0.webm" type="video/webm">
            </video>
            <button id="nextPartBtn">Next Part ➡️</button>
        </div>
    `;
    
    const videoPlayer = document.getElementById('videoPlayer');
    const nextPartBtn = document.getElementById('nextPartBtn');
    let currentPart = 0;

    // "Next Part" butonuna tıklanırsa
    nextPartBtn.onclick = () => {
        currentPart++;
        const nextPart = `series/${series}/${episode}/part${currentPart}.webm`;
        fetch(nextPart)
            .then(response => response.ok ? (videoPlayer.src = nextPart, videoPlayer.play()) : null)
            .catch(() => console.log('Bölüm sona erdi.'));
    };

    // Video bittiğinde otomatik geçiş için
    videoPlayer.addEventListener('ended', () => {
        currentPart++;
        const nextPart = `series/${series}/${episode}/part${currentPart}.webm`;
        
        // Önceden yükleme (preload) başlat
        fetch(nextPart)
            .then(response => response.ok ? response.blob() : null)
            .then(blob => {
                // Videoyu önceden yükledik, geçişi hızlandırmak için hemen oynat
                if (blob) {
                    const videoURL = URL.createObjectURL(blob);
                    videoPlayer.src = videoURL;
                    videoPlayer.play();
                } else {
                    console.log('Part yüklenemedi.');
                }
            })
            .catch(() => console.log('Bölüm sona erdi.'));
    });
}

function playMedia(movie) {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="video-player">
            <h2>${movie.title}</h2>
            <video controls>
                <source src="movies/${movie.id}/movie.webm" type="video/webm">
            </video>
        </div>
    `;
}
