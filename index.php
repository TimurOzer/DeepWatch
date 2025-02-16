<?php
session_start(); // Oturum başlat

// Eğer giriş yapılmamışsa, login sayfasına yönlendir
if (!isset($_SESSION["loggedIn"]) || $_SESSION["loggedIn"] !== true) {
    header("Location: login.php");
    exit;
}
?>

<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DeepWatch</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="assets/logo.png" alt="DeepWatch Logo" class="logo">
            <h1>DeepWatch</h1>
        </div>
        <div class="main-menu">
            <button class="tab-btn active" data-type="series" onclick="showContent('series')">Diziler</button>
            <button class="tab-btn" data-type="movies" onclick="showContent('movies')">Filmler</button>
        </div>
        <div id="content" class="content-grid"></div>
        
        <button onclick="logout()">Çıkış Yap</button>
    </div>

    <script>
        function logout() {
            window.location.href = "logout.php";
        }
    </script>
</body>
</html>
