<?php
require_once(dirname(__FILE__) . '/template.inc.php');

template_render('PageHead');
register_shutdown_function('template_render', 'Foot', FALSE, TRUE);
