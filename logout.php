<?php
session_start();
session_destroy();
header("Location: login.php"); // Çıkış yaptıktan sonra giriş ekranına yönlendir
exit;
?>
