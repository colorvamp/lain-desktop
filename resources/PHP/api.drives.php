<?php
	$GLOBALS['tables']['drives.data'] = array('_pool_'=>'TEXT NOT NULL','_name_'=>'TEXT NOT NULL','data'=>'TEXT NOT NULL');
	if(!isset($GLOBALS['api']['drives'])){$GLOBALS['api']['drives'] = array();}
	$GLOBALS['api']['drives'] = array_merge($GLOBALS['api']['drives'],array(
		'db'=>$GLOBALS['userPath'].'drives.db',
		'table'=>'data'
	));

	function drives_data_save($pool = '',$name = '',$data = '',$db = false){
		include_once('inc.sqlite3.php');
		$row = array('_pool_'=>$pool,'_name_'=>$name,'data'=>$data);
		$shouldClose = false;if(!$db){$db = sqlite3_open($GLOBALS['api']['drives']['db']);sqlite3_exec('BEGIN',$db);$shouldClose = true;}
		$r = sqlite3_insertIntoTable($GLOBALS['api']['drives']['table'],$row,$db,'drives.data');
		if(isset($r['errorDescription'])){if($shouldClose){sqlite3_close($db);}return array('errorCode'=>$r['errorCode'],'errorDescription'=>$r['errorDescription'],'file'=>__FILE__,'line'=>__LINE__);}
		if(!$r['OK']){if($shouldClose){sqlite3_close($db);}return array('errorCode'=>$r['errno'],'errorDescription'=>$r['error'],'file'=>__FILE__,'line'=>__LINE__);}
		if($shouldClose){$r = sqlite3_close($db,true);if(!$r){return array('errorCode'=>$GLOBALS['DB_LAST_QUERY_ERRNO'],'errorDescription'=>$GLOBALS['DB_LAST_QUERY_ERROR'],'file'=>__FILE__,'line'=>__LINE__);}}
		return true;
	}
	function drives_data_load($pool = '',$db = false){
		include_once('inc.sqlite3.php');
		$params = array('indexBy'=>'name','db'=>$db,'db.file'=>$GLOBALS['api']['drives']['db']);
		$data = sqlite3_getWhere($GLOBALS['api']['drives']['table'],'(pool = \''.$pool.'\')',$params);
		foreach($data as $k=>$v){$data[$k] = $v['data'];}
		return $data;
	}
?>
