<?php
	$GLOBALS['tables']['systemUsers'] = array('_userMail_'=>'TEXT NOT NULL','userName'=>'TEXT NOT NULL','userAlias'=>'TEXT NOT NULL','userRegistered'=>'TEXT NOT NULL'
		'userBirthday'=>'TEXT','userGender'=>'TEXT','userNick'=>'TEXT','userWeb'=>'TEXT','userBio'=>'TEXT','userPhrase'=>'TEXT','userModes'=>'TEXT',
		'userStatus'=>'TEXT','userTags'=>'TEXT','userCode'=>'TEXT');
	$GLOBALS['api']['users'] = array('db'=>'../db/api.users.db','table'=>'systemUsers');
	include_once('inc.sqlite3.php');

	/* Necesitamos una doble sincronización, no podemos depender de un 
	 * repositorio único porque se saturaría por las reiteradas peticiones
	 * de los distintos usuarios.
	 */

	function users_getSingle($whereClause = false,$params = array()){
		$shouldClose = false;if(!isset($params['db']) || !$params['db']){$params['db'] = sqlite3_open($GLOBALS['api']['users']['db'],SQLITE3_OPEN_READONLY);$shouldClose = true;}
		$r = sqlite3_getSingle($GLOBALS['api']['users']['table'],$whereClause,$params);
		if($shouldClose){sqlite3_close($params['db']);}
		return $r;
	}
	function users_getWhere($whereClause = false,$params = array()){
		$shouldClose = false;if(!isset($params['db']) || !$params['db']){$params['db'] = sqlite3_open($GLOBALS['api']['users']['db'],SQLITE3_OPEN_READONLY);$shouldClose = true;}
		$r = sqlite3_getWhere($GLOBALS['api']['users']['table'],$whereClause,$params);
		if($shouldClose){sqlite3_close($params['db']);}
		return $r;
	}
?>
