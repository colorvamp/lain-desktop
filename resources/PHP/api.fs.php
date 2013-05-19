<?php
	$GLOBALS['api']['fs'] = array('root'=>$GLOBALS['userPath'].'drive/','serverCage'=>true);

	if(isset($_POST['command'])){
		$command = $_POST['command'];unset($_POST['command']);
		header('Content-type: text/json');
		switch($command){
			case 'folder_list':$r = fs_folder_list(base64_decode($_POST['fileRoute']));echo json_encode($r);break;
			case 'folder_create':$r = fs_folder_create(base64_decode($_POST['fileName']),base64_decode($_POST['fileRoute']));echo json_encode($r);break;
		}
		exit;
	}

	function fs_helper_parsePath($path){
		$driveDir = $GLOBALS['api']['fs']['root'];
		if(!file_exists($driveDir)){$oldmask = umask(0);$r = @mkdir($driveDir,0777,1);umask($oldmask);}
		$path = realpath($driveDir.$path);
		if($GLOBALS['api']['fs']['serverCage']){
			$baseDir = realpath(getcwd().'/'.$driveDir);
			if(substr($path,0,strlen($baseDir)) != $baseDir){return false;}
		}
		return $path.'/';
	}

	function fs_folder_list($path = ''){
		if($path == 'trash:///'){$path = '.trash/';}
		if(strpos($path,'native:drive:') === 0){$path = substr($path,13);}
		$path = fs_helper_parsePath($path);
		if($path === false){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		if(!is_dir($path)){return array('errorDescription'=>'PATH_IS_NOT_DIRECTORY','file'=>__FILE__,'line'=>__LINE__);}
		$fileRoute = ($GLOBALS['api']['fs']['serverCage']) ? substr($path,0,strlen($GLOBALS['api']['fs']['serverCage'])) : $path;

		$files = $folders = array();
		if($handle = opendir($path)){
			$finfo = finfo_open(FILEINFO_MIME,'../db/magic.mgc');
			while(false !== ($file = readdir($handle))){if($file[0] == '.'){continue;}
				//echo $file.print_r(stat($driveDir.$file)).'\n';
				$fileData = stat($path.$file);
				if(is_dir($path.$file)){$folders[] = array('fileName'=>$file,'fileRoute'=>'native:drive:'.$fileRoute,'fileMime'=>'folder','fileDateM'=>$fileData['mtime']);continue;}
				list($fileMimeType) = explode('; ',finfo_file($finfo,$path.$file));
				$files[] = array('fileName'=>$file,'fileRoute'=>'native:drive:'.$fileRoute,'fileMime'=>$fileMimeType,'fileSize'=>$fileData['size'],'fileDateM'=>$fileData['mtime']);
			}
			finfo_close($finfo);
			closedir($handle);
		}

		sort($files);sort($folders);
		return array('folders'=>$folders,'files'=>$files);
	}
	function fs_folder_create($fileName,$path = ''){
		if(strpos($path,'native:drive:') === 0){$path = substr($path,13);}
		$path = fs_helper_parsePath($path);
		if($path === false){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		if(!is_dir($path)){return array('errorDescription'=>'PATH_IS_NOT_DIRECTORY','file'=>__FILE__,'line'=>__LINE__);}
		$fileRoute = ($GLOBALS['api']['fs']['serverCage']) ? substr($path,0,strlen($GLOBALS['api']['fs']['serverCage'])) : $path;

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
?>
