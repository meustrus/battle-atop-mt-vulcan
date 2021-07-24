<?php

include('getdb.php');

$prefix = '';
foreach (getplayers(@$_GET['other'], @$_GET['me']) as $row) {
  echo $prefix, $row['username'];
  $prefix = ':';
}
