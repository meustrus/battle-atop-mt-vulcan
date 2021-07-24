<?php

include 'getdb.php';

if (!empty($_GET['me'])) {
  if (!empty($_GET['level'])) {
    $stmt = getdb()->prepare('UPDATE players SET lastaccess=NOW(),level=:level,action=:action WHERE username=:me');
    $stmt->execute(array(':level' => $_GET['level'], ':action' => @$_GET['action'], ':me' => $_GET['me']));
  }
  $stmt = getdb()->prepare('SELECT po.level AS level,po.action AS action FROM players pm INNER JOIN players po ON pm.gameid=po.gameid WHERE pm.username=:me AND po.username<>:me');
  $stmt->execute(array(':me' => $_GET['me']));
  $output = $stmt->fetchAll(PDO::FETCH_ASSOC);
  if (count($output) == 1) {
    echo $output[0]['level'], '|', $output[0]['action'];
  }
}
