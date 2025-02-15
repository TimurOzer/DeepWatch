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
        if (btn.getAttribute('data-type') === type) btn.classList.add('active');
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
            <div id="loading" class="loading"></div>
            <video id="videoPlayer" controls>
                <source src="series/${series}/${episode}/part0.webm" type="video/webm">
            </video>
            <button id="nextPartBtn">Next Part ➡️</button>
        </div>
    `;
    
    const videoPlayer = document.getElementById('videoPlayer');
    const nextPartBtn = document.getElementById('nextPartBtn');
    const loading = document.getElementById('loading');
    let currentPart = 0;
    const maxParts = 3; // Örnek: 4 part (0-3)
    let preloadedPart = null;

    videoPlayer.style.display = 'none';
    loading.style.display = 'block';
    nextPartBtn.disabled = true; // Başlangıçta buton pasif

    videoPlayer.addEventListener('loadeddata', () => {
        videoPlayer.style.display = 'block';
        loading.style.display = 'none';
    });

    // Video bittiğinde bir sonraki partı yükle
    videoPlayer.addEventListener('ended', () => {
        if (currentPart < maxParts) {
            currentPart++;
            loadNextPart(`series/${series}/${episode}/part${currentPart}.webm`);
        }
    });

    // "Next Part" butonuna tıklanırsa bir sonraki partı yükle
    nextPartBtn.onclick = () => {
        if (currentPart < maxParts) {
            currentPart++;
            loadNextPart(`series/${series}/${episode}/part${currentPart}.webm`);
        }
    };

    const loadNextPart = (nextPart) => {
        fetch(nextPart)
            .then(response => {
                if (!response.ok) throw new Error('Part yok');
                return response.blob();
            })
            .then(blob => {
                if (preloadedPart) URL.revokeObjectURL(preloadedPart);
                const videoURL = URL.createObjectURL(blob);
                preloadedPart = videoURL;
                videoPlayer.src = videoURL;
                videoPlayer.play();
                nextPartBtn.disabled = false; // Butonu aktif yap
            })
            .catch(() => {
                console.log('Bölüm sona erdi.');
                nextPartBtn.disabled = true; // Eğer part yoksa butonu pasif yap
            });
    };
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