<?php

session_start();

require_once 'getdb.php';

$me = getme();

if (empty($_GET['other'])) {
  $_SESSION['err'] = "No companion selected";
  header('Location: lobby.php?me=' . urlencode($me));
  exit;
}

$players = getplayers($_GET['other'], $me);

if (count($players) !== 1 || !(empty($players[0]['gameid']) || $players[0]['inmygame'])) {
  $_SESSION['err'] = "Can't start game with '{$_GET['other']}' (did they start a game with someone else?)";
  header('Location: lobby.php?me=' . urlencode($me));
  exit;
}

// Set up the game.
startgame($me, $players[0]['username']);

require_once 'template/template.inc.php';
template_register('custom', 'Foot');
require_once 'boilerplate/template.inc.php';

template_register('custom', 'Title');
function customTitle() {
  echo 'Battle Atop Mount Vulcan';
}

require_once 'boilerplate/template.php';

?>
<div id="playingas">
 <span><?php echo htmlspecialchars($me); ?> vs. <?php echo htmlspecialchars($players[0]['username']); ?></span>
</div>
<div id="back-btn">
 <a href="." class="btn">&#11164;</a>
</div>
<div id='mute'></div>
<noscript>You really must enable JavaScript you disembodied silly-head.</noscript>
<div id="playarea_wrapper">
 <div id="preloadThrobber" class="throbber hidden"><span>Waiting for images to load...</span></div>
 <div id="otherThrobber" class="throbber hidden"><span>Waiting for the other player...</span></div>
 <div id="playarea">
  <div>
   <div id="toplayer"></div>
   <div id="msgarea" class="hidden"><span></span></div>
   <div id="dlgarea" class="hidden">
    <div>
     <div class="w"><span><em>w</em></span><p></p></div>
     <div class="a"><span><em>a</em></span><p></p></div>
     <div class="s"><span><em>s</em></span><p></p></div>
     <div class="d"><span><em>d</em></span><p></p></div>
    </div>
   </div>
   <div id="roshambolivo" class="hidden">
    <div>
     <div class="rock"><span><em>a</em></span></div>
     <div class="paper"><span><em>w</em></span></div>
     <div class="scissors"><span><em>d</em></span></div>
     <div class="lizard"><span><em>s</em></span></div>
     <div class="vulcan"><span><em>space</em></span></div>
    </div>
   </div>
   <div id="pong" class="hidden">
    <div id="pongtable"></div>
    <div id="mypaddle" class="paddle"></div>
    <div id="otherpaddle" class="paddle"></div>
    <img id="pongball" src="img/pongball.png" width="65" height="64" />
    <img id="pongball_shadow" src="img/pongball_shadow.png" width="64" height="32" />
   </div>
  </div>
 </div>
</div>
<?php function customFoot() {
  $level = getlevel($GLOBALS['me']);
  $startlevel = ((int) floor(@$level[0]['level'] / 100) * 100) % 1000;
?>
 <script src="boilerplate/js/vendor/jQueryRotateCompressed.js"></script>
 <script src="soundmanager/script/soundmanager2-nodebug-jsmin.js"></script>
 <script src="play.js"></script>
 <script>
  jQuery(function(){(play(jQuery, "<?php echo addslashes($GLOBALS['me']); ?>", "<?php echo addslashes($GLOBALS['players'][0]['username']); ?>"))(<?php echo $startlevel; ?>, null, true)});
 </script>
<?php }
