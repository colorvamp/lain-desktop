<?php
	function fs_zip_getInfo($zip,$index,$filePath,$finfo = false){
		$zipFileRoute = $zip->getNameIndex($index);
		$zipFileStat = $zip->statIndex($index);
		$zipFilePathInfo = pathinfo($zipFileRoute);
		$zipFileMimeType = '';if($finfo){list($zipFileMimeType) = explode('; ',finfo_file($finfo,'zip://'.$filePath.'#'.$zipFileRoute));}
		$fileRoute = ($GLOBALS['api']['fs']['serverCage']) ? 'native:drive:'.substr($filePath,strlen(realpath($GLOBALS['api']['fs']['root']))) : $filePath;
		return array('fileName'=>$zipFilePathInfo['basename'],'fileRoute'=>$fileRoute.'/'.($zipFilePathInfo['dirname'] == '.' ? '' : $zipFilePathInfo['dirname'].'/'),'fileMime'=>$zipFileMimeType,'fileSize'=>$zipFileStat['size'],'fileDateM'=>$zipFileStat['mtime']);
	}
	function fs_zip_list($fileRoute = ''){
		$m = preg_split('/\.zip\//',$fileRoute);if(!$m){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		$filePath = array_shift($m).'.zip';
		if(!file_exists($filePath)){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		$fileRouteCompare = $filePath.'/'.implode($m);
		$fileRouteBase = ($GLOBALS['api']['fs']['serverCage']) ? 'native:drive:'.substr($fileRouteCompare,strlen(realpath($GLOBALS['api']['fs']['root']))) : $fileRouteCompare;

		$finfo = finfo_open(FILEINFO_MIME,'../db/magic.mgc');
		$folder = fs_native_getInfo($filePath,$finfo);
		$files = $folderHash = array();

		$fileTree = array();
		$zip = new ZipArchive();
		if($zip->open($filePath) !== true){finfo_close($finfo);return array('folder'=>$folder,'files'=>array());}
		for($i = 0;$i < $zip->numFiles;$i++){
			$zipFileRoute = $zip->getNameIndex($i);
			$zipFilePathInfo = pathinfo($zipFileRoute);
			$zipFileCanonicalRoute = $filePath.'/'.($zipFilePathInfo['dirname'] == '.' ? '' : $zipFilePathInfo['dirname'].'/');
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

		return array('folder'=>$folder,'files'=>$files);
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
