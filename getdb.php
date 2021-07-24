<?php

$PLAYERTIMEOUT = 800;

if (!function_exists('getplayers')) {
  function getplayers($name = NULL, $me = NULL) {
    global $PLAYERTIMEOUT;
    $sql = 'SELECT p.username FROM players p ';
    $where = ' WHERE p.lastaccess>=NOW()-:timeout';
    $params = array(':timeout' => $PLAYERTIMEOUT);

    if ($me) {
      $sql .= 'LEFT JOIN players pm ON p.gameid=pm.gameid AND pm.username=:me AND pm.lastaccess>=NOW()-:timeout';
      $where .= ' AND p.username<>:me';
      $params[':me'] = $me;
      // If this argument is provided, we don't want other players that are
      // already in a different game.
      $where .= ' AND ((p.gameid IS NULL AND pm.gameid IS NULL) OR p.gameid=pm.gameid)';
    }

    if ($name) {
      $where .= ' AND p.username=:name';
      $params[':name'] = $name;
    }

    $stmt = getdb()->prepare($sql . $where);
    $stmt->execute($params);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }
}

if (!function_exists('setplayer')) {
  function setplayer($name) {
    global $PLAYERTIMEOUT;
    $sql = 'UPDATE players pm LEFT JOIN players po ON pm.gameid=po.gameid AND pm.username<>po.username SET pm.gameid=NULL WHERE CASE WHEN pm.username=:name THEN po.lastaccess<NOW()-:timeout ELSE po.username IS NULL END';
    getdb()->prepare($sql)->execute(array(':name' => $name, ':timeout' => $PLAYERTIMEOUT));
    $sql = 'INSERT INTO players (username,lastaccess) VALUES (:name,NOW()) ON DUPLICATE KEY UPDATE lastaccess=NOW()';
    getdb()->prepare($sql)->execute(array(':name' => $name));
    /*
    $sql = 'DELETE FROM players WHERE lastaccess<NOW()-:timeout';
    getdb()->prepare($sql)->execute(array(':timeout' => $GLOBALS['PLAYERTIMEOUT']));
    */
  }
}

if (!function_exists('startgame')) {
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
}

if (!function_exists('getlevel')) {
  function getlevel($me) {
    global $PLAYERTIMEOUT;
    $sql = 'SELECT level FROM players p WHERE username=:me AND lastaccess>=NOW()-:timeout';
    $stmt = getdb()->prepare($sql);
    $stmt->execute(array(':me' => $me, ':timeout' => $PLAYERTIMEOUT));
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }
}

if (!function_exists('getdb')) {
  function getdb() {
    static $pdo;
    if (!isset($pdo)) {
      $pdo = new PDO('mysql:dbname=rpgpal_padb;host=localhost', 'rpgpal_padb', '22SilentUlnaes');
    }
    return $pdo;
  }
}

return getdb();
