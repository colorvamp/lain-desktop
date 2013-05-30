<?php
	$GLOBALS['tables']['trash'] = array('_fileHash_'=>'TEXT NOT NULL','fileRoute'=>'TEXT NOT NULL','fileName'=>'TEXT NOT NULL',
	'fileMime'=>'TEXT NOT NULL','fileSize'=>'INTEGER NOT NULL','filePermissions'=>'TEXT NOT NULL','fileChilds'=>'INTEGER NOT NULL','fileOwner'=>'TEXT NOT NULL','fileGroup'=>'TEXT NOT NULL',
	'fileDate'=>'TEXT NOT NULL','fileTime'=>'TEXT NOT NULL');
	$GLOBALS['api']['fs'] = array('root'=>$GLOBALS['userPath'].'drive/','trash'=>$GLOBALS['userPath'].'trash/','tmp'=>$GLOBALS['userPath'].'tmp/','trashdb'=>$GLOBALS['userPath'].'trash.db','serverCage'=>true);

	if(isset($_POST['command'])){
		$command = $_POST['command'];unset($_POST['command']);
		header('Content-type: text/json');
		switch($command){
//FIXME: esto debe desaparecer
			case 'folder_create':$r = fs_folder_create(base64_decode($_POST['fileName']),base64_decode($_POST['fileRoute']));echo json_encode($r);break;
			case 'transfer_unify':$r = fs_transfer_fragment($_POST['base64string_sum']);echo json_encode($r);break;
		}
		exit;
	}

	function fs_helper_parsePath($path){
		$driveDir = $GLOBALS['api']['fs']['root'];
		if(!file_exists($driveDir)){$oldmask = umask(0);$r = @mkdir($driveDir,0777,1);umask($oldmask);}
		$path = realpath($driveDir.$path);
		if($GLOBALS['api']['fs']['serverCage']){$baseDir = realpath(getcwd().'/'.$driveDir);if(substr($path,0,strlen($baseDir)) != $baseDir){return false;}}
		return $path.'/';
	}

	function fs_helper_parsePath_trash($path){
		$driveDir = $GLOBALS['api']['fs']['trash'];
		if(!file_exists($driveDir)){$oldmask = umask(0);$r = @mkdir($driveDir,0777,1);umask($oldmask);}
		$path = realpath($driveDir.$path);
		if($GLOBALS['api']['fs']['serverCage']){$baseDir = realpath(getcwd().'/'.$driveDir);if(substr($path,0,strlen($baseDir)) != $baseDir){return false;}}
		return $path.'/';
	}

	function fs_folder_list($fileRoute = ''){
		if(strpos($fileRoute,'native:trash:') === 0){return fs_trash_list($fileRoute);}
		if(strpos($fileRoute,'native:drive:') === 0){$fileRoute = substr($fileRoute,13);}
		$filePath = fs_helper_parsePath($fileRoute);

		if($filePath === false){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		if(!is_dir($filePath)){return array('errorDescription'=>'PATH_IS_NOT_DIRECTORY','file'=>__FILE__,'line'=>__LINE__);}
		$fileRoute = ($GLOBALS['api']['fs']['serverCage']) ? substr($fileRoute,strlen(realpath($GLOBALS['api']['fs']['root']))) : $fileRoute;

		$files = $folders = array();
		if($handle = opendir($filePath)){
			$finfo = finfo_open(FILEINFO_MIME,'../db/magic.mgc');
			while(false !== ($file = readdir($handle))){if($file[0] == '.'){continue;}
				//echo $file.print_r(stat($driveDir.$file)).'\n';
				$fileData = stat($filePath.$file);
				if(is_dir($filePath.$file)){$folders[] = array('fileName'=>$file,'fileRoute'=>'native:drive:'.$fileRoute,'fileMime'=>'folder','fileDateM'=>$fileData['mtime']);continue;}
				list($fileMimeType) = explode('; ',finfo_file($finfo,$filePath.$file));
				$files[] = array('fileName'=>$file,'fileRoute'=>'native:drive:'.$fileRoute,'fileMime'=>$fileMimeType,'fileSize'=>$fileData['size'],'fileDateM'=>$fileData['mtime']);
			}
			finfo_close($finfo);
			closedir($handle);
		}
//print_r($folders);exit;
		sort($files);sort($folders);
		return array('folders'=>$folders,'files'=>$files);
	}
	function fs_folder_create($fileName,$path = ''){
		if(strpos($path,'native:drive:') === 0){$path = substr($path,13);}
		$path = fs_helper_parsePath($path);
		if($path === false){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		if(!is_dir($path)){return array('errorDescription'=>'PATH_IS_NOT_DIRECTORY','file'=>__FILE__,'line'=>__LINE__);}
		$fileRoute = ($GLOBALS['api']['fs']['serverCage']) ? substr($path,strlen(realpath($GLOBALS['api']['fs']['root']))) : $path;

		$fileName = str_replace(array('/'),'',$fileName);
		$targetFolder = $path.$fileName;
		if(empty($fileName)){return array('errorDescription'=>'FOLDER_NAME_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		if(file_exists($targetFolder)){return array('errorDescription'=>'FOLDER_ALREADY_EXISTS','file'=>__FILE__,'line'=>__LINE__);}
		$oldmask = umask(0);$r = @mkdir($targetFolder,0777,1);umask($oldmask);
		if(!$r){return array('errorDescription'=>'MKDIR_ERROR','file'=>__FILE__,'line'=>__LINE__);}

		$fileData = stat($targetFolder);
		$f = array('fileName'=>$fileName,'fileRoute'=>'native:drive:'.$fileRoute,'fileMime'=>'folder','fileDateM'=>$fileData['mtime']);
		return $f;
	}

	function fs_file_move($files,$destRoute){
		/* $files could be json_encoded */
		if(is_string($files)){$files = json_decode($files,1);if($files !== NULL){
			//FIXME:
		}}

		if(strpos($destRoute,'native:drive:') === 0){$destRoute = substr($destRoute,13);}
		$destRoute = fs_helper_parsePath($destRoute);
		if($destRoute === false){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		if(!is_dir($destRoute)){return array('errorDescription'=>'PATH_IS_NOT_DIRECTORY','file'=>__FILE__,'line'=>__LINE__);}

		$fileRoutes = array();
		foreach($files as $file){$fileRoutes[$file['fileRoute']][] = $file;}
		foreach($fileRoutes as $fileRoute=>$files){
			if(strpos($fileRoute,'native:drive:') === 0){$fileRoute = substr($fileRoute,13);}
			$fileRoute = fs_helper_parsePath($fileRoute);
			if($fileRoute === false){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
			if(!is_dir($fileRoute)){return array('errorDescription'=>'PATH_IS_NOT_DIRECTORY','file'=>__FILE__,'line'=>__LINE__);}
			foreach($files as $file){
				$sourceFile = $fileRoute.$file['fileName'];
				$targetFile = $destRoute.$file['fileName'];
				$r = @rename($sourceFile,$targetFile);
				if(!$r){return array('errorDescription'=>'UNKNOWN_ERROR_WHILE_MOVING'.' '.$sourceFile.' to '.$targetFile,'file'=>__FILE__,'line'=>__LINE__);}
			}
		}

		return true;
	}

	function fs_file_trash($files,$db = false){
		/* $files could be json_encoded */
		if(is_string($files)){$files = json_decode($files,1);if($files !== NULL){
			//FIXME:
		}}
		if(!file_exists($GLOBALS['api']['fs']['trash'])){$oldmask = umask(0);$r = @mkdir($GLOBALS['api']['fs']['trash'],0777,1);umask($oldmask);}

		$fileRoutes = array();
		foreach($files as $file){$fileRoutes[$file['fileRoute']][] = $file;}

		$shouldClose = false;if(!$db){$db = sqlite3_open($GLOBALS['api']['fs']['trashdb']);sqlite3_exec('BEGIN',$db);$shouldClose = true;}
		$finfo = finfo_open(FILEINFO_MIME,'../db/magic.mgc');
		foreach($fileRoutes as $fileRoute=>$files){
			if(strpos($fileRoute,'native:drive:') === 0){$fileRoute = substr($fileRoute,13);}
			$fileRoute = fs_helper_parsePath($fileRoute);
			if($fileRoute === false){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
			if(!is_dir($fileRoute)){return array('errorDescription'=>'PATH_IS_NOT_DIRECTORY','file'=>__FILE__,'line'=>__LINE__);}
			foreach($files as $file){
				$sourceFile = $fileRoute.$file['fileName'];
				do{$fileHash = uniqid();$targetFile = $GLOBALS['api']['fs']['trash'].$fileHash;}while(false);
				$r = rename($sourceFile,$targetFile);
				if(!$r){return array('errorDescription'=>'UNKNOWN_ERROR_WHILE_MOVING'.' '.$sourceFile.' to '.$targetFile,'file'=>__FILE__,'line'=>__LINE__);}

				if(is_dir($targetFile)){$fileMimeType = 'folder';}
				else{list($fileMimeType) = explode('; ',finfo_file($finfo,$targetFile));}

				$arr = array('fileHash'=>$fileHash,'fileRoute'=>$fileRoute,'fileMime'=>$fileMimeType,'fileSize'=>11,'filePermissions'=>'a','fileChilds'=>'aa','fileOwner'=>'aa','fileGroup'=>'aa',
				'fileDate'=>'11','fileTime'=>'11','fileName'=>$file['fileName']);
				$r = sqlite3_insertIntoTable('trash',$arr,$db);
				if(!$r['OK']){if($shouldClose){sqlite3_close($db);}return array('errorCode'=>$r['errno'],'errorDescription'=>$r['error'],'file'=>__FILE__,'line'=>__LINE__);}
			}
		}
		finfo_close($finfo);
		if($shouldClose){$r = sqlite3_exec('COMMIT;',$db);$GLOBALS['DB_LAST_ERRNO'] = $db->lastErrorCode();$GLOBALS['DB_LAST_ERROR'] = $db->lastErrorMsg();if(!$r){sqlite3_close($db);return array('OK'=>false,'errno'=>$GLOBALS['DB_LAST_ERRNO'],'error'=>$GLOBALS['DB_LAST_ERROR'],'file'=>__FILE__,'line'=>__LINE__);}sqlite3_close($db);}

		return true;
	}

	function fs_file_stream($fileName,$fileRoute){
		if(strpos($fileRoute,'native:drive:') === 0){$fileRoute = substr($fileRoute,13);}
		$fileRoute = fs_helper_parsePath($fileRoute);
		if($fileRoute === false){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		if(!is_dir($fileRoute)){return array('errorDescription'=>'PATH_IS_NOT_DIRECTORY','file'=>__FILE__,'line'=>__LINE__);}
		$targetFile = $fileRoute.$fileName;
		if(!file_exists($targetFile)){return array('errorDescription'=>'FILE_NOT_EXISTS','file'=>__FILE__,'line'=>__LINE__);}

		//FIXME: falta el mimetype
		readfile($targetFile);exit;
	}

	function fs_transfer_fragment($fileName,$filePath,$base64string_sum,$base64string_len,$fragment_string,$fragment_num,$fragment_sum){
		$tmpPath = $GLOBALS['api']['fs']['tmp'];
		$tmpPath = $tmpPath.$base64string_sum.'/';if(!file_exists($tmpPath)){$oldmask = umask(0);$r = @mkdir($tmpPath,0777,1);umask($oldmask);}
		if(!file_exists($tmpPath)){return array('errorCode'=>3,'errorDescription'=>'NO_TMP_FOLDER','file'=>__FILE__,'line'=>__LINE__);}

		$sourceFile = $tmpPath.'source';
		if(!file_exists($sourceFile)){
			/* Check filePath */
			if(strpos($filePath,'native:drive:') === 0){$filePath = substr($filePath,13);}
			$filePath = fs_helper_parsePath($filePath);
			if($filePath === false){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
			if(!is_dir($filePath)){return array('errorDescription'=>'PATH_IS_NOT_DIRECTORY','file'=>__FILE__,'line'=>__LINE__);}
			$fileName = str_replace(array('/'),'',$fileName);
			if(empty($fileName)){return array('errorDescription'=>'FILE_NAME_ERROR','file'=>__FILE__,'line'=>__LINE__);}
			$targetFile = $filePath.$fileName;
			if(file_exists($targetFile)){return array('errorDescription'=>'FILE_ALREADY_EXISTS','file'=>__FILE__,'line'=>__LINE__);}
			$r = @file_put_contents($sourceFile,$targetFile,LOCK_EX);
			if(!$r){return array('errorDescription'=>'NOT_WRITABLE','file'=>__FILE__,'line'=>__LINE__);}
		}

		$base64string_sum = preg_replace('/[^a-zA-Z0-9]*/','',$base64string_sum);
		if(strlen($base64string_sum) != 32){return array('errorDescription'=>'MD5_SUM_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		/* Es posible que la llamada sea solo de cortesía, es decir, que el fichero ya esté subida pero se haya 
		 * cortado el procesamiento de dicho fichero */
		$totalSize = 0;$files = array();if($handle = opendir($tmpPath)){while(false !== ($file = readdir($handle))){if($file[0]=='0'){$files[] = $file;$totalSize += filesize($tmpPath.$file);}}closedir($handle);}
		if($totalSize == $base64string_len){return fs_transfer_unify($base64string_sum);}

		$fragment_num = preg_replace('/[^0-9]*/','',$fragment_num);
		$fragmentName = str_pad($fragment_num,10,'0',STR_PAD_LEFT);
		if(file_exists($tmpPath.$fragmentName)){
//FIXME: imaginemos que solo faltase unificar
			//FIXME: devolver los fragmentos que ya existen
			return array('errorDescription'=>'FRAGMENT_ALREADY_EXISTS','file'=>__FILE__,'line'=>__LINE__);
		}

		/* Comprobaciones de la string que debemos almacenar */
		$fragment_string = str_replace(' ','+',$fragment_string);
		if(md5($fragment_string) != $fragment_sum){return array('errorDescription'=>'FRAGMENT_CORRUPT','file'=>__FILE__,'line'=>__LINE__);}

		/* Si lleva una cabecera de imágen debemos eliminarla */
		if(substr($fragment_string,0,11) == 'data:image/'){$comma = strpos($fragment_string,',');$imgType = substr($fragment_string,11,$comma-7-11);$fragment_string = substr($fragment_string,$comma+1);}
		$fp = fopen($tmpPath.$fragmentName,'w');fwrite($fp,$fragment_string);fclose($fp);

		/* Comprobamos si debemos unificar, tenemos en totalsize el valor total de los ficharos antes
		 * de salvar este último fragmento, solo necesitamos sumarle el tamaño */
		$fragmentSize = filesize($tmpPath.$fragmentName);
		$totalSize += $fragmentSize;
		if($totalSize == $base64string_len){return fs_transfer_unify($base64string_sum);}

		return array('fragmentSize'=>$fragmentSize,'totalSize'=>$totalSize);
	}
	function fs_transfer_unify($base64string_sum){
		$tmpPath = $GLOBALS['api']['fs']['tmp'];
		$tmpPath = $tmpPath.$base64string_sum.'/';
		if(!file_exists($tmpPath)){return array('errorDescription'=>'NO_TMP_FOLDER','file'=>__FILE__,'line'=>__LINE__);}

		$files = array();if($handle = opendir($tmpPath)){while(false !== ($file = readdir($handle))){if($file[0]=='0'){$files[] = $file;}}closedir($handle);}
		sort($files);$fp = fopen($tmpPath.'FILE_base64','w');foreach($files as $file){fwrite($fp,file_get_contents($tmpPath.$file));unlink($tmpPath.$file);}fclose($fp);
		if(md5_file($tmpPath.'FILE_base64') != $base64string_sum){return array('errorDescription'=>'FILE_CORRUPT'.md5_file($tmpPath.'FILE_base64'),'file'=>__FILE__,'line'=>__LINE__);}
		$totalSize = filesize($tmpPath.'FILE_base64');

		$chunkSize = 1024;
//FIXME: algunos umasks
		$src = fopen($tmpPath.'FILE_base64','rb');$dst = fopen($tmpPath.'FILE_binary','wb');
		while(!feof($src)){fwrite($dst,base64_decode(fread($src,$chunkSize)));}
		fclose($dst);fclose($src);
		unlink($tmpPath.'FILE_base64');

		/* INI-Movemos la imagen */
		$sourceFile = $tmpPath.'source';
		$destPath = file_get_contents($sourceFile);
		$r = rename($tmpPath.'FILE_binary',$destPath);
		/* ahora debemos eliminar la ruta temporal $tmpPath */
		$r = fs_helper_removeDir($tmpPath,true);
		/* END-Movemos la imagen */

		return array('totalSize'=>$totalSize);
	}

	function fs_file_stat($path){
return false;
		$s = stat($path);

		$realDrivePath = realpath($GLOBALS['drivePath']);
		$relativeDir = strpos($driveDir,$realDrivePath);
		$relativeDir = substr($driveDir,$relativeDir+strlen($realDrivePath));
		$fileHash = sha1_file($driveDir.$fileName);
		/* From 16384(4000) to 16895(41ff) */
		if($s['mode'] > 16383 && $s['mode'] < 16896){$fileIsDir = 1;$fileMime = 'folder';}
		else{
			$fileIsDir = 0;
			/* MimeType */
			$finfo = finfo_open(FILEINFO_MIME,'magic.mgc');
			$fileMime = finfo_file($finfo,$driveDir.$fileName);
			finfo_close($finfo);
		}
		$fileLink = 'users/'.$GLOBALS['userAlias'].'/drive'.$relativeDir.$fileName.($fileIsDir == 1 ? '/' : '');

		$f = array('fileName'=>$fileName,'fileRoute'=>$relativeDir,'fileMime'=>$fileMime,'fileSize'=>$s['size'],'fileDate'=>date('Y-m-d',$s['ctime']),'fileTime'=>date('H:i:s',$s['ctime']),
			'fileDateM'=>date('Y-m-d',$s['mtime']),'fileTimeM'=>date('H:i:s',$s['mtime']),'fileIsDir'=>$fileIsDir,'fileHash'=>'sha1:'.$fileHash,'fileLink'=>$fileLink,'fileIface'=>'native:drive');

		$a = array('errorCode'=>0,'data'=>$f);
		return $a;
	}

	function fs_helper_removeDir($path,$avoidCheck=false){
		if(!$avoidCheck){$path = preg_replace('/\/$/','/',$path);if(!file_exists($path) || !is_dir($path)){return;}}
		if($handle = opendir($path)){while(false !== ($file = readdir($handle))){
			if(in_array($file,array('.','..'))){continue;}
			if(is_dir($path.$file)){fs_helper_removeDir($path.$file.'/',true);continue;}
			unlink($path.$file);
		}closedir($handle);}
		rmdir($path);
		return true;
	}

	function fs_trash_list($fileRoute = false){
		if(strpos($fileRoute,'native:trash:') !== 0){return fs_folder_list($fileRoute);}
		$fileRoute = substr($fileRoute,13);
		$p = strpos($fileRoute,'/',1);
		/* It can be a hashed folder or just a filename */
		$fileHash = ($p !== false) ? substr($fileRoute,0,$p) : $fileRoute;
		if(empty($fileHash) || $fileHash == '/'){
			$fileRows = fs_trash_getWhere(1);
			$files = $folders = array();
			foreach($fileRows as $fileRow){
				//FIXME: fileDateM
				$files[] = array('fileName'=>$fileRow['fileName'],'fileAlias'=>$fileRow['fileHash'],'fileRoute'=>'native:trash:/','fileMime'=>$fileRow['fileMime'],'fileSize'=>$fileRow['fileSize'],'fileDateM'=>'');
			}
			sort($files);sort($folders);
			return array('folders'=>$folders,'files'=>$files);
		}


		if($fileHash[0] == '/'){$fileHash = substr($fileHash,1);}
		$fileRow = fs_trash_getSingle('(fileHash = \''.$fileHash.'\')');
		if(!$fileRow){return array('errorDescription'=>'FILE_NOT_EXISTS','file'=>__FILE__,'line'=>__LINE__);}
		$filePath = fs_helper_parsePath_trash($fileRoute);

		if($filePath === false){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		if(!is_dir($filePath)){return array('errorDescription'=>'PATH_IS_NOT_DIRECTORY','file'=>__FILE__,'line'=>__LINE__);}
		$fileRoute = ($GLOBALS['api']['fs']['serverCage']) ? substr($filePath,strlen(realpath($GLOBALS['api']['fs']['root']))) : $filePath;

		$files = $folders = array();
		if($handle = opendir($filePath)){
			$finfo = finfo_open(FILEINFO_MIME,'../db/magic.mgc');
			while(false !== ($file = readdir($handle))){if($file[0] == '.'){continue;}
				$fileData = stat($filePath.$file);
				if(is_dir($filePath.$file)){$folders[] = array('fileName'=>$file,'fileRoute'=>'native:trash:'.$fileRoute,'fileMime'=>'folder','fileDateM'=>$fileData['mtime']);continue;}
				list($fileMimeType) = explode('; ',finfo_file($finfo,$filePath.$file));
				$files[] = array('fileName'=>$file,'fileRoute'=>'native:trash:'.$fileRoute,'fileMime'=>$fileMimeType,'fileSize'=>$fileData['size'],'fileDateM'=>$fileData['mtime']);
			}
			finfo_close($finfo);
			closedir($handle);
		}

		sort($files);sort($folders);
		return array('folders'=>$folders,'files'=>$files);
	}

	function fs_trash_getSingle($whereClause = false,$params = array()){
		include_once('inc.sqlite3.php');
		$shouldClose = false;if(!isset($params['db']) || !$params['db']){$params['db'] = sqlite3_open($GLOBALS['api']['fs']['trashdb'],SQLITE3_OPEN_READONLY);$shouldClose = true;}
		if(!isset($params['indexBy'])){$params['indexBy'] = 'fileHash';}
		$r = sqlite3_getSingle('trash',$whereClause,$params);
		if($shouldClose){sqlite3_close($params['db']);}
		return $r;
	}
	function fs_trash_getWhere($whereClause = false,$params = array()){
		include_once('inc.sqlite3.php');
		$shouldClose = false;if(!isset($params['db']) || !$params['db']){$params['db'] = sqlite3_open($GLOBALS['api']['fs']['trashdb'],SQLITE3_OPEN_READONLY);$shouldClose = true;}
		if(!isset($params['indexBy'])){$params['indexBy'] = 'fileHash';}
		$r = sqlite3_getWhere('trash',$whereClause,$params);
		if($shouldClose){sqlite3_close($params['db']);}
		return $r;
	}
?>
