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
            <div class="progress-container">
                <p>Video Yükleme: <span id="videoLoadText">0%</span></p>
                <progress id="videoProgress" value="0" max="100"></progress>
            </div>
            <div class="progress-container">
                <p>Sonraki Part Yükleme: <span id="nextPartLoadText">0%</span></p>
                <progress id="nextPartProgress" value="0" max="100"></progress>
            </div>
            <button id="nextPartBtn" style="display: none;">Next Part ➡️</button>
        </div>
    `;

    const videoPlayer = document.getElementById('videoPlayer');
    const nextPartBtn = document.getElementById('nextPartBtn');
    const loading = document.getElementById('loading');
    const videoProgress = document.getElementById('videoProgress');
    const videoLoadText = document.getElementById('videoLoadText');
    const nextPartProgress = document.getElementById('nextPartProgress');
    const nextPartLoadText = document.getElementById('nextPartLoadText');

    let currentPart = 0;
    const maxParts = 3;
    let preloadedPart = null;

    videoPlayer.style.display = 'none';
    loading.style.display = 'block';

    videoPlayer.addEventListener('loadeddata', () => {
        videoPlayer.style.display = 'block';
        loading.style.display = 'none';
        checkNextPart();
    });

    // Video yüklenme ilerlemesi
    videoPlayer.addEventListener('progress', () => {
        if (videoPlayer.buffered.length > 0) {
            const loaded = videoPlayer.buffered.end(0);
            const total = videoPlayer.duration;
            if (total > 0) {
                const percent = Math.round((loaded / total) * 100);
                videoProgress.value = percent;
                videoLoadText.textContent = percent + "%";
            }
        }
    });

    // Video bittiğinde otomatik olarak sonraki partı yüklemeye çalış
    videoPlayer.addEventListener('ended', () => {
        if (currentPart < maxParts) {
            currentPart++;
            loadNextPart(`series/${series}/${episode}/part${currentPart}.webm`, true);
        }
    });

    // Tek bir nextPartBtn onclick tanımlaması:
    nextPartBtn.onclick = () => {
        if (preloadedPart) {
            console.log("✅ Yeni part oynatılıyor:", preloadedPart);
            videoPlayer.src = preloadedPart;
            videoPlayer.load();
            videoPlayer.play().catch(() => {
                console.log("🔴 Tarayıcı otomatik oynatmayı engelledi, kullanıcı etkileşimi bekleniyor.");
            });
        } else {
            console.log("❌ HATA: Next part butonuna basıldı ama preloadedPart yok!");
            nextPartBtn.style.display = "none";
        }
    };

    function loadNextPart(nextPart, playImmediately = false) {
        fetch(nextPart)
            .then(response => {
                if (!response.ok) throw new Error('Part yok');
                return response.blob();
            })
            .then(blob => {
                if (preloadedPart) URL.revokeObjectURL(preloadedPart);
                const videoURL = URL.createObjectURL(blob);
                preloadedPart = videoURL;

                console.log("✅ Next part başarıyla yüklendi:", nextPart);
                console.log("🎬 Yeni Video URL:", preloadedPart);

                nextPartBtn.style.display = "inline-block";
                nextPartBtn.disabled = false;

                if (playImmediately) {
                    videoPlayer.src = preloadedPart;
                    videoPlayer.load();
                    videoPlayer.play().catch(() => {
                        console.log("🔴 Tarayıcı otomatik oynatmayı engelledi.");
                    });
                }
            })
            .catch(() => {
                console.log("⚠️ Bölüm sona erdi, yeni part yok.");
                nextPartBtn.style.display = "none";
            });
    }

    function checkNextPart() {
        let nextPartPath = `series/${series}/${episode}/part${currentPart + 1}.webm`;
        fetch(nextPartPath, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    nextPartBtn.style.display = 'inline-block';
                    preloadNextPart(nextPartPath);
                } else {
                    nextPartBtn.style.display = 'none';
                }
            })
            .catch(() => {
                nextPartBtn.style.display = 'none';
            });
    }

    function preloadNextPart(nextPartPath) {
        fetch(nextPartPath)
            .then(response => {
                if (!response.ok) throw new Error('Sonraki part yüklenemedi');
                const reader = response.body.getReader();
                let receivedLength = 0;
                let totalLength = response.headers.get('Content-Length');

                return new ReadableStream({
                    start(controller) {
                        function push() {
                            reader.read().then(({ done, value }) => {
                                if (done) {
                                    controller.close();
                                    console.log("Sonraki part tamamen yüklendi:", nextPartPath);
                                    return;
                                }
                                receivedLength += value.length;
                                const percent = Math.round((receivedLength / totalLength) * 100);
                                nextPartProgress.value = percent;
                                nextPartLoadText.textContent = percent + "%";
                                controller.enqueue(value);
                                push();
                            });
                        }
                        push();
                    }
                });
            })
            .catch(() => {
                nextPartProgress.value = 0;
                nextPartLoadText.textContent = "Yüklenemedi";
            });
    }
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