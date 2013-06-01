<?php
header('Content-type: text/plain');
ini_set('output_buffering','off');
ini_set('zlib.output_compression',false);
ini_set('implicit_flush',true);
ob_implicit_flush(true);
while(ob_get_level() > 0){$level = ob_get_level();ob_end_clean();if(ob_get_level() == $level){break;}}
if(function_exists('apache_setenv')){apache_setenv('no-gzip','1');apache_setenv('dont-vary','1');}
?>
