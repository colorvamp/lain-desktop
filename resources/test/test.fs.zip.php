<?php

//$data = file_get_contents('outer.zip');
//$data64 = base64_encode($data);

$zip = new ZipArchive();
$r = $zip->open('zip://52feadcb19de9.zip#lalala.zip');
var_dump($r);

if($r === true){$zip->close();}

$fp = fopen('zip://52feadcb19de9.zip#lalala.zip','r');
var_dump($fp);
fclose($fp);
?>
