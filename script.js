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

    let currentPart = 0;         // Şu anda oynatılan part numarası
    let nextVideoURL = null;     // Preload edilmiş sonraki part URL'si (tamamlandıysa)
    let isPreloading = false;    // Preload işlemi devam ediyorsa true
    let preloadingPartNumber = null; // Hangi part numarası preload ediliyor (beklenen)
    let hasCheckedNext = false;  // Bu part için checkNextPart() çağrıldı mı?

    videoPlayer.style.display = 'none';
    loading.style.display = 'block';

    videoPlayer.addEventListener('loadeddata', () => {
        videoPlayer.style.display = 'block';
        loading.style.display = 'none';
        // Yalnızca bu part için bir kere next part kontrolü yapalım.
        if (!hasCheckedNext) {
            hasCheckedNext = true;
            checkNextPart();
        }
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

    // Video bittiğinde (otomatik geçiş)
    videoPlayer.addEventListener('ended', () => {
        // Geçiş yapabilmek için preload bitmiş ve beklenen part numarası kontrol ediliyor.
        if (nextVideoURL && preloadingPartNumber === currentPart + 1) {
            currentPart++;
            console.log("✅ Otomatik geçiş. Yeni part numarası:", currentPart);
            videoPlayer.src = nextVideoURL;
            videoPlayer.load();
            videoPlayer.play().catch(() => {
                console.log("🔴 Otomatik oynatma engellendi, lütfen 'Next Part'a tıklayın.");
            });
            nextVideoURL = null;
            preloadingPartNumber = null;
            hasCheckedNext = false; // Yeni part için kontrol sıfırlanıyor
        }
    });

    // Manuel geçiş
    nextPartBtn.onclick = () => {
        if (isPreloading) {
            console.log("⚠️ Preload devam ediyor, lütfen bekleyin.");
            return;
        }
        if (nextVideoURL && preloadingPartNumber === currentPart + 1) {
            currentPart++;
            console.log("✅ Manuel geçiş. Yeni part numarası:", currentPart);
            videoPlayer.src = nextVideoURL;
            videoPlayer.load();
            videoPlayer.play().catch(() => {
                console.log("🔴 Tarayıcı otomatik oynatmayı engelledi, lütfen tekrar tıklayın.");
            });
            nextVideoURL = null;
            preloadingPartNumber = null;
            nextPartBtn.style.display = "none";
            hasCheckedNext = false;
            // Yeni part yüklendiğinde, sonrasını kontrol etmek için çağırıyoruz.
            checkNextPart();
        } else {
            console.log("❌ HATA: Preloaded video yok veya preload yanlış part için!");
            nextPartBtn.style.display = "none";
        }
    };

    // Mevcut part'ın hemen sonraki dosyanın varlığını kontrol edip preload başlatır.
    function checkNextPart() {
        const nextPartNumber = currentPart + 1;
        // Eğer preload devam ediyor veya istenen part zaten preload edilmişse, yeni başlatma.
        if (isPreloading || (nextVideoURL && preloadingPartNumber === nextPartNumber)) {
            return;
        }
        preloadingPartNumber = nextPartNumber;
        const nextPartPath = `series/${series}/${episode}/part${nextPartNumber}.webm`;
        fetch(nextPartPath, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    preloadNextPart(nextPartPath, nextPartNumber);
                } else {
                    nextPartBtn.style.display = 'none';
                    preloadingPartNumber = null;
                }
            })
            .catch(() => {
                nextPartBtn.style.display = 'none';
                preloadingPartNumber = null;
            });
    }

    // Belirtilen URL'yi tamamen indirip Blob oluşturur, ardından video URL'sini atar.
    // Sadece, preload edilen part numarası beklenenle eşleşiyorsa atama yapılır.
    function preloadNextPart(url, partNumber) {
        isPreloading = true;
        nextPartBtn.disabled = true;
        nextPartProgress.value = 0;
        nextPartLoadText.textContent = "0%";
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
                        if (done) return;
                        chunks.push(value);
                        receivedLength += value.length;
                        let percent = totalLength > 0 ? Math.round((receivedLength / totalLength) * 100) : 100;
                        nextPartProgress.value = percent;
                        nextPartLoadText.textContent = percent + "%";
                        return pump();
                    });
                }
                return pump().then(() => new Blob(chunks));
            })
            .then(blob => {
                if (preloadingPartNumber === partNumber) {
                    nextVideoURL = URL.createObjectURL(blob);
                    console.log("Sonraki part tamamen yüklendi:", url);
                    nextPartBtn.style.display = "inline-block";
                    nextPartBtn.disabled = false;
                } else {
                    console.log("Preloaded part numarası uyuşmuyor, atama yapılmadı.");
                }
                isPreloading = false;
            })
            .catch(() => {
                nextPartProgress.value = 0;
                nextPartLoadText.textContent = "Yüklenemedi";
                nextPartBtn.style.display = "none";
                isPreloading = false;
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