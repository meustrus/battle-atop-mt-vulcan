<?php

$PLAYERTIMEOUT = 800;

function getme() {
  if (empty($_GET['me'])) {
    $_SESSION['err'] = "No username selected";
    header('Location: index.php');
    exit;
  }

  if (!is_array(@$_SESSION['me'])) {
    $_SESSION['me'] = array();
  }
  
  if (!@$_SESSION['me'][$_GET['me']]) {
    $me = getplayers($_GET['me']);
    if (!empty($me)) {
      $_SESSION['err'] = "The username '{$_GET['me']}' is already taken.";
      header('Location: index.php');
      exit;
    }
  }

  $_SESSION['me'][$_GET['me']] = TRUE;
  setplayer($_GET['me']);

  return $_GET['me'];
}

function getplayers($name = FALSE, $me = FALSE) {
  global $PLAYERTIMEOUT;
  $sql = 'SELECT p.username, p.gameid, FALSE as inmygame FROM players p ';
  // $where = ' WHERE :timeout=:timeout';
  $where = ' WHERE p.lastaccess>=NOW()-:timeout';
  $params = array(':timeout' => $PLAYERTIMEOUT);

  if ($me !== FALSE && $me !== NULL) {
    $sql = 'SELECT p.username, p.gameid, p.gameid=pm.gameid as inmygame FROM players p ';
    $sql .= 'LEFT JOIN players pm ON pm.username=:me';
    $params[':me'] = $me;
    // We also don't want to get the user that is $me
    $where .= ' AND p.username<>:me';
  }

  if ($name !== FALSE) {
    $where .= ' AND p.username=:name';
    $params[':name'] = $name;
  }

  $stmt = getdb()->prepare($sql . $where);
  $stmt->execute($params);
  return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function setplayer($name) {
  global $PLAYERTIMEOUT;
  $sql = 'UPDATE players pm LEFT JOIN players po ON pm.gameid=po.gameid AND pm.username<>po.username SET pm.gameid=NULL WHERE CASE WHEN pm.username=:name THEN po.lastaccess<NOW()-:timeout ELSE po.username IS NULL END';
  getdb()->prepare($sql)->execute(array(':name' => $name, ':timeout' => $PLAYERTIMEOUT));
  $sql = 'INSERT INTO players (username,lastaccess) VALUES (:name,NOW()) ON DUPLICATE KEY UPDATE lastaccess=NOW()';
  getdb()->prepare($sql)->execute(array(':name' => $name));
  //*
  $sql = 'DELETE FROM players WHERE lastaccess<NOW()-:timeout';
  getdb()->prepare($sql)->execute(array(':timeout' => $GLOBALS['PLAYERTIMEOUT']));
  //*/
}

function startgame($me, $other) {
  global $PLAYERTIMEOUT;
  // Check if these players aren't already in a game together.
  $sql = 'SELECT po.username AS name FROM players pm INNER JOIN players po ON pm.gameid=po.gameid WHERE pm.username=:me AND po.username<>:me AND po.lastaccess>=NOW()-:timeout';
  $stmt = getdb()->prepare($sql);
  $stmt->execute(array(':me' => $me, ':timeout' => $PLAYERTIMEOUT));
  $players = $stmt->fetchAll(PDO::FETCH_ASSOC);
  if (count($players) != 1 || $players[0]['name'] != $other) {
    $sql = <<<SQL
      UPDATE players pm
        CROSS JOIN players po
        CROSS JOIN (SELECT COALESCE(MAX(gameid)+1,1) AS gameid FROM players) g
      SET pm.gameid=IF(po.gameid=pm.gameid,COALESCE(po.gameid, g.gameid),g.gameid),
        po.gameid=IF(po.gameid=pm.gameid,COALESCE(pm.gameid, g.gameid),g.gameid),
        pm.level=100,
        po.level=100,
        pm.action=NULL,
        po.action=NULL
      WHERE pm.username=:me
        AND po.username=:other
SQL;
    getdb()->prepare($sql)->execute(array(':me' => $me, ':other' => $other));
  }
}

function getlevel($me) {
  global $PLAYERTIMEOUT;
  $sql = 'SELECT level FROM players p WHERE username=:me AND lastaccess>=NOW()-:timeout';
  $stmt = getdb()->prepare($sql);
  $stmt->execute(array(':me' => $me, ':timeout' => $PLAYERTIMEOUT));
  return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getdb($attempt = 0) {
  static $pdo;
  if (!isset($pdo)) {
    try {
      $pdo = new PDO(
        "mysql:dbname={$_ENV['MYSQL_DATABASE']};host={$_ENV['MYSQL_HOST']}",
        $_ENV['MYSQL_USER'],
        $_ENV['MYSQL_PASSWORD']
      );
    } catch (Exception $e) {
      if ($attempt < 6) {
        sleep(5);
        return getdb($attempt + 1);
      } else {
        throw $e;
      }
    }
  }
  return $pdo;
}
