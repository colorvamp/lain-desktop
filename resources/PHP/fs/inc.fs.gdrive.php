<?php
//$GLOBALS['userPath'] = '/var/www/testing/lain.colorvamp.com/resources/db/api.users/1/';

	$GLOBALS['tables']['googledrive.files'] = array('_fileHash_'=>'TEXT NOT NULL','fileRoute'=>'TEXT NOT NULL','fileName'=>'TEXT NOT NULL',
	'fileMime'=>'TEXT NOT NULL','fileSize'=>'INTEGER NOT NULL','filePermissions'=>'TEXT NOT NULL','fileChilds'=>'INTEGER NOT NULL DEFAULT 0',
	'fileOwner'=>'TEXT NOT NULL','fileGroup'=>'TEXT NOT NULL','fileMD5'=>'TEXT','fileThumbnail'=>'TEXT','fileTags'=>'TEXT',
	'fileDateC'=>'TEXT NOT NULL','fileDateM'=>'TEXT NOT NULL');
	if(!isset($GLOBALS['api']['fs.gdrive'])){$GLOBALS['api']['fs.gdrive'] = array();}
	$GLOBALS['api']['fs.gdrive'] = array_merge($GLOBALS['api']['fs.gdrive'],array(
		'table.files'=>'files','table.trash'=>'trash',
		'drives'=>array()
	));
	//https://code.google.com/apis/console/?pli=1#project:698412432905:access
	//https://developers.google.com/drive/folder
	//http://code.google.com/p/google-api-php-client/
	//https://gist.github.com/deanet/3427090

	//?alt=json

	function fs_gdrive_data_load($id = ''){
		if(substr($id,0,7) != 'gdrive:'){$id = 'gdrive:'.$id;}
		if(!isset($GLOBALS['api']['fs.gdrive']['drives'][$id])){
			include_once('api.drives.php');
			$GLOBALS['api']['fs.gdrive']['drives'][$id] = drives_data_load($id);
			if(!$GLOBALS['api']['fs.gdrive']['drives'][$id]){unset($GLOBALS['api']['fs.gdrive']['drives'][$id]);return false;}
			$GLOBALS['api']['fs.gdrive']['drives'][$id]['db.file'] = $GLOBALS['userPath'].'drives/'.$id.'.db';
		}
		//print_r($GLOBALS['api']['fs.gdrive']['drives'][$id]);
		return $GLOBALS['api']['fs.gdrive']['drives'][$id];
	}

	function fs_gdrive_sync($driveID = false,$db = false){
		if(substr($driveID,0,7) != 'gdrive:'){$driveID = 'gdrive:'.$driveID;}
		if(!isset($GLOBALS['api']['fs.gdrive']['drives'][$driveID])){$GLOBALS['api']['fs.gdrive']['drives'][$driveID] = fs_gdrive_data_load($driveID);}
		$drive = $GLOBALS['api']['fs.gdrive']['drives'][$driveID];
		set_time_limit(0);

		include_once('inc.html.php');
		$url = 'https://www.googleapis.com/drive/v2/files?maxResults=100';
		$header = array('Authorization'=>'Bearer '.$drive['driveAccessToken']);
		$data = array('header'=>$header);
		$data = html_petition($url,$data);
		$files = json_decode($data['pageContent'],1);
		if(isset($files['error']['code']) && $files['error']['code'] == 401){
			if($files['error']['message'] == 'Invalid Credentials'){return array('errorDescription'=>'INVALID_CREDENTIALS','file'=>__FILE__,'line'=>__LINE__);}
			$r = fs_gdrive_token_refresh($driveID);$args = func_get_args();return call_user_func_array(__FUNCTION__,$args);
		}

		$drivesFolder = $GLOBALS['userPath'].'drives/';
		if(!file_exists($drivesFolder)){$oldmask = umask(0);$r = @mkdir($drivesFolder,0777);umask($oldmask);}
		$folderList = array();
		include_once('inc.sqlite3.php');
		if(isset($files['items'])){
			$shouldClose = false;if(!$db){$db = sqlite3_open($drive['db.file']);sqlite3_exec('BEGIN',$db);$shouldClose = true;}
			foreach($files['items'] as $file){
				$fileRoute = $driveID.':/';
				if($file['mimeType'] == 'application/vnd.google-apps.folder'){$file['mimeType'] = 'folder';}
				if(isset($file['parents']) && $file['parents']){do{
					$parent = array_shift($file['parents']);
					if(!isset($folderList[$parent['id']])){continue;}
					$folder = $folderList[$parent['id']];
					$fileRoute = $folder['fileRoute'].$folder['fileName'].'/';
				}while(false);}

				$fileOB = array(
					'_fileHash_'=>$file['id'],'fileRoute'=>$fileRoute,'fileName'=>$file['title'],
					'fileMime'=>$file['mimeType'],'fileSize'=>isset($file['fileSize']) ? $file['fileSize'] : 0,'filePermissions'=>'aa','fileChilds'=>0,'fileOwner'=>'aa','fileGroup'=>'aa',
					'fileMD5'=>isset($file['md5Checksum']) ? $file['md5Checksum'] : '','fileThumbnail'=>isset($file['thumbnailLink']) ? $file['thumbnailLink'] : '',
					'fileDateC'=>strtotime($file['createdDate']),'fileDateM'=>strtotime($file['modifiedDate'])
				);
				if($file['mimeType'] == 'folder'){$folderList[$file['id']] = $fileOB;}
				$r = sqlite3_insertIntoTable($GLOBALS['api']['fs.gdrive']['table.files'],$fileOB,$db,'googledrive.files');
				if(isset($r['errorDescription'])){if($shouldClose){sqlite3_close($db);}return array('errorCode'=>$r['errorCode'],'errorDescription'=>$r['errorDescription'],'file'=>__FILE__,'line'=>__LINE__);}
				if(!$r['OK']){if($shouldClose){sqlite3_close($db);}return array('errorCode'=>$r['errno'],'errorDescription'=>$r['error'],'file'=>__FILE__,'line'=>__LINE__);}
			}
			if($shouldClose){$r = sqlite3_close($db,true);if(!$r){return array('errorCode'=>$GLOBALS['DB_LAST_QUERY_ERRNO'],'errorDescription'=>$GLOBALS['DB_LAST_QUERY_ERROR'],'file'=>__FILE__,'line'=>__LINE__);}}
		}
		print_r($files);

//FIXME: poner marca de tiempo de sync
exit;		
	}

	function fs_gdrive_list($fileRoute = ''){
		if(strpos($fileRoute,'gdrive:') !== 0 || !($s = strpos($fileRoute,':',7))){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
//FIXME: refactor
		$driveID = substr($fileRoute,7,$s-7);
		$driveFile = $GLOBALS['userPath'].'drives/gdrive:'.$driveID.'.db';

		include_once('inc.sqlite3.php');
		$params = array('indexBy'=>'fileHash','db.file'=>$driveFile);
		$fileOBs = sqlite3_getWhere($GLOBALS['api']['fs.gdrive']['table.files'],'(fileRoute = \''.$fileRoute.'\')',$params);

//FIXME: en fileDateM poner la fecha de la base de datos
		$folder = array('fileName'=>'gdrive.'.$driveID,'fileRoute'=>'gdrive.'.$driveID.':/',
			'fileMime'=>'drive','fileSize'=>0,'fileDateM'=>0);
		return array('folder'=>$folder,'files'=>$fileOBs);
	}

	function fs_gdrive_trash($fileOBs = array()){
		$filesByDriveByRoute = array();foreach($fileOBs as $fileOB){$s = strpos($fileOB['fileRoute'],':',7);$driveID = substr($fileOB['fileRoute'],7,$s-7);$filesByDriveByRoute[$driveID][$fileOB['fileRoute']][] = $fileOB;}
//FIXME: habría que comprobar que ningún fichero que vamos a eliminar esté dentro de otro

		foreach($filesByDriveByRoute as $driveID=>$fileRoutes){
			$driveFile = $GLOBALS['userPath'].'drives/gdrive.'.$driveID.'.db';
			if(!file_exists($driveFile)){continue;}
			$db = sqlite3_open($driveFile);sqlite3_exec('BEGIN',$db);
			foreach($fileRoutes as $fileRoute=>$fileOBs){
				$fileNames = array_map(function($n){return $n['fileName'];},$fileOBs);
				//FIXME: alternativamente usar fileHash si viene declarado
				/* Hacemos la consulta para comprobar la veracidad de los ficheros consultados */
				$fileOBs = sqlite3_getWhere($GLOBALS['api']['fs.gdrive']['table.files'],'(fileRoute = \''.$fileRoute.'\' AND fileName IN (\''.implode('\',\'',$fileNames).'\'))',array('db'=>$db,'indexBy'=>'fileHash'));
				foreach($fileOBs as $fileOB){
//FIXME: si es una carpeta?
					$r = sqlite3_insertIntoTable($GLOBALS['api']['fs.gdrive']['table.trash'],$fileOB,$db,'googledrive.files');
					if(isset($r['errorDescription'])){if($shouldClose){sqlite3_close($db);}return array('errorCode'=>$r['errorCode'],'errorDescription'=>$r['errorDescription'],'file'=>__FILE__,'line'=>__LINE__);}
					if(!$r['OK']){if($shouldClose){sqlite3_close($db);}return array('errorCode'=>$r['errno'],'errorDescription'=>$r['error'],'file'=>__FILE__,'line'=>__LINE__);}
				}
				/* Ahora sincronizamos los cambios con google drive */
				$fileHashes = array_map(function($n){return $n['fileHash'];},$fileOBs);
				$r = fs_gdrive_op_trash($driveID,$fileHashes);
print_r($fileOBs);
			}
			$r = sqlite3_close($db,true);if(!$r){return array('errorCode'=>$GLOBALS['DB_LAST_QUERY_ERRNO'],'errorDescription'=>$GLOBALS['DB_LAST_QUERY_ERROR'],'file'=>__FILE__,'line'=>__LINE__);}
		}
print_r($filesByDriveByRoute);
exit;

		$return = array('remove'=>array());

		return $return;
	}

	function fs_gdrive_op_trash($driveID = '',$fileHashes = array()){
		if(substr($driveID,0,7) != 'gdrive:'){$driveID = 'gdrive:'.$driveID;}
		if(!isset($GLOBALS['api']['fs.gdrive']['drives'][$driveID])){$GLOBALS['api']['fs.gdrive']['drives'][$driveID] = fs_gdrive_data_load($driveID);}
		$drive = $GLOBALS['api']['fs.gdrive']['drives'][$driveID];
$fileHash = array_shift($fileHashes);

		include_once('inc.html.php');
		$url = 'https://www.googleapis.com/drive/v2/files/'.$fileHash.'/trash';
		$header = array('Authorization'=>'Bearer '.$drive['token']);
		$data = array('header'=>$header,'post'=>array('a'=>'a'));
		$data = html_petition($url,$data);
		$return = json_decode($data['pageContent'],1);
		if(isset($return['error']['code']) && $return['error']['code'] == 401){$r = fs_gdrive_token_refresh($driveID);$args = func_get_args();return call_user_func_array(__FUNCTION__,$args);}
print_r($data);
exit;
	}

	function fs_gdrive_code_set($driveID = '',$driveCode = ''){
		if(substr($driveID,0,7) != 'gdrive:'){$driveID = 'gdrive:'.$driveID;}
		if(!isset($GLOBALS['api']['fs.gdrive']['drives'][$driveID]) && !($GLOBALS['api']['fs.gdrive']['drives'][$driveID] = fs_gdrive_data_load($driveID))){return array('errorDescription'=>'DRIVE_INFO_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		$GLOBALS['api']['fs.gdrive']['drives'][$driveID]['driveCode'] = $driveCode;
		$r = drives_data_save($driveID,'driveCode',$_GET['code']);
		$r = drives_data_save($driveID,'driveStatus','code');
		return true;
	}
	function fs_gdrive_code_request($driveID = '',$redirectURI = ''){
		if(substr($driveID,0,7) != 'gdrive:'){$driveID = 'gdrive:'.$driveID;}
		if(!isset($GLOBALS['api']['fs.gdrive']['drives'][$driveID])){$GLOBALS['api']['fs.gdrive']['drives'][$driveID] = fs_gdrive_data_load($driveID);}
		$drive = $GLOBALS['api']['fs.gdrive']['drives'][$driveID];
		if(empty($redirectURI) && isset($_SERVER)){$redirectURI = 'http://'.$_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI'];}

		include_once('inc.html.php');
		$url = 'https://accounts.google.com/o/oauth2/auth';
		$post = array('state'=>$driveID,'client_id'=>$drive['driveClient'],'response_type'=>'code','scope'=>'https://www.googleapis.com/auth/drive','redirect_uri'=>$redirectURI);
		$data = array('post'=>$post);
		$data = html_petition($url,$data);
		$r = preg_match('/HTTP\/[^ ]+ (?<httpCode>[0-9]+) (?<httpDesc>[a-zA-Z ]+)/',$data['pageHeader'],$m);
		if($m['httpCode'] != 200 && $m['httpCode'] != 302){return array('errorCode'=>$m['httpCode'],'errorDescription'=>$m['httpDesc'],'file'=>__FILE__,'line'=>__LINE__);}

		$r = preg_match('/Location: (.+)/',$data['pageHeader'],$m);
		if(!$r){return false;}
		return $m[1];
	}

	function fs_gdrive_token_request($driveID = '',$redirectURI = ''){
		if(substr($driveID,0,7) != 'gdrive:'){$driveID = 'gdrive:'.$driveID;}
		/* $redirectURI debe coincidir con la que se envió la primera vez */
		if(!isset($GLOBALS['api']['fs.gdrive']['drives'][$driveID])){$GLOBALS['api']['fs.gdrive']['drives'][$driveID] = fs_gdrive_data_load($driveID);}
		$drive = $GLOBALS['api']['fs.gdrive']['drives'][$driveID];
		if(!isset($drive['driveCode'])){return array('errorDescription'=>'REQUEST_CODE','file'=>__FILE__,'line'=>__LINE__);}
		if(empty($redirectURI) && isset($_SERVER)){$redirectURI = 'http://'.$_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI'];}

		include_once('inc.html.php');
		$url = 'https://accounts.google.com/o/oauth2/token';
		$post = array('code'=>$drive['driveCode'],'client_id'=>$drive['driveClient'],'client_secret'=>$drive['driveSecret'],'grant_type'=>'authorization_code','redirect_uri'=>$redirectURI);
		$data = array('post'=>$post);
		$data = html_petition($url,$data);
		$r = preg_match('/HTTP\/[^ ]+ (?<httpCode>[0-9]+) (?<httpDesc>[a-zA-Z ]+)/',$data['pageHeader'],$m);
		if($m['httpCode'] != 200 && $m['httpCode'] != 302){return array('errorCode'=>$m['httpCode'],'errorDescription'=>$m['httpDesc'],'file'=>__FILE__,'line'=>__LINE__);}

		$json = json_decode($data['pageContent'],1);
		if(isset($json['error'])){return array('errorDescription'=>strtoupper($json['error']),'file'=>__FILE__,'line'=>__LINE__);}
		include_once('api.drives.php');
		if(isset($json['access_token'])){
			$r = drives_data_save($driveID,'driveAccessToken',$json['access_token']);
			$GLOBALS['api']['fs.gdrive']['drives'][$driveID]['driveAccessToken'] = $json['access_token'];
		}
		if(isset($json['refresh_token'])){
			$r = drives_data_save($driveID,'driveRefreshToken',$json['refresh_token']);
			$GLOBALS['api']['fs.gdrive']['drives'][$driveID]['driveRefreshToken'] = $json['refresh_token'];
		}

		$r = drives_data_save($driveID,'driveStatus','init');
		return true;
	}

	function fs_gdrive_token_refresh($driveID = ''){
		if(substr($driveID,0,7) != 'gdrive:'){$driveID = 'gdrive:'.$driveID;}
		if(!isset($GLOBALS['api']['fs.gdrive']['drives'][$driveID])){$GLOBALS['api']['fs.gdrive']['drives'][$driveID] = fs_gdrive_data_load($driveID);}
		$drive = $GLOBALS['api']['fs.gdrive']['drives'][$driveID];

		include_once('inc.html.php');
		/* Para refrescar el token */
		$url = 'https://accounts.google.com/o/oauth2/token';
		$post = array('client_id'=>$drive['driveClient'],'client_secret'=>$drive['driveSecret'],'refresh_token'=>$drive['refresh_token'],'grant_type'=>'refresh_token');
		$data = array('post'=>$post);
		$data = html_petition($url,$data);
		$r = preg_match('/HTTP\/[^ ]+ (?<httpCode>[0-9]+) (?<httpDesc>[a-zA-Z ]+)/',$data['pageHeader'],$m);
		if($m['httpCode'] != 200 && $m['httpCode'] != 302){return array('errorCode'=>$m['httpCode'],'errorDescription'=>$m['httpDesc'],'file'=>__FILE__,'line'=>__LINE__);}

		$json = json_decode($data['pageContent'],1);
		if(!isset($json['access_token'])){print_r($data);exit;}
		include_once('api.drives.php');
		$r = drives_data_save($driveID,'driveAccessToken',$json['access_token']);
		$GLOBALS['api']['fs.gdrive']['drives'][$driveID]['driveAccessToken'] = $json['access_token'];
		return true;
	}
?>
