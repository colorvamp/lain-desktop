<?php
	include_once('../PHP/inc.test.php');
	include_once('api.users.php');
	$r = users_create(array('userName'=>'Marcos Fernández','userMail'=>'sombra2eternity@gmail.com'));
var_dump($r);
?>
