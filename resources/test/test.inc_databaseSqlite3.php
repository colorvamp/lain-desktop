<?php
	include_once('../PHP/inc_test.php');
	include_once('inc.sqlite3.php');
	$GLOBALS['tables']['test'] = array('_id_'=>'INTEGER AUTOINCREMENT','data'=>'TEXT UNIQUE','value'=>'TEXT NOT NULL');


	$data = array('_id_'=>3,'data'=>'data1','value'=>'value1');
	$r = sqlite3_insertIntoTable('test',$data);
	var_dump($r);
?>
