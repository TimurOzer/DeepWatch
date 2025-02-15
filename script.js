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

    let currentPart = 0;           // Şu anda oynayan part numarası
    const maxParts = 3;            // Örneğin toplamda 4 part (0'dan 3'e)
    let nextVideoURL = null;       // Sonraki part için önceden yüklenmiş video URL'si

    videoPlayer.style.display = 'none';
    loading.style.display = 'block';

    videoPlayer.addEventListener('loadeddata', () => {
        videoPlayer.style.display = 'block';
        loading.style.display = 'none';
        // Parça yüklendiğinde, sonraki partı preload etmeye başlıyoruz
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

    // Video bittiğinde otomatik olarak sonraki partı oynatmaya çalış
    videoPlayer.addEventListener('ended', () => {
        // Eğer önceden yüklenmiş sonraki parça varsa otomatik oynat
        if (nextVideoURL && currentPart < maxParts) {
            currentPart++; // Sonraki part'a geç
            console.log("✅ Otomatik geçiş. Yeni part numarası:", currentPart);
            videoPlayer.src = nextVideoURL;
            videoPlayer.load();
            videoPlayer.play().catch(() => {
                console.log("🔴 Otomatik oynatma engellendi, lütfen 'Next Part'a tıklayın.");
            });
            nextVideoURL = null; // Kullanıldıktan sonra sıfırla
            checkNextPart();     // Sonraki partı preload etmeye başla
        }
    });

    // "Next Part" butonuna tıklanınca oynat
    nextPartBtn.onclick = () => {
        if (nextVideoURL && currentPart < maxParts) {
            currentPart++;
            console.log("✅ Manuel geçiş. Yeni part numarası:", currentPart);
            videoPlayer.src = nextVideoURL;
            videoPlayer.load();
            videoPlayer.play().catch(() => {
                console.log("🔴 Tarayıcı otomatik oynatmayı engelledi, kullanıcı etkileşimi bekleniyor.");
            });
            nextVideoURL = null;
            nextPartBtn.style.display = "none"; // Geçiş yapıldıktan sonra butonu gizle
            checkNextPart();
        } else {
            console.log("❌ HATA: Next part butonuna basıldı ama preloaded video yok!");
            nextPartBtn.style.display = "none";
        }
    };

    // Belirtilen URL için videoyu fetch edip, Blob oluşturup video URL'si elde ediyoruz
    function loadNextPart(url, playImmediately = false) {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('Part yok');
                return response.blob();
            })
            .then(blob => {
                const videoURL = URL.createObjectURL(blob);
                if (playImmediately) {
                    // Eğer hemen oynatılacaksa, videoPlayer'ın src'sini ayarla
                    videoPlayer.src = videoURL;
                    videoPlayer.load();
                    videoPlayer.play().catch(() => {
                        console.log("🔴 Otomatik oynatma engellendi.");
                    });
                } else {
                    // Aksi halde, sonraki part için nextVideoURL'yi güncelle
                    nextVideoURL = videoURL;
                }
                console.log("✅ Next part yüklendi:", url);
                // Her iki durumda da, sonraki partın preload edilip edilmediğini kontrol et
                checkNextPart();
            })
            .catch(() => {
                console.log("⚠️ Bölüm sona erdi, sonraki part yok:", url);
                nextPartBtn.style.display = "none";
            });
    }

    // Sonraki partın var olup olmadığını HEAD isteği ile kontrol edip preload başlatıyoruz
    function checkNextPart() {
        let nextPartPath = `series/${series}/${episode}/part${currentPart + 1}.webm`;
        fetch(nextPartPath, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    // Önce butonu gizleyip, preload işlemini başlatıyoruz
                    nextPartBtn.style.display = 'none';
                    preloadNextPart(nextPartPath);
                } else {
                    nextPartBtn.style.display = 'none';
                }
            })
            .catch(() => {
                nextPartBtn.style.display = 'none';
            });
    }

    // Belirtilen URL'deki veriyi tamamen okuyarak, sonraki part için video URL'sini oluşturuyoruz
    function preloadNextPart(url) {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('Sonraki part yüklenemedi');
                const totalLength = response.headers.get('Content-Length');
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
                        const percent = Math.round((receivedLength / totalLength) * 100);
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
                // Sonraki part %100 yüklendiğinde buton görünür olsun
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