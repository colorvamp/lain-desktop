<?php
	function fs_native_rename($fileOB,$fileName = ''){
		$fileBasePath = fs_helper_parsePath($fileOB['fileRoute']);
		if($fileBasePath === false){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		$filePath = fs_helper_parsePath($fileOB['fileRoute'].$fileOB['fileRoute']);
		if($filePath === false){return fs_native_create($fileName,$fileOB['fileRoute'].$fileOB['fileName'].'/');}

		$fileName = preg_replace('/[\/]*/','',$fileName);
		if(empty($fileName)){$fileName = uniqid();}
		if(!is_dir($filePath)){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		$fileRoute = ($GLOBALS['api']['fs']['serverCage']) ? 'native:drive:'.substr($filePath,strlen(realpath($GLOBALS['api']['fs']['root']))) : $filePath;

// Probar de aquí para abajo
		$return = array('add'=>array(),'remove'=>array());
		$sourceFile = $filePath.$fileOB['fileName'];
		$targetFile = $filePath.$name;
		if(!file_exists($sourceFile)){do{
			$c = false;switch($fileOB['fileMime']){
				case 'folder':$oldmask = umask(0);$r = @mkdir($sourceFile,0777,1);umask($oldmask);$c = true;break;
			}
			if($c){continue;}
			return array('errorDescription'=>'FILE_NOT_EXISTS','file'=>__FILE__,'line'=>__LINE__);
		}while(false);}
//echo $sourceFile.PHP_EOL;
//echo $targetFile.PHP_EOL;

		if($sourceFile != $targetFile){
			$r = @rename($sourceFile,$targetFile);
			if(!$r){return array('errorDescription'=>'UNKNOWN_ERROR_WHILE_MOVING'.' '.$sourceFile.' to '.$targetFile,'file'=>__FILE__,'line'=>__LINE__);}
		}
		$finfo = finfo_open(FILEINFO_MIME,'../db/magic.mgc');
		$return['remove'][$fileRoute][] = $fileOB['fileName'];
		$return['add'][$fileRoute][] = fs_file_getInfo($name,$filePath,$fileRoute,$finfo);
		finfo_close($finfo);

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
		//FIXME; esto se hace con una api
		$f = array('fileName'=>$fileName,'fileRoute'=>'native:drive:'.$fileRoute,'fileMime'=>'folder','fileDateM'=>$fileData['mtime']);
		return array('add'=>array($fileRoute=>array($f)));
	}
?>
