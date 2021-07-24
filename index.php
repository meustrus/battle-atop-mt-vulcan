<?php

include 'boilerplate/template.inc.php';
template_register('custom', 'Title');
function customTitle() {
  echo 'A Penny Arcade-themed game!';
}

include 'boilerplate/template.php';

@session_start();
unset($_SESSION['me']);
?>

<p>Good day Penny Arcade staff!</p>
<p>I have prepared for you a delightful concoction of Javascript-powered hilarity. It's both a game and a web site! And it's ready for you to enjoy!</p>
<p>Please enter a name for yourself and get a friend (or nemesis) to do the same on another computer<br />&nbsp;&nbsp;&mdash; this next part is going to take a buddy.</p>
<form method="get" action="play.php" role="form">
 <div class="input-group">
  <label for="me" class="input-group-addon">Name:</label>
  <input type="text" class="form-control" maxlength="32" name="me" id="me" />
  <span class="input-group-btn">
   <button type="submit" class="btn btn-primary">Go Forth Into That Slippery Night</button>
  </span>
 </div>
</form>
