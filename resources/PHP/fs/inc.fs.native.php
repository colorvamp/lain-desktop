<?php
	function fs_native_route_validate($route){
		if(strpos($route,'native:drive:') === 0){$route = substr($route,13);}
		$driveDir = $GLOBALS['api']['fs']['root'];if(!file_exists($driveDir)){$oldmask = umask(0);$r = @mkdir($driveDir,0777,1);umask($oldmask);}
		if(!($path = realpath($driveDir.$route))){return false;}
		if(is_dir($path) && substr($path,-1,1)){$path .= '/';}
		if(!$GLOBALS['api']['fs']['serverCage']){return $path;}
		/* Now that we know the file exists, we must assure is inside the user drive */
		$driveDir = realpath(getcwd().'/'.$driveDir);
		if(substr($path,0,strlen($driveDir)) != $driveDir){return false;}
		return $path;
	}
	function fs_native_route_get($path){
		return ($GLOBALS['api']['fs']['serverCage']) ? 'native:drive:'.substr($path,strlen(realpath($GLOBALS['api']['fs']['root']))) : $path;
	}

	function fs_native_move($fileOBs,$fileRoute){
		$destPath = fs_native_route_validate($fileRoute);
		if($destPath === false || !is_dir($destPath)){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		$fileBaseRoute = fs_native_route_get($destPath);

		$fileOBs_byRoute = array();foreach($fileOBs as $fileOB){$fileOBs_byRoute[$fileOB['fileRoute']][] = $fileOB;}
		$finfo = finfo_open(FILEINFO_MIME,$GLOBALS['api']['fs']['file.mime']);
		$return = array('add'=>array(),'remove'=>array());
		foreach($fileOBs_byRoute as $fileRoute=>$fileOBs){
			$protocol = substr($fileRoute,0,6);$s = strpos($fileRoute,':',7);
			switch($protocol){
				case 'native':
					$fileBasePath = fs_native_route_validate($fileRoute);
					if($fileBasePath === false || !is_dir($fileBasePath)){continue 2;}
					$oldmask = umask(0);
					foreach($fileOBs as $fileOB){
						$fileSource = $fileBasePath.$fileOB['fileName'];if(!file_exists($fileSource)){continue;}
						$fileTarget = $destPath.$fileOB['fileName'];if(file_exists($fileTarget)){continue;}
						$r = @rename($fileSource,$fileTarget);
						if(!$r){return array('errorDescription'=>'UNKNOWN_ERROR_WHILE_MOVING'.' '.$fileSource.' to '.$fileTarget,'file'=>__FILE__,'line'=>__LINE__);}
$return['add'][$fileBaseRoute][] = fs_file_getInfo($fileOB['fileName'],$destPath,$fileBaseRoute,$finfo);
						$return['remove'][$fileOB['fileRoute']][] = $fileOB['fileName'];
					}
					umask($oldmask);
					break;
			}
		}
		finfo_close($finfo);

		return $return;
	}

	function fs_native_rename($fileOB,$fileName = ''){
		$fileBasePath = fs_native_route_validate($fileOB['fileRoute']);
		if($fileBasePath === false){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		$filePath = fs_native_route_validate($fileOB['fileRoute'].$fileOB['fileName']);
		if(empty($fileOB['fileName']) || $filePath === false){return fs_native_create($fileName,$fileOB['fileRoute'].$fileOB['fileName'].'/');}

		$fileName = preg_replace('/[\/]*/','',$fileName);
		if(empty($fileName)){$fileName = uniqid();}
		if(!file_exists($filePath)){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		$fileBaseRoute = fs_native_route_get(dirname($filePath).'/');

		$return = array('add'=>array(),'remove'=>array());
		$sourceFile = $fileBasePath.$fileOB['fileName'];
		$targetFile = $fileBasePath.$fileName;
		if(file_exists($targetFile)){return array('errorDescription'=>'ALREADY_EXISTS','file'=>__FILE__,'line'=>__LINE__);}
		if($sourceFile != $targetFile){
			$oldmask = umask(0);$r = @rename($sourceFile,$targetFile);umask($oldmask);
			if(!$r){return array('errorDescription'=>'UNKNOWN_ERROR_WHILE_MOVING'.' '.$sourceFile.' to '.$targetFile,'file'=>__FILE__,'line'=>__LINE__);}
			$finfo = finfo_open(FILEINFO_MIME,'../db/magic.mgc');
			$return['remove'][$fileBaseRoute][] = $fileOB['fileName'];
$return['add'][$fileBaseRoute][] = fs_file_getInfo($fileName,$fileBasePath,$fileBaseRoute,$finfo);
			finfo_close($finfo);
		}

		return $return;
	}

//FIXME: los parámetros están mal
	function fs_native_create($fileName,$path = ''){
		if(strpos($path,'native:drive:') === 0){$path = substr($path,13);}
		$path = fs_helper_parsePath($path);
		if($path === false){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		if(!is_dir($path)){return array('errorDescription'=>'PATH_IS_NOT_DIRECTORY','file'=>__FILE__,'line'=>__LINE__);}
		$fileRoute = ($GLOBALS['api']['fs']['serverCage']) ? 'native:drive:'.substr($path,strlen(realpath($GLOBALS['api']['fs']['root']))) : $path;

		$fileName = str_replace(array('/'),'',$fileName);
		$targetFolder = $path.$fileName;
		if(empty($fileName)){return array('errorDescription'=>'FOLDER_NAME_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		if(file_exists($targetFolder)){return array('errorDescription'=>'FOLDER_ALREADY_EXISTS','file'=>__FILE__,'line'=>__LINE__);}
		$oldmask = umask(0);$r = @mkdir($targetFolder,0777,1);umask($oldmask);
		if(!$r){return array('errorDescription'=>'MKDIR_ERROR','file'=>__FILE__,'line'=>__LINE__);}

		$fileData = stat($targetFolder);
		//FIXME; esto se hace con una api -> fs_file_getInfo
		$f = array('fileName'=>$fileName,'fileRoute'=>'native:drive:'.$fileRoute,'fileMime'=>'folder','fileDateM'=>$fileData['mtime']);
		return array('add'=>array($fileRoute=>array($f)));
	}
?>
