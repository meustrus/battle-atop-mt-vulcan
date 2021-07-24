<?php

session_start();

require_once 'getdb.php';

$me = getme();

$players = getplayers(FALSE, $me);

require_once 'template/template.inc.php';
template_register('custom', 'Foot');
require_once 'boilerplate/template.inc.php';

template_register('custom', 'Title');
function customTitle() {
  echo 'Select Your Companion Meat-shape';
}

require_once 'boilerplate/template.php';

?>
<div id="playingas">
 <h2>Playing As:</h2>
 <span id="me"><?php echo htmlspecialchars($me); ?></span>
</div>
<div id="back-btn">
 <a href="." class="btn">&#11164;</a>
</div>
<div id="player-select">
 <?php foreach ($players as $player) { ?>
  <?php $found = TRUE; ?>
  <form method="get" action="play.php" role="form">
   <div class="input-group">
    <input type="hidden" name="me" value="<?php echo htmlspecialchars($me); ?>">
    <input class="form-control" type="text" name="other" readonly="readonly" value="<?php echo htmlspecialchars($player['username']); ?>">
    <span class="input-group-btn">
     <?php if ($player['inmygame'] || empty($player['gameid'])) { ?>
      <button type="submit" class="btn btn-primary"><?php if ($player['inmygame']) { ?>Continue with me!<?php } else { ?>Start with me!<?php } ?></button>
     <?php } else { ?>
      <button type="submit" class="btn btn-primary" disabled="disabled">(in another game)</button>
     <?php } ?>
    </span>
   </div>
  </form>
 <?php } ?>
 <?php if (!@$found) { ?>
   <p id="player-oops">No friends nor nemeses have selected a name in the last 13 minutes.</p>
 <?php } ?>
</div>
<?php function customFoot() { ?>
 <script>
  jQuery(function($) {
   var $div = $('#player-select');
   var oops = $('#player-oops').html();
   window.setInterval(function() {
    var me = $("#me").text();
    $.ajax({url:"getplayers.php",data:{me:me},success:function(data) {
     $div.empty();
     var players = JSON.parse(data);
     if (players && players.length > 0) {
      for (i in players) {
       if (players.hasOwnProperty(i)) {
        $div.append(
         $(document.createElement('form'))
          .attr({ method: 'get', action: 'play.php', role: 'form'})
          .append(
           $(document.createElement('div'))
            .addClass('input-group')
            .append(
             $(document.createElement('input'))
              .attr({ type: 'hidden', name: 'me', value: me })
            )
            .append(
             $(document.createElement('input'))
              .attr({ type: 'text', name: 'other', readonly: 'readonly', value: players[i].username })
              .addClass('form-control')
            )
            .append(
             $(document.createElement('span'))
              .addClass('input-group-btn')
              .append(
               $(document.createElement('button'))
                .attr({ type: 'submit', disabled: !players[i]['inmygame'] && players[i]['gameid'] })
                .addClass('btn btn-primary')
                .text(
                 players[i].inmygame
                  ? 'Continue with me!'
                  : players[i]['gameid']
                   ? '(in another game)'
                   : 'Start with me!'
                )
              )
            )
          )
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
<?php }
