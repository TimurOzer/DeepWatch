document.addEventListener('DOMContentLoaded', () => {
  // Videoları barındırdığınız GitHub raw linklerini kullanın.
  const seriesData = {
    "Dark Series": {
      episodes: {
        "1. Bölüm": { 
          parts: [
            "https://raw.githubusercontent.com/TimurOzer/DeepWatch/main/series/dark-series/eps1/part0.mp4",
            "https://raw.githubusercontent.com/TimurOzer/DeepWatch/main/series/dark-series/eps1/part1.mp4"
            // Diğer parçaları ekleyin...
          ]
        }
      }
    }
  };

  let currentVideoParts = [];
  let currentPartIndex = 0;
  const videoPlayer = document.getElementById('videoPlayer');

  // Parça bittiğinde sıradaki parçayı oynat
  videoPlayer.addEventListener('ended', () => {
    currentPartIndex++;
    if (currentPartIndex < currentVideoParts.length) {
      playCurrentPart();
    } else {
      alert("Bölüm tamamlandı!");
    }
  });

  // Mevcut parçayı oynatır
  function playCurrentPart() {
    videoPlayer.src = currentVideoParts[currentPartIndex];
    videoPlayer.load();
    videoPlayer.play().catch(err => {
      console.error("Oynatma Hatası:", err);
    });
  }

  // Ana menü elemanlarına tıklama dinleyicileri
  document.getElementById('series').addEventListener('click', showSeriesList);
  // Filmler için de benzer yapı kurulabilir.

  // Dizileri listele
  function showSeriesList() {
    document.querySelector('.main-menu').style.display = 'none';
    const seriesListContainer = document.getElementById('series-list');
    seriesListContainer.innerHTML = '';
    seriesListContainer.style.display = 'block';

    for (const seriesName in seriesData) {
      const seriesCard = createSeriesCard(seriesName);
      seriesListContainer.appendChild(seriesCard);
    }
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

    for (const episodeName in episodes) {
      const episodeBtn = document.createElement('div');
      episodeBtn.className = 'menu-item';
      episodeBtn.textContent = episodeName;
      
      episodeBtn.addEventListener('click', () => {
        currentVideoParts = episodes[episodeName].parts;
        currentPartIndex = 0;
        document.querySelector('.video-container').style.display = 'block';
        playCurrentPart();
      });

      container.appendChild(episodeBtn);
    }
  }
});
