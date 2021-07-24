<?php
function template_register($set = FALSE, $component = FALSE, $delete = FALSE) {
    static $prefix = array('default' => array(FALSE));
    
    if (is_string($set)) {
        if ($delete) {
            if (isset($prefix[$set])) {
                if (is_string($component)) {
                    $key = array_search($component, $prefix[$set]);
                    array_splice($prefix[$set], $key, 1);
                    if (empty($prefix[$set])) unset($prefix[$set]);
                } else {
                    unset($prefix[$set]);
                }
            }
        } else {
            $prefix[$set][] = $component;
        }
    }
    return $prefix;
}

function template_unregister($prefix, $component = FALSE) {
    template_register($prefix, $component, TRUE);
}

function template_renderable($component) {
    foreach (template_register() AS $vals) {
        if (in_array('Render', $vals)) {
            if (function_exists($callback = $prefix . 'Renderable'))
                if ($callback($component)) return TRUE;
        }
        if (!in_array(FALSE, $vals) && !in_array($component, $vals)) continue;
        if (function_exists($prefix . $component)) return TRUE;
    }
    return FALSE;
}

function template_render($component, $stop = TRUE, $reverse = NULL) {
    if ($reverse === NULL) $reverse = $stop;
    
    $output = FALSE;
    $registered = template_register();
    if ($reverse) $registered = array_reverse($registered);
    foreach ($registered AS $prefix => $vals) {
        $callbacks = array();
        if (in_array(FALSE, $vals) || in_array($component, $vals))
            $callbacks[$prefix . $component] = array();
        if (in_array('Render', $vals))
            $callbacks["{$prefix}Render"] = func_get_args();
        foreach ($callbacks AS $func => $args) {
            if (function_exists($func)) {
                if (call_user_func_array($func, $args) !== FALSE) {
                    if ($stop) return TRUE;
                    $output = TRUE;
                }
            }
        }
    }
    return $output;
}

function defaultPageHead() { ?>
<?php template_render('PageTop'); ?>
<html<?php template_render('PageAttributes'); ?>>
 <head>
<?php template_render('HeadElem'); ?>
 </head>
 <body<?php template_render('BodyAttributes'); ?>>
<?php template_render('BodyHead', FALSE); ?>

<?php }

function defaultPageTop() { ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<?php }

function defaultPageAttributes() {
    echo ' xmlns="http://www.w3.org/1999/xhtml"';
}

function defaultHeadElem() { ?>
  <title><?php template_render('Title') ?></title>
  <meta http-equiv="Content-type" content="text/html;charset=<?php template_render('Charset'); ?>" />

<?php template_render('Head', FALSE);
}

function defaultTitle() {
    echo htmlentities($_SERVER['REQUEST_URI']);
}

function defaultCharset() {
    echo 'UTF-8';
}

function defaultFoot() { ?>
 </body>
</html>
<?php }
