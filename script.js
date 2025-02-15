// Uygulamanın ana kapsayıcısı
const app = document.getElementById('app');

// Videoların sıralı oynatımı için global değişkenler
let currentVideoIndex = 0;
let videoParts = [];

/* Menü Aşamaları */
// Ana seçim: Film mi, Dizi mi?
function showMainMenu() {
  app.innerHTML = `
    <h2>Lütfen seçim yapınız:</h2>
    <button class="button" id="seriesBtn">Dizi</button>
    <button class="button" id="filmsBtn">Film</button>
  `;
  
  document.getElementById('seriesBtn').addEventListener('click', showSeriesMenu);
  document.getElementById('filmsBtn').addEventListener('click', () => {
    // Film sayfası henüz yapılandırılmadı, uyarı verelim.
    alert("Film bölümü henüz aktif değil!");
  });
}

// Dizi menüsü: Sadece HOTD serisi var
function showSeriesMenu() {
  app.innerHTML = `
    <h2>Seriler</h2>
    <button class="button" id="hotdBtn">HOTD</button>
    <br>
    <button class="button" id="backMain">← Ana Menü</button>
  `;
  
  document.getElementById('hotdBtn').addEventListener('click', showHOTDMenu);
  document.getElementById('backMain').addEventListener('click', showMainMenu);
}

// HOTD menüsü: eps1 ve eps2 seçenekleri
function showHOTDMenu() {
  app.innerHTML = `
    <h2>HOTD</h2>
    <button class="button" id="eps1Btn">Eps1</button>
    <button class="button" id="eps2Btn">Eps2</button>
    <br>
    <button class="button" id="backSeries">← Geri</button>
  `;
  
  document.getElementById('eps1Btn').addEventListener('click', () => {
    playEpisode('eps1');
  });
  document.getElementById('eps2Btn').addEventListener('click', () => {
    playEpisode('eps2');
  });
  document.getElementById('backSeries').addEventListener('click', showSeriesMenu);
}

// Belirtilen eps (eps1 veya eps2) için video oynatımı
function playEpisode(eps) {
  // Varsayılan olarak 4 parça video olduğunu varsayıyoruz: part0.mp4, part1.mp4, part2.mp4, part3.mp4
  videoParts = [0, 1, 2, 3];
  currentVideoIndex = 0;
  
  app.innerHTML = `
    <h2>HOTD - ${eps.toUpperCase()}</h2>
    <div class="video-container">
      <video id="videoPlayer" controls></video>
    </div>
    <button class="button" id="backHOTD">← Geri</button>
  `;
  
  // Video elementini yakala ve ilk videoyu yükle
  const videoPlayer = document.getElementById('videoPlayer');
  loadVideoPart(videoPlayer, eps);
  
  // Her video bittiğinde sıradakini yükle
  videoPlayer.addEventListener('ended', () => {
    currentVideoIndex++;
    if(currentVideoIndex < videoParts.length){
      loadVideoPart(videoPlayer, eps);
    } else {
      // Tüm bölümler tamamlandıysa kullanıcıya bilgi ver
      alert("Tüm partlar tamamlandı!");
    }
  });
  
  document.getElementById('backHOTD').addEventListener('click', showHOTDMenu);
}

// Video dosyasını yükleyen fonksiyon
function loadVideoPart(videoPlayer, eps) {
  const part = videoParts[currentVideoIndex];
  // Dosya yolu: /Series/HOTD/eps1/part0.mp4 gibi
  const videoPath = `Series/HOTD/${eps}/part${part}.mp4`;
  videoPlayer.src = videoPath;
  videoPlayer.load();
  videoPlayer.play().catch((error) => {
    console.error("Video oynatım hatası:", error);
  });
}

// Sayfa yüklendiğinde ana menüyü göster
document.addEventListener('DOMContentLoaded', showMainMenu);
