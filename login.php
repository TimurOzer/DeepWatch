<?php
session_start();

const CORRECT_USERNAME = "BENIM_KULLANICI_ADIM";
const CORRECT_PASSWORD = "BENIM_SIFREM";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $username = $_POST["username"];
    $password = $_POST["password"];

    if ($username === CORRECT_USERNAME && $password === CORRECT_PASSWORD) {
        $_SESSION["loggedIn"] = true;
        header("Location: index.php"); // Başarılı girişten sonra yönlendir
        exit;
    } else {
        $error = "Yanlış kullanıcı adı veya şifre!";
    }
}
?>

<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Giriş Yap</title>
    <style>
        body {
            background-color: #0a0a1a;
            color: white;
            font-family: Arial, sans-serif;
            text-align: center;
        }
        .login-container {
            width: 350px;
            margin: 100px auto;
            background: #1a1a2e;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.7);
        }
        input {
            width: 90%;
            padding: 15px;
            margin: 15px 0;
            border: none;
            border-radius: 5px;
            background: #333;
            color: #fff;
            font-size: 1em;
            text-align: center;
        }
        button {
            width: 100%;
            padding: 15px;
            background: #1e90ff;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 1.1em;
            cursor: pointer;
        }
        button:hover {
            background: #004080;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <h2>Giriş Yap</h2>
        <form method="post">
            <input type="text" name="username" placeholder="Kullanıcı Adı" required>
            <input type="password" name="password" placeholder="Şifre" required>
            <button type="submit">Giriş</button>
        </form>
        <?php if (isset($error)) echo "<p style='color: red;'>$error</p>"; ?>
    </div>
</body>
</html>
