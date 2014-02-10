<?php
	$GLOBALS['tables']['drives.data'] = array('_pool_'=>'TEXT NOT NULL','_name_'=>'TEXT NOT NULL','data'=>'TEXT NOT NULL');
	if(!isset($GLOBALS['api']['drives'])){$GLOBALS['api']['drives'] = array();}
	$GLOBALS['api']['drives'] = array_merge($GLOBALS['api']['drives'],array(
		'db'=>(isset($GLOBALS['userPath']) ? $GLOBALS['userPath'] : '../db/').'drives.db',
		'table'=>'data'
	));

	function drives_list($db = false){
		include_once('inc.sqlite3.php');
		$r = sqlite3_getWhere($GLOBALS['api']['drives']['table'],1,array('selectString'=>'pool','indexBy'=>'pool','db'=>$db,'db.file'=>$GLOBALS['api']['drives']['db']));
		if(!$r){return $r;}
		return array_keys($r);
	}
	function drives_status($db = false){
		include_once('inc.sqlite3.php');
//FIXME: usar la misma conexión
		$drives = sqlite3_getWhere($GLOBALS['api']['drives']['table'],1,array('selectString'=>'pool','indexBy'=>'pool','db'=>$db,'db.file'=>$GLOBALS['api']['drives']['db']));
		$status = sqlite3_getWhere($GLOBALS['api']['drives']['table'],'(name = \'driveStatus\')',array('indexBy'=>'pool','db'=>$db,'db.file'=>$GLOBALS['api']['drives']['db']));
		foreach($drives as $pool=>$drive){if(!isset($status[$pool])){$drives[$pool]['driveStatus'] = 'unknown';continue;}$drives[$pool]['driveStatus'] = $status[$pool]['data'];}
		return $drives;
	}
	function drives_getSingle($whereClause = false,$params = array()){
		include_once('inc.sqlite3.php');
		if(!isset($params['db.file'])){$params['db.file'] = $GLOBALS['api']['drives']['db'];}
		if(!isset($params['indexBy'])){$params['indexBy'] = false;}
		return sqlite3_getSingle($GLOBALS['api']['drives']['table'],$whereClause,$params);
	}
	function drives_getWhere($whereClause = false,$params = array()){
		include_once('inc.sqlite3.php');
		if(!isset($params['db.file'])){$params['db.file'] = $GLOBALS['api']['drives']['db'];}
		if(!isset($params['indexBy'])){$params['indexBy'] = false;}
		return sqlite3_getWhere($GLOBALS['api']['drives']['table'],$whereClause,$params);
	}

	function drives_create($params = array(),$db = false){
		include_once('inc.sqlite3.php');

		$_valid = array();
		if(!isset($params['driveType'])){$params['driveType'] = 'gdrive';}
		switch($params['driveType']){
			case 'gdrive':
				$_valid = array('driveClient'=>0,'driveSecret'=>0);
				if(!isset($params['driveClient']) || !isset($params['driveSecret'])){return array('errorDescription'=>'INVALID_PARAMS','file'=>__FILE__,'line'=>__LINE__);}
				break;
		}

		$pool = $params['driveType'].':'.uniqid();
		foreach($params as $k=>$v){if(!isset($_valid[$k])){unset($params[$k]);}}
		$shouldClose = false;if(!$db){$db = sqlite3_open($GLOBALS['api']['drives']['db']);sqlite3_exec('BEGIN',$db);$shouldClose = true;}
		foreach($params as $k=>$v){$r = drives_data_save($pool,$k,$v,$db);}
		if($shouldClose){$r = sqlite3_close($db,true);if(!$r){return array('errorCode'=>$GLOBALS['DB_LAST_QUERY_ERRNO'],'errorDescription'=>$GLOBALS['DB_LAST_QUERY_ERROR'],'file'=>__FILE__,'line'=>__LINE__);}}
		return true;
	}

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
