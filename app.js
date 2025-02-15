document.addEventListener('DOMContentLoaded', () => {
  // GitHub'daki raw dosya linklerini kullanarak verileri yapılandırıyoruz
  const seriesData = {
    "Dark Series": {
      episodes: {
        "1. Bölüm": { 
          parts: [
            "https://raw.githubusercontent.com/TimurOzer/DeepWatch/main/series/dark-series/eps1/part0.mp4",
            "https://raw.githubusercontent.com/TimurOzer/DeepWatch/main/series/dark-series/eps1/part1.mp4",
            // Parça sayısına göre ekleyin...
          ]
        }
      }
    }
  };

  let currentVideoParts = [];
  let currentPartIndex = 0;
  let videoPlayer;

  // Video Player'ı başlatma
  const initVideoPlayer = () => {
    if(videoPlayer) {
      videoPlayer.dispose();
    }
    videoPlayer = videojs('videoPlayer', {
      controls: true,
      autoplay: false,
      preload: 'auto',
      responsive: true,
      playbackRates: [0.5, 1, 1.5, 2],
      userActions: {
        hotkeys: true
      }
    });
  };

  // Ana menü elemanlarına tıklama dinleyicileri
  document.getElementById('series').addEventListener('click', showSeriesList);
  // İsterseniz movies için de benzer bir yapı oluşturabilirsiniz
  // document.getElementById('movies').addEventListener('click', showMoviesList);

  // Dizileri listele
  function showSeriesList() {
    document.querySelector('.main-menu').style.display = 'none';
    const seriesListContainer = document.getElementById('series-list');
    seriesListContainer.innerHTML = '';
    seriesListContainer.style.display = 'block';

    Object.keys(seriesData).forEach(seriesName => {
      const seriesCard = createSeriesCard(seriesName);
      seriesListContainer.appendChild(seriesCard);
    });
  }

  // Dizi kartı oluşturma
  function createSeriesCard(seriesName) {
    const seriesCard = document.createElement('div');
    seriesCard.className = 'series-card';
    seriesCard.innerHTML = `
      <h2>${seriesName}</h2>
      <div class="episodes-list" style="display: none;"></div>
    `;

    seriesCard.querySelector('h2').addEventListener('click', function() {
      const episodesList = this.nextElementSibling;
      episodesList.style.display = episodesList.style.display === 'none' ? 'block' : 'none';
      loadEpisodes(seriesName, episodesList);
    });

    return seriesCard;
  }

  // Bölümleri yükleme
  function loadEpisodes(seriesName, container) {
    container.innerHTML = '';
    const episodes = seriesData[seriesName].episodes;

    Object.entries(episodes).forEach(([episodeName, data]) => {
      const episodeBtn = document.createElement('div');
      episodeBtn.className = 'menu-item';
      episodeBtn.textContent = episodeName;
      
      episodeBtn.addEventListener('click', () => {
        initVideoPlayer();
        playEpisode(data.parts);
      });

      container.appendChild(episodeBtn);
    });
  }

  // Bölümü oynatma: parça dizisini alıp sırayla oynatır
  function playEpisode(parts) {
    currentVideoParts = parts;
    currentPartIndex = 0;
    document.querySelector('.video-container').style.display = 'block';
    playNextPart();
  }

  // Sıradaki parçayı oynatma
  function playNextPart() {
    if(currentPartIndex >= currentVideoParts.length) {
      videoPlayer.dispose();
      alert("Bölüm tamamlandı!");
      return;
    }

    const videoUrl = currentVideoParts[currentPartIndex];
    console.log('Yükleniyor:', videoUrl);

    videoPlayer.src({
      src: videoUrl,
      type: 'video/mp4'
    });

    videoPlayer.ready(() => {
      videoPlayer.play().catch(error => {
        console.error('Oynatma Hatası:', error);
        videoPlayer.bigPlayButton.show();
      });
    });

    // 'one' kullanarak sadece bir kere tetiklenmesini sağlıyoruz
    videoPlayer.one('ended', () => {
      currentPartIndex++;
      playNextPart();
    });

    videoPlayer.one('error', () => {
      console.error('Video Hatası:', videoPlayer.error());
      alert('Video yüklenirken hata oluştu: ' + videoPlayer.error().message);
    });
  }
});
