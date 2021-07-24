<?php

require_once('getdb.php');

echo json_encode(getplayers(FALSE, @$_GET['me']));
