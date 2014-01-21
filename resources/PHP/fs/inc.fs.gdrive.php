<?php
//$GLOBALS['userPath'] = '/var/www/testing/lain.colorvamp.com/resources/db/api.users/1/';

	$GLOBALS['tables']['googledrive.files'] = array('_fileHash_'=>'TEXT NOT NULL','fileRoute'=>'TEXT NOT NULL','fileName'=>'TEXT NOT NULL',
	'fileMime'=>'TEXT NOT NULL','fileSize'=>'INTEGER NOT NULL','filePermissions'=>'TEXT NOT NULL','fileChilds'=>'INTEGER NOT NULL DEFAULT 0',
	'fileOwner'=>'TEXT NOT NULL','fileGroup'=>'TEXT NOT NULL','fileMD5'=>'TEXT','fileThumbnail'=>'TEXT','fileTags'=>'TEXT',
	'fileDateC'=>'TEXT NOT NULL','fileDateM'=>'TEXT NOT NULL');
	if(!isset($GLOBALS['api']['fs.gdrive'])){$GLOBALS['api']['fs.gdrive'] = array();}
	$GLOBALS['api']['fs.gdrive'] = array_merge($GLOBALS['api']['fs.gdrive'],array(
		'db.id'=>'52d8759872254',
		'table.files'=>'files',
		'drives'=>array()
	));
	//https://code.google.com/apis/console/?pli=1#project:698412432905:access
	//https://developers.google.com/drive/folder
	//http://code.google.com/p/google-api-php-client/
	//https://gist.github.com/deanet/3427090

	//?alt=json

	function fs_gdrive_data_load($id = ''){
		if(!isset($GLOBALS['api']['fs.gdrive']['drives'][$id])){
			include_once('api.drives.php');
			$GLOBALS['api']['fs.gdrive']['drives'][$id] = drives_data_load('gdrive:'.$id);
			$GLOBALS['api']['fs.gdrive']['drives'][$id]['db.file'] = $GLOBALS['userPath'].'drives/gdrive.'.$id.'.db';
		}
print_r($GLOBALS['api']['fs.gdrive']['drives'][$id]);
		return $GLOBALS['api']['fs.gdrive']['drives'][$id];
	}

/*
Mejor este método: https://developers.google.com/accounts/docs/OAuth2ServiceAccount?hl=es
*/

	/* Para obtener el code */
	/*$url = 'https://accounts.google.com/o/oauth2/auth';
	$post = array('client_id'=>$DRIVE_clientID,'response_type'=>'code','scope'=>'https://www.googleapis.com/auth/drive','redirect_uri'=>'http://localhost');
	$data = array('post'=>$post);
	$data = html_petition($url,$data);
print_r($data);
exit;//*/
	/* Para obtener el token */
	//$url = 'https://accounts.google.com/o/oauth2/token?client_id='.urlencode($DRIVE_clientID).'&client_secret='.urlencode($DRIVE_secret);
	/*$url = 'https://accounts.google.com/o/oauth2/token';
	$post = array('code'=>$DRIVE_code,'client_id'=>$DRIVE_clientID,'client_secret'=>$DRIVE_secret,'grant_type'=>'authorization_code','redirect_uri'=>'http://localhost');
	$data = array('post'=>$post);
	$data = html_petition($url,$data);
echo time();
print_r($data);*/

	//fs_gdrive_sync($GLOBALS['api']['fs.gdrive']['db.id']);
	function fs_gdrive_sync($driveID = false,$db = false){
		if(!isset($GLOBALS['api']['fs.gdrive']['drives'][$driveID])){$GLOBALS['api']['fs.gdrive']['drives'][$driveID] = fs_gdrive_data_load($driveID);}
		$drive = $GLOBALS['api']['fs.gdrive']['drives'][$driveID];

		include_once('inc.html.php');
		$url = 'https://www.googleapis.com/drive/v2/files?maxResults=100';
		$header = array('Authorization'=>'Bearer '.$drive['token']);
		$data = array('header'=>$header);
		$data = html_petition($url,$data);
		$files = json_decode($data['pageContent'],1);
		if(isset($files['error']['code']) && $files['error']['code'] == 401){$r = fs_gdrive_token_refresh($driveID);$args = func_get_args();return call_user_func_array(__FUNCTION__,$args);}

		$drivesFolder = $GLOBALS['userPath'].'drives/';
		if(!file_exists($drivesFolder)){$oldmask = umask(0);$r = @mkdir($drivesFolder,0777);umask($oldmask);}
		$folderList = array();
		include_once('inc.sqlite3.php');
		if(isset($files['items'])){
			$shouldClose = false;if(!$db){$db = sqlite3_open($drive['db.file']);sqlite3_exec('BEGIN',$db);$shouldClose = true;}
			foreach($files['items'] as $file){
				$fileRoute = 'gdrive:'.$driveID.':/';
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
exit;		
	}

	function fs_gdrive_list($fileRoute = ''){
		if(strpos($fileRoute,'gdrive:') !== 0 || !($s = strpos($fileRoute,':',7))){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		$driveID = substr($fileRoute,7,$s-7);
		$driveFile = $GLOBALS['userPath'].'drives/gdrive.'.$driveID.'.db';

		include_once('inc.sqlite3.php');
		$params = array('indexBy'=>'fileHash','db.file'=>$driveFile);
		$fileOBs = sqlite3_getWhere($GLOBALS['api']['fs.gdrive']['table.files'],'(fileRoute = \''.$fileRoute.'\')',$params);

//FIXME: en fileDateM poner la fecha de la base de datos
		$folder = array('fileName'=>'gdrive.'.$driveID,'fileRoute'=>'gdrive.'.$driveID.':/',
			'fileMime'=>'drive','fileSize'=>0,'fileDateM'=>0);
		return array('folder'=>$folder,'files'=>$fileOBs);
	}

	function fs_gdrive_token_refresh($driveID = ''){
		if(!isset($GLOBALS['api']['fs.gdrive']['drives'][$driveID])){$GLOBALS['api']['fs.gdrive']['drives'][$driveID] = fs_gdrive_data_load($driveID);}
		$drive = $GLOBALS['api']['fs.gdrive']['drives'][$driveID];

		include_once('inc.html.php');
		/* Para refrescar el token */
		$url = 'https://accounts.google.com/o/oauth2/token';
		$post = array('client_id'=>$drive['client'],'client_secret'=>$drive['secret'],'refresh_token'=>$drive['refresh_token'],'grant_type'=>'refresh_token');
		$data = array('post'=>$post);
		$data = html_petition($url,$data);
		$json = json_decode($data['pageContent'],1);
		if(!isset($json['access_token'])){print_r($data);exit;}
		include_once('api.drives.php');
		$r = drives_data_save('gdrive:'.$driveID,'token',$json['access_token']);
		$GLOBALS['api']['fs.gdrive']['drives'][$driveID]['token'] = $json['access_token'];
		return true;
	}
?>
