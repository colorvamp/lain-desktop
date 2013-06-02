<?php
	$GLOBALS['tables']['apps'] = array('_appCode_'=>'TEXT NOT NULL','appName'=>'TEXT NOT NULL','appMenu'=>'TEXT','appStatus'=>'INTEGER DEFAULT 1','appPosition'=>'INTEGER');
	$GLOBALS['api']['desktop'] = array('db'=>$GLOBALS['userPath'].'desktop.db');

	function desktop_app_save($app){
		$valid = array('appCode'=>0,'appMenu'=>0,'appStatus'=>0,'appPosition'=>0);
		foreach($data as $k=>$v){if(!isset($valid[$k])){unset($data[$k]);continue;}}
		if(!isset($app['appCode'])){return array('errorCode'=>1,'errorDescription'=>'INVALID_APP_CODE','file'=>__FILE__,'line'=>__LINE__);}
		$app['appCode'] = preg_replace('/[^a-zA-Z0-9]*/','',$app['appCode']);
		if(empty($app['appCode'])){return array('errorCode'=>1,'errorDescription'=>'INVALID_APP_CODE','file'=>__FILE__,'line'=>__LINE__);}
		if(isset($app['appName'])){$app['appName'] = preg_replace('/[^a-zA-Z0-9 ]*/','',$app['appName']);}
		if(isset($app['appMenu'])){$app['appMenu'] = preg_replace('/[^a-zA-Z0-9 ]*/','',$app['appMenu']);}
		if(isset($app['appStatus'])){if($app['appStatus'] != 0 || $app['appStatus'] != 1){unset($app['appStatus']);}}
		if(isset($app['appPosition'])){$app['appPosition'] = preg_replace('/[^0-9]*/','',$app['appPosition']);}

		$shouldClose = false;if(!$db){$db = sqlite3_open($GLOBALS['api']['desktop']['db']);sqlite3_exec('BEGIN',$db);$shouldClose = true;}
		$r = sqlite3_insertIntoTable($GLOBALS['api']['users']['table'],$app,$db);
		if(!$r['OK']){if($shouldClose){sqlite3_close($db);}return array('errorCode'=>$r['errno'],'errorDescription'=>$r['error'],'file'=>__FILE__,'line'=>__LINE__);}
		$app = users_getSingle('(userMail = \''.$app['appName'].'\')',array('db'=>$db));
		if($shouldClose){$r = sqlite3_exec('COMMIT;',$db);$GLOBALS['DB_LAST_ERRNO'] = $db->lastErrorCode();$GLOBALS['DB_LAST_ERROR'] = $db->lastErrorMsg();if(!$r){sqlite3_close($db);return array('errorCode'=>$GLOBALS['DB_LAST_ERRNO'],'errorDescription'=>$GLOBALS['DB_LAST_ERROR'],'file'=>__FILE__,'line'=>__LINE__);}sqlite3_close($db);}
		return $app;
	}
	function desktop_app_getSingle($whereClause = false,$params = array()){
		$shouldClose = false;if(!isset($params['db']) || !$params['db']){$params['db'] = sqlite3_open($GLOBALS['api']['desktop']['db'],SQLITE3_OPEN_READONLY);$shouldClose = true;}
		$r = sqlite3_getSingle('apps',$whereClause,$params);
		if($shouldClose){sqlite3_close($params['db']);}
		return $r;
	}
	function desktop_app_getWhere($whereClause = false,$params = array()){
		$shouldClose = false;if(!isset($params['db']) || !$params['db']){$params['db'] = sqlite3_open($GLOBALS['api']['desktop']['db'],SQLITE3_OPEN_READONLY);$shouldClose = true;}
		$r = sqlite3_getWhere('apps',$whereClause,$params);
		if($shouldClose){sqlite3_close($params['db']);}
		return $r;
	}

	function desktop_background_set($filePath = false){
		include_once('api.fs.php');
		$fileName = basename($filePath);
		$fileRoute = dirname($filePath);

		if(strpos($fileRoute,'native:drive:') === 0){$fileRoute = substr($fileRoute,13);}
		$fileRoute = fs_helper_parsePath($fileRoute);
		if($fileRoute === false){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		if(!is_dir($fileRoute)){return array('errorDescription'=>'PATH_IS_NOT_DIRECTORY','file'=>__FILE__,'line'=>__LINE__);}
		$targetFile = $fileRoute.$fileName;

		include_once('inc.images.php');
		$imgProp = getimagesize($targetFile);
		/* If $imgProp == false the path is not an image */
		if($imgProp === false){return json_encode(array('errorCode'=>1,'errorDescription'=>'NOT_AN_IMAGE','file'=>__FILE__,'line'=>__LINE__));}
		$bgDir = $GLOBALS['userPath'].'background/';if(!file_exists($bgDir)){$oldmask = umask(0);$r = @mkdir($bgDir,0777,1);umask($oldmask);}
		copy($targetFile,$bgDir.'main');
		$targetFile = $bgDir.'main';
		$image = image_mimeDecider($imgProp['mime'],$targetFile);

		/* We gonna generate a few thumbs */
		$r = image_convert($targetFile,'jpeg');
		/* Realizamos los diferentes tamaños */
		$sizes = array('32','64','128','256','306','120x160');$overWrite = true;
		foreach($sizes as $k=>$size){
			$destPath = $bgDir.$size.'.jpeg';
			//if($overWrite === false && file_exists($destPath)){continue;}
			if(!is_numeric($size[0])){unset($sizes[$k]);continue;}
			if(strpos($size,'x') !== false){$r = image_thumb($image,$destPath,$size);continue;}
			$r = image_square($image,$destPath,$size);
		}

		imagedestroy($image);
		return true;
	}

	function desktop_background_get($size = false){
		$bgDir = $GLOBALS['userPath'].'background/';
		$targetFile = $bgDir.'main.jpeg';
		if(!file_exists($targetFile)){exit;}
		$finfo = finfo_open(FILEINFO_MIME,'../db/magic.mgc');list($fileMimeType) = explode('; ',finfo_file($finfo,$targetFile));finfo_close($finfo);
		header('Content-type: '.$fileMimeType);
		readfile($targetFile);exit;
	}
?>
