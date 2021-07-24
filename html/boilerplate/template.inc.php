<?php

require_once('template/template.inc.php');

template_register('boilerplate');

function boilerplatePageHead() { ?>
<?php template_render('PageTop'); ?>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"<?php template_render('PageAttributes'); ?>> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"<?php template_render('PageAttributes'); ?>> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"<?php template_render('PageAttributes'); ?>> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js"<?php template_render('PageAttributes'); ?>> <!--<![endif]-->
 <head>
<?php template_render('HeadElem'); ?>
 </head>
 <body<?php template_render('BodyAttributes'); ?>>
<?php template_render('BodyHead', FALSE); ?>

<?php }

function boilerplateBodyHead() { ?>
  <h1><?php template_render('Title'); ?></h1>
  <?php
    // Error message checking.
    @session_start();
    if (!empty($_SESSION['err'])) { ?>
      <div class="alert alert-danger"><?php echo htmlspecialchars($_SESSION['err']); ?></div>
  <?php
      unset($_SESSION['err']);
    }
  ?>
  <!--[if lt IE 7]>
      <p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
  <![endif]-->
<?php }

function boilerplatePageTop() { ?>
<!DOCTYPE html>
<?php }

function boilerplateHeadElem() { ?>
  <meta charset="<?php template_render('Charset'); ?>">
  <meta http-equiv="Content-type" content="text/html;charset=<?php template_render('Charset'); ?>">
  <title><?php template_render('Title') ?></title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="boilerplate/css/bootstrap.min.css">
  <link rel="stylesheet" href="boilerplate/css/bootstrap-theme.min.css">
  <link rel="stylesheet" href="boilerplate/css/main.css">
  <link rel="stylesheet" href="boilerplate/css/game.css">
  <script src="boilerplate/js/vendor/modernizr-2.6.2.min.js"></script>

<?php template_render('Head', FALSE);
}

function boilerplateFoot() { ?>
  <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
  <script>window.jQuery || document.write('<script src="boilerplate/js/vendor/jquery-1.10.2.min.js"><\/script>')</script>
  <script src="//code.jquery.com/ui/1.10.3/jquery-ui.js"></script>
  <script>window.jQuery.ui || document.write('<script src="boilerplate/js/vendor/jquery-ui.js"><\/script>')</script>
  <script src="boilerplate/js/vendor/bootstrap.min.js"></script>
  <script src="boilerplate/js/plugins.js"></script>
  <script src="boilerplate/js/main.js"></script>
<?php }
