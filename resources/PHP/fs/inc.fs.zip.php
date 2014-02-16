<?php
	function fs_zip_getInfo($zip,$index,$filePath,$finfo = false){
		$zipFileRoute = fs_zip_getRelativeRoute_byIndex($zip,$index);
		$zipFileName = $zip->getNameIndex($index);
		$zipFileStat = $zip->statIndex($index);
		$zipFilePathInfo = pathinfo($zipFileRoute);
		$zipFileMimeType = '';if($finfo){
			//list($zipFileMimeType) = explode('; ',finfo_file($finfo,'zip://'.$filePath.'#'.$zipFileRoute));
			$fp = $zip->getStream($zipFileName);
			if($fp){$bytes = fread($fp,10);fclose($fp);list($zipFileMimeType) = explode('; ',finfo_buffer($finfo,$bytes));}
		}
		$fileRoute = ($GLOBALS['api']['fs']['serverCage']) ? 'ziparc:drive:'.substr($filePath,strlen(realpath($GLOBALS['api']['fs']['root']))) : $filePath;
		return array('fileName'=>$zipFilePathInfo['basename'],'fileRoute'=>$fileRoute.'/'.(($zipFilePathInfo['dirname'] == '.' || $zipFilePathInfo['dirname'] == '/') ? '' : $zipFilePathInfo['dirname'].'/'),'fileMime'=>$zipFileMimeType,'fileSize'=>$zipFileStat['size'],'fileDateM'=>$zipFileStat['mtime']);
	}
	function fs_zip_getRelativeRoute_byIndex($zip,$index){
		$zipFileRoute = $zip->getNameIndex($index);
		//if($zipFileRoute[0] == '.' && $zipFileRoute[1] == '/'){$zipFileRoute = substr($zipFileRoute,2);}
		if($zipFileRoute[0] == '/'){$zipFileRoute = substr($zipFileRoute,1);}
		return $zipFileRoute;
	}
	function fs_zip_parseRoute($fileRoute){
		if(strpos($fileRoute,'ziparc:drive:') === 0){$fileRoute = realpath($GLOBALS['api']['fs']['root']).substr($fileRoute,strlen('ziparc:drive:'));}
		$m = preg_split('/\.zip\//',$fileRoute);if(count($m) < 2){return $fileRoute;}
		$ret = array();
		$ret['filePath'] = array_shift($m).'.zip';
		$fileRoute = implode($m);
		$ret['fileRoute'] = fs_zip_parseRoute($fileRoute);
		return $ret;
	}

	function fs_zip_list($fileRoute = ''){
		$m = preg_split('/\.zip\//',$fileRoute);if(!$m){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		$filePath = array_shift($m).'.zip';if(!file_exists($filePath)){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		$fileRouteCompare = $filePath.'/'.implode($m);
		$fileRouteBase = ($GLOBALS['api']['fs']['serverCage']) ? 'ziparc:drive:'.substr($fileRouteCompare,strlen(realpath($GLOBALS['api']['fs']['root']))) : $fileRouteCompare;

//FIXME: a globals
		$finfo = finfo_open(FILEINFO_MIME,'../db/magic.mgc');
		$folder = fs_native_getInfo($filePath,$finfo);
		$files = $folderHash = array();

		$fileTree = array();
		$zip = new ZipArchive();if($zip->open($filePath) !== true){finfo_close($finfo);return array('folder'=>$folder,'files'=>array());}
		for($i = 0;$i < $zip->numFiles;$i++){
			$zipFileRoute = fs_zip_getRelativeRoute_byIndex($zip,$i);
			$zipFilePathInfo = pathinfo($zipFileRoute);
			$zipFileCanonicalRoute = $filePath.'/'.(($zipFilePathInfo['dirname'] == '.' || $zipFilePathInfo['dirname'] == '/') ? '' : $zipFilePathInfo['dirname'].'/');
			if(strpos($zipFileCanonicalRoute,$fileRouteCompare) === false){continue;}
			if(strlen($zipFileCanonicalRoute) != $l = strlen($fileRouteCompare)){
				$p = substr($zipFileCanonicalRoute,$l);
				$folderName = substr($p,0,strpos($p,'/'));
				if(isset($folderHash[$folderName])){continue;}$folderHash[$folderName] = true;
				$files[] = array('fileName'=>$folderName,'fileRoute'=>$fileRouteBase,'fileMime'=>'folder','fileSize'=>0,'fileDateM'=>0);
				continue;
			}
			$zipFileInfo = fs_zip_getInfo($zip,$i,$filePath,$finfo);
			$files[] = $zipFileInfo;
		}
		$zip->close();

		return array('folder'=>$folder,'files'=>$files);
	}

	function fs_zip_move($fileOBs,$fileRoute){
		$m = preg_split('/\.zip\//',$fileRoute);if(!$m){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		$zipPath = array_shift($m).'.zip';if(!file_exists($zipPath)){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		$zipRelativeRoute = '/'.implode($m);if(substr($zipRelativeRoute,-1) != '/'){$zipRelativeRoute .= '/';}/* La ruta relativa dentro del zip */
		$fileRouteCanonical = $zipPath.'/'.implode($m);
		$zipRoute = ($GLOBALS['api']['fs']['serverCage']) ? 'ziparc:drive:'.substr($fileRouteCanonical,strlen(realpath($GLOBALS['api']['fs']['root']))) : $fileRouteCanonical;

		$fileOBs_byRoute = array();foreach($fileOBs as $fileOB){$fileOBs_byRoute[$fileOB['fileRoute']][] = $fileOB;}
		$finfo = finfo_open(FILEINFO_MIME,'../db/magic.mgc');
		$return = array('add'=>array(),'remove'=>array());
		foreach($fileOBs_byRoute as $fileRoute=>$fileOBs){
			$protocol = substr($fileRoute,0,6);$s = strpos($fileRoute,':',7);
			switch($protocol){
				case 'native':
					$fileRoute = fs_helper_parsePath($fileRoute);if(!file_exists($fileRoute)){continue 2;}
					$zip = new ZipArchive();if($zip->open($zipPath) !== true){finfo_close($finfo);return $return;}
					$oldmask = umask(0);
					foreach($fileOBs as $fileOB){
						$filePath = $fileRoute.$fileOB['fileName'];if(!file_exists($filePath)){continue;}
//FIXME:si es una carpeta?
						$zip->addFile($filePath,$zipRelativeRoute.$fileOB['fileName']);
						//$return['remove'][$fileOB['fileRoute']][] = $fileOB['fileName'];
						$return['add'][$zipRoute][] = array_merge($fileOB,array('fileRoute'=>$zipRoute));
					}
					$zip->close();
					umask($oldmask);
					break;
			}
		}
		finfo_close($finfo);

		return $return;
	}

	function fs_zip_rename($fileOB = array(),$fileName = ''){
		$fileRoute = $fileOB['fileRoute'];
		if(strpos($fileRoute,'ziparc:') !== 0 || !($s = strpos($fileRoute,':',7))){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		$filePath = fs_helper_parsePath(substr($fileRoute,$s+1));
		$m = preg_split('/\.zip\//',$filePath);if(!$m){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		$filePath = array_shift($m).'.zip';if(!file_exists($filePath)){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		$zipRoute = implode('',$m);
		$zComPath = $zipRoute.$fileOB['fileName'];
		$zComLeng = strlen($zComPath);
		$zNewPath = $zipRoute.$fileName;

		$return = array('add'=>array(),'remove'=>array());
		if(empty($fileOB['fileName'])){
//FIXME: tenemos que crearla
return false;
		}

//FIXME: confirmar que existía previamente
//echo $zCompareRoute.'/'.PHP_EOL;
		$finfo = finfo_open(FILEINFO_MIME,'../db/magic.mgc');
		$zip = new ZipArchive();if($zip->open($filePath) !== true){finfo_close($finfo);return $return;}
		$i = -1;while($i++ !== false && ($zName = $zip->getNameIndex($i))){
			$zPath = fs_zip_getRelativeRoute_byIndex($zip,$i);
			if(strpos($zPath,$zComPath) !== 0){continue;}

			$zRoute = $zNewPath.substr($zPath,$zComLeng);
			//echo $zNewPath.PHP_EOL;echo $zPath.PHP_EOL;echo $zRoute.PHP_EOL;

			$fileOB = fs_zip_getInfo($zip,$i,$filePath,$finfo);
			$zip->renameIndex($i,$zRoute);
			$zOldName = $fileOB['fileName'];
			$zOldRoute = $fileOB['fileRoute'];
			if($zPath == $zComPath){$fileOB['fileName'] = $fileName;}
			$zRoute = $fileRoute.substr($zRoute,0,strlen($fileOB['fileName'])*-1);
			$fileOB = array_merge($fileOB,array('fileRoute'=>$zRoute));
//print_r($fileOB);
//FIXME: hay que cambiar la ruta :/ para las carpetas que estén abiertas en ese momento
// y luego cambiar la pos $fileOB['fileRoute'] por $zRoute
			$return['remove'][$zOldRoute][] = $zOldName;
			$return['add'][$zOldRoute][] = $fileOB;
		}
		$zip->close();
		finfo_close($finfo);

		return $return;
	}

	function fs_zip_getTree($fileRoute = ''){
		$m = preg_split('/\.zip\//',$fileRoute);if(!$m){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		$fileRoute = array_shift($m).'.zip';
		if(!file_exists($fileRoute)){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}

		$finfo = finfo_open(FILEINFO_MIME,'../db/magic.mgc');
		$folder = fs_native_getInfo($fileRoute,$finfo);

		$fileTree = array();
		$zip = new ZipArchive();
		if($zip->open($fileRoute) !== true){finfo_close($finfo);return array('folder'=>$folder,'files'=>array());}
		for($i = 0;$i < $zip->numFiles;$i++){
			$zipFileRoute = $zip->getNameIndex($i);
			$zipFileInfo = fs_zip_getInfo($zip,$i,$fileRoute,$finfo);
			$zipFilePathInfo = pathinfo($zipFileRoute);

			$b = &$fileTree;
			if($zipFilePathInfo['dirname'] != '.'){
				$zipFileRouteArray = explode('/',$zipFilePathInfo['dirname']);
				if($zipFileRouteArray){
					while($d = array_shift($zipFileRouteArray)){
						if(!isset($b[$d])){$b[$d] = array();}
						$b = &$b[$d];
					}
				}
			}

			$b[$zipFilePathInfo['basename']] = $zipFileInfo;
		}
print_r($fileTree);
exit;
exit;
		echo 33;exit;
	}
?>
