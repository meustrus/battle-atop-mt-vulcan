<?php

include 'getdb.php';

// Check $_GET['username'].

@session_start();
if (!empty($_SESSION['me'])) {
  setplayer($_SESSION['me']);
}
elseif (empty($_GET['me'])) {
  header('Location: index.php');
  exit;
}
else {
  $me = getplayers($_GET['me']);
  if (!empty($me)) {
    $_SESSION['err'] = 'That username is already taken. Pick another one or wait for it to go away.';
    header('Location: index.php');
    exit;
  }
  else {
    $_SESSION['me'] = $_GET['me'];
    setplayer($_GET['me']);
  }
}

$players = getplayers(@$_GET['other'], $_SESSION['me']);

include 'template/template.inc.php';
template_register('custom', 'Foot');
include 'boilerplate/template.inc.php';

template_register('custom', 'Title');
function customTitle() {
  if (count($GLOBALS['players']) === 1) {
    echo 'Battle Atop Mount Vulcan';
  }
  else {
    echo 'Select Your Companion Meat-shape';
  }
}

include 'boilerplate/template.php';

if (count($players) === 1) {
  // Set up the game.
  startgame($_SESSION['me'], $players[0]['username']);
?>
 <div id="playingas">
  <span><?php echo htmlspecialchars($_SESSION['me']); ?> vs. <?php echo htmlspecialchars($players[0]['username']); ?></span>
 </div>
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
  $level = getlevel($_SESSION['me']);
  $startlevel = ((int) floor(@$level[0]['level'] / 100) * 100) % 1000;
?>
 <script src="boilerplate/js/vendor/jQueryRotateCompressed.js"></script>
 <script src="soundmanager/script/soundmanager2-nodebug-jsmin.js"></script>
 <script src="play.js"></script>
 <script>
  jQuery(function(){(play(jQuery, "<?php echo addslashes($_SESSION['me']); ?>", "<?php echo addslashes($GLOBALS['players'][0]['username']); ?>"))(<?php echo $startlevel; ?>, null, true)});
 </script>
<?php }
}
else { ?>
 <div id="playingas">
  <h2>Playing As:</h2>
  <span><?php echo htmlspecialchars($_SESSION['me']); ?></span>
 </div>
 <div id="player-select">
  <?php foreach ($players as $player) { ?>
   <?php $found = TRUE; ?>
   <form method="get" action="play.php" role="form">
    <div><input type="hidden" name="me" value="<?php echo htmlspecialchars($_SESSION['me']); ?>"></div>
    <div><input type="hidden" name="other" value="<?php echo htmlspecialchars($player['username']); ?>"></div>
    <div class="input-group">
     <span class="input-group-addon"><?php echo htmlspecialchars($player['username']); ?></span>
     <span class="input-group-btn"><button type="submit" class="btn btn-primary">Pick Me!</button></span>
    </div>
   </form>
  <?php } ?>
  <?php if (!@$found) { ?>
   <p id="player-oops">Oops, it looks like nobody loves you enough to play with you. Sorry 'bout that! Why don't you go make some friends <img src="img/smilies/Smile.png" width="18" height="18" alt=":)">?</p>
  <?php } ?>
 </div>
 <?php function customFoot() { ?>
  <script>
   jQuery(function($) {
    var $div = $('#player-select');
    var oops = $('#player-oops').html();
    window.setInterval(function() {
     $.ajax({url:"getplayers.php",data:{me:"<?php echo addslashes($_SESSION['me']); ?>"},success:function(data) {
      $div.empty();
      if (data != '') {
       var players = data.split(':');
       if (players.length == 1) {
        location.reload(true);
       }
       for (i in players) {
        if (players.hasOwnProperty(i)) {
         $div.append(
          '<form method="get" action="play.php" role="form">'+
           '<div><input type="hidden" name="me" value="<?php echo addslashes($_SESSION['me']); ?>"></div>'+
           '<div><input type="hidden" name="other" value="'+players[i]+'"></div>'+
           '<div class="input-group">'+
            '<span class="input-group-addon">'+players[i]+'</span>'+
            '<span class="input-group-btn"><button type="submit" class="btn btn-primary">Pick Me!</button></span>'+
           '</div>'+
          '</form>'
         );
        }
       }
      }
      else {
        $div.append('<p id="player-oops">'+oops+'</p>');
      }
     }});
    }, 3000);
   });
  </script>
 <?php } ?>
<?php }
