<?php
	function fs_native_rename($file,$name){
		$name = preg_replace('/[\/]*/','',$name);
//FIXME: while(!file_exists())
		if(!isset($file['fileName']) || empty($file['fileName'])){$file['fileName'] = uniqid();}
		if(!isset($file['filePath']) || empty($file['filePath'])){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		$filePath = $file['filePath'];if(strpos($filePath,'native:drive:') === 0){$filePath = substr($filePath,13);}
		$filePath = fs_helper_parsePath($filePath);
		if($filePath === false){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		if(!is_dir($filePath)){return array('errorDescription'=>'PATH_IS_NOT_DIRECTORY','file'=>__FILE__,'line'=>__LINE__);}
		$fileRoute = ($GLOBALS['api']['fs']['serverCage']) ? 'native:drive:'.substr($filePath,strlen(realpath($GLOBALS['api']['fs']['root']))) : $filePath;

		$return = array('add'=>array(),'remove'=>array());
		$sourceFile = $filePath.$file['fileName'];
		$targetFile = $filePath.$name;
		if(!file_exists($sourceFile)){do{
			$c = false;switch($file['fileMime']){
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
		$return['remove'][$fileRoute][] = $file['fileName'];
		$return['add'][$fileRoute][] = fs_file_getInfo($name,$filePath,$fileRoute,$finfo);
		finfo_close($finfo);

		return $return;
	}
?>
