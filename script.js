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

    let currentPart = 0;      // Şu anda oynatılan part numarası
    let nextVideoURL = null;  // Önceden preload edilmiş sonraki part URL'si

    videoPlayer.style.display = 'none';
    loading.style.display = 'block';

    videoPlayer.addEventListener('loadeddata', () => {
        videoPlayer.style.display = 'block';
        loading.style.display = 'none';
        // Parça yüklendiğinde, sıradaki partı kontrol edip preload etmeye başlıyoruz
        checkNextPart();
    });

    // Video oynatılırken yüklenme ilerlemesini güncelle
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

    // Video bittiğinde otomatik geçiş yapmaya çalış
    videoPlayer.addEventListener('ended', () => {
        if (nextVideoURL) {
            currentPart++;
            console.log("✅ Otomatik geçiş. Yeni part numarası:", currentPart);
            videoPlayer.src = nextVideoURL;
            videoPlayer.load();
            videoPlayer.play().catch(() => {
                console.log("🔴 Otomatik oynatma engellendi, lütfen 'Next Part'a tıklayın.");
            });
            nextVideoURL = null;
            checkNextPart(); // Yeni part preload edilsin
        }
    });

    // "Next Part" butonuna tıklanınca oynat
    nextPartBtn.onclick = () => {
        if (nextVideoURL) {
            currentPart++;
            console.log("✅ Manuel geçiş. Yeni part numarası:", currentPart);
            videoPlayer.src = nextVideoURL;
            videoPlayer.load();
            videoPlayer.play().catch(() => {
                console.log("🔴 Tarayıcı otomatik oynatmayı engelledi, kullanıcı etkileşimi bekleniyor.");
            });
            nextVideoURL = null;
            nextPartBtn.style.display = "none";
            checkNextPart();
        } else {
            console.log("❌ HATA: Next part butonuna basıldı ama preloaded video yok!");
            nextPartBtn.style.display = "none";
        }
    };

    // Sıradaki partın varlığını HEAD isteğiyle kontrol ediyoruz
    function checkNextPart() {
        let nextPartPath = `series/${series}/${episode}/part${currentPart + 1}.webm`;
        fetch(nextPartPath, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    nextPartBtn.style.display = 'none'; // Şimdilik gizle, preload bittikten sonra gösterilecek
                    preloadNextPart(nextPartPath);
                } else {
                    nextPartBtn.style.display = 'none';
                }
            })
            .catch(() => {
                nextPartBtn.style.display = 'none';
            });
    }

    // Belirtilen URL'deki veriyi tamamen okuyarak Blob oluşturup video URL'sine çeviriyoruz
    function preloadNextPart(url) {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('Sonraki part yüklenemedi');
                const totalLengthStr = response.headers.get('Content-Length');
                const totalLength = totalLengthStr ? parseInt(totalLengthStr, 10) : 0;
                const reader = response.body.getReader();
                let receivedLength = 0;
                const chunks = [];

                function pump() {
                    return reader.read().then(({ done, value }) => {
                        if (done) {
                            return;
                        }
                        chunks.push(value);
                        receivedLength += value.length;
                        let percent = 100;
                        if (totalLength > 0) {
                            percent = Math.round((receivedLength / totalLength) * 100);
                        }
                        nextPartProgress.value = percent;
                        nextPartLoadText.textContent = percent + "%";
                        return pump();
                    });
                }
                return pump().then(() => new Blob(chunks));
            })
            .then(blob => {
                nextVideoURL = URL.createObjectURL(blob);
                console.log("Sonraki part tamamen yüklendi:", url);
                // Sadece %100 yüklendiyse buton görünür olsun
                nextPartBtn.style.display = "inline-block";
            })
            .catch(() => {
                nextPartProgress.value = 0;
                nextPartLoadText.textContent = "Yüklenemedi";
                nextPartBtn.style.display = "none";
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