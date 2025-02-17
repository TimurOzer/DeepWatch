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
            id: "WITCHER",
            title: "WITCHER",
            image: "assets/movies/witcher.jpg"
        }
,
        {
            id: "ANORA",
            title: "ANORA",
            image: "assets/movies/anora.jpg"
        }
,
        {
            id: "VENOM",
            title: "VENOM",
            image: "assets/movies/venom.jpg"
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
    <!-- Popup: Varsayılan olarak "hidden" sınıfı ile gizli (CSS'de .hidden { display: none; } tanımlı olmalı) -->
    <div id="nextEpisodePopup" class="popup hidden">
      <p>Sıradaki bölüme geçilsin mi?</p>
      <button id="nextEpisodeYes">Evet</button>
      <button id="nextEpisodeNo">Hayır</button>
    </div>
  `;

  // Elemanları seçelim:
  const videoPlayer = document.getElementById('videoPlayer');
  const nextPartBtn = document.getElementById('nextPartBtn');
  const loading = document.getElementById('loading');
  const videoProgress = document.getElementById('videoProgress');
  const videoLoadText = document.getElementById('videoLoadText');
  const nextPartProgress = document.getElementById('nextPartProgress');
  const nextPartLoadText = document.getElementById('nextPartLoadText');
  const nextEpisodePopup = document.getElementById('nextEpisodePopup');
  const nextEpisodeYes = document.getElementById('nextEpisodeYes');
  const nextEpisodeNo = document.getElementById('nextEpisodeNo');

  let currentPart = 0;              // Şu anda oynatılan part numarası
  let nextVideoURL = null;          // Preload edilmiş sonraki partın URL'si (tamamlandıysa)
  let isPreloading = false;         // Preload işlemi devam ediyorsa true
  let preloadController = null;     // Preload işlemini iptal etmek için
  let preloadedPartNumber = null;   // Hangi part'ın preload edildiğini takip eder

  // Geçiş olduğunda tüm preload işlemlerini sıfırlamak:
  function resetPreloadState() {
    if (preloadController) {
      preloadController.abort();
      preloadController = null;
    }
    nextVideoURL = null;
    isPreloading = false;
    preloadedPartNumber = null;
  }

  // Mevcut bölümde bir sonraki partı preload etmeye çalışır.
  // Eğer HEAD isteği başarısız olursa, bu bölümün part'ları bittiyse popup gösterilir.
  function startPreloadForNextPart() {
    resetPreloadState();
    const nextPartNumber = currentPart + 1;
    const nextPartPath = `series/${series}/${episode}/part${nextPartNumber}.webm`;

    fetch(nextPartPath, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          // Bir sonraki part mevcut, preload başlat:
          preloadNextPart(nextPartPath, nextPartNumber);
        } else {
          // Mevcut bölümün part'ı kalmamış demektir → Sıradaki bölümü kontrol et:
          nextPartBtn.style.display = 'none';
          checkNextEpisode();
        }
      })
      .catch(() => {
        nextPartBtn.style.display = 'none';
        checkNextEpisode();
      });
  }

  // Belirtilen URL'den videoyu tamamen indirip Blob oluşturur,
  // ardından video URL'sini nextVideoURL olarak atar.
  function preloadNextPart(url, partNumber) {
    if (isPreloading) {
      console.log("⚠️ Preload zaten devam ediyor, tekrar başlatılmıyor.");
      return;
    }
    isPreloading = true;
    nextPartBtn.disabled = true;
    nextPartProgress.value = 0;
    nextPartLoadText.textContent = "0%";
    preloadController = new AbortController();

    fetch(url, { signal: preloadController.signal })
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
        if (currentPart + 1 !== partNumber) {
          console.log(`❌ Preloaded part numarası uyuşmuyor, atama yapılmadı: ${partNumber}`);
          return;
        }
        nextVideoURL = URL.createObjectURL(blob);
        preloadedPartNumber = partNumber;
        console.log(`✅ Sonraki part tamamen yüklendi: ${url}`);
        nextPartBtn.style.display = "inline-block";
        nextPartBtn.disabled = false;
        isPreloading = false;
      })
      .catch(error => {
        if (error.name === "AbortError") {
          console.log("🔴 Preload iptal edildi.");
        } else {
          nextPartProgress.value = 0;
          nextPartLoadText.textContent = "Yüklenemedi";
          nextPartBtn.style.display = "none";
        }
        isPreloading = false;
        preloadController = null;
      });
  }

  // Video yüklendiğinde:
  videoPlayer.addEventListener('loadeddata', () => {
    videoPlayer.style.display = 'block';
    loading.style.display = 'none';
    startPreloadForNextPart();
  });

  // Video oynatılırken yüklenme ilerlemesini güncelle:
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

  // Video sona erdiğinde:
  videoPlayer.addEventListener('ended', () => {
    if (isPreloading) {
      // Eğer preload hâlâ devam ediyorsa, 1 saniye bekleyip kontrol edelim.
      setTimeout(() => {
        if (!nextVideoURL) {
          checkNextEpisode();
        }
      }, 1000);
    } else if (nextVideoURL && preloadedPartNumber === currentPart + 1) {
      // Eğer bir sonraki part preload edilmişse, otomatik geçiş yap:
      currentPart++;
      console.log("✅ Otomatik geçiş. Yeni part numarası:", currentPart);
      videoPlayer.src = nextVideoURL;
      videoPlayer.load();
      videoPlayer.play().catch(() => {
        console.log("🔴 Otomatik oynatma engellendi, lütfen 'Next Part'a tıklayın.");
      });
      resetPreloadState();
      startPreloadForNextPart();
    } else {
      // Eğer preload yoksa, yani mevcut bölümün tüm part'ları bitmiş demektir:
      checkNextEpisode();
    }
  });

  // Manuel geçiş butonuna tıklandığında:
  nextPartBtn.onclick = () => {
    if (isPreloading) {
      console.log("⚠️ Preload devam ediyor, lütfen bekleyin.");
      return;
    }
    if (!nextVideoURL || preloadedPartNumber !== currentPart + 1) {
      console.log("❌ HATA: Preloaded video yok veya yanlış preload!");
      nextPartBtn.style.display = "none";
      return;
    }
    currentPart++;
    console.log("✅ Manuel geçiş. Yeni part numarası:", currentPart);
    videoPlayer.src = nextVideoURL;
    videoPlayer.load();
    videoPlayer.play().catch(() => {
      console.log("🔴 Tarayıcı otomatik oynatmayı engelledi, lütfen tekrar tıklayın.");
    });
    resetPreloadState();
    nextPartBtn.style.display = "none";
    startPreloadForNextPart();
  };

  // Eğer mevcut bölümün part'ı kalmadıysa, sıradaki bölümün part0'ını kontrol edip popup gösterelim.
  function checkNextEpisode() {
    // Eğer popup zaten görünüyorsa tekrar göstermeyelim.
    if (!nextEpisodePopup.classList.contains("hidden")) return;
    const match = episode.match(/\d+/);
    if (!match) return;
    const nextEpisodeNumber = parseInt(match[0], 10) + 1;
    const nextEpisode = "eps" + nextEpisodeNumber;
    const nextEpisodePath = `series/${series}/${nextEpisode}/part0.webm`;

    fetch(nextEpisodePath, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          showNextEpisodePopup(series, nextEpisode);
        }
      })
      .catch(() => {});
  }

  // Popup gösterimi: "Evet" → yeni bölüme geç; "Hayır" → popup kapatılır.
  function showNextEpisodePopup(series, nextEpisode) {
    nextEpisodePopup.classList.remove("hidden");
    nextEpisodeYes.onclick = () => {
      nextEpisodePopup.classList.add("hidden");
      playEpisode(series, nextEpisode);
    };
    nextEpisodeNo.onclick = () => {
      nextEpisodePopup.classList.add("hidden");
    };
  }
}

function playMedia(movie) {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="video-player">
      <h2>${movie.title}</h2>
      <div id="loading" class="loading"></div>
      <video id="videoPlayer" controls>
        <source src="movies/${movie.id}/eps1/part0.webm" type="video/webm">
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
  let nextVideoURL = null;
  let isPreloading = false;
  let preloadController = null;
  let preloadedPartNumber = null;

  function resetPreloadState() {
    if (preloadController) {
      preloadController.abort();
      preloadController = null;
    }
    nextVideoURL = null;
    isPreloading = false;
    preloadedPartNumber = null;
  }

  function startPreloadForNextPart() {
    resetPreloadState();
    const nextPartNumber = currentPart + 1;
    const nextPartPath = `movies/${movie.id}/eps1/part${nextPartNumber}.webm`;

    fetch(nextPartPath, { method: 'HEAD' })
      .then(response => {
        if (response.ok) preloadNextPart(nextPartPath, nextPartNumber);
        else nextPartBtn.style.display = 'none';
      })
      .catch(() => nextPartBtn.style.display = 'none');
  }

  function preloadNextPart(url, partNumber) {
    if (isPreloading) return;
    isPreloading = true;
    nextPartBtn.disabled = true;
    nextPartProgress.value = 0;
    nextPartLoadText.textContent = "0%";
    preloadController = new AbortController();

    fetch(url, { signal: preloadController.signal })
      .then(response => {
        if (!response.ok) throw new Error('Yüklenemedi');
        const totalLength = +response.headers.get('Content-Length') || 0;
        const reader = response.body.getReader();
        let receivedLength = 0;
        const chunks = [];
        
        const pump = () => reader.read().then(({ done, value }) => {
          if (done) return;
          chunks.push(value);
          receivedLength += value.length;
          const percent = totalLength ? Math.round((receivedLength / totalLength) * 100) : 100;
          nextPartProgress.value = percent;
          nextPartLoadText.textContent = percent + "%";
          return pump();
        });
        
        return pump().then(() => new Blob(chunks));
      })
      .then(blob => {
        if (currentPart + 1 !== partNumber) return;
        nextVideoURL = URL.createObjectURL(blob);
        preloadedPartNumber = partNumber;
        nextPartBtn.style.display = "inline-block";
        nextPartBtn.disabled = false;
        isPreloading = false;
      })
      .catch(error => {
        if (error.name !== "AbortError") {
          nextPartProgress.value = 0;
          nextPartLoadText.textContent = "Yüklenemedi";
          nextPartBtn.style.display = "none";
        }
        isPreloading = false;
        preloadController = null;
      });
  }

  videoPlayer.addEventListener('loadeddata', () => {
    videoPlayer.style.display = 'block';
    loading.style.display = 'none';
    startPreloadForNextPart();
  });

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

  videoPlayer.addEventListener('ended', () => {
    if (isPreloading) {
      setTimeout(() => !nextVideoURL && videoPlayer.pause(), 1000);
    } else if (nextVideoURL && preloadedPartNumber === currentPart + 1) {
      currentPart++;
      videoPlayer.src = nextVideoURL;
      videoPlayer.load();
      videoPlayer.play().catch(console.error);
      resetPreloadState();
      startPreloadForNextPart();
    }
  });

  nextPartBtn.onclick = () => {
    if (!nextVideoURL || preloadedPartNumber !== currentPart + 1) return;
    currentPart++;
    videoPlayer.src = nextVideoURL;
    videoPlayer.load();
    videoPlayer.play().catch(console.error);
    resetPreloadState();
    nextPartBtn.style.display = "none";
    startPreloadForNextPart();
  };
}