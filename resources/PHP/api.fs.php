<?php
//FIXME: hardcoded
$GLOBALS['userPath'] = '../db/users/1/';
	$GLOBALS['api']['fs'] = array('root'=>$GLOBALS['userPath'].'drive/','serverCage'=>true);

	if(isset($_POST['command'])){
		$command = $_POST['command'];unset($_POST['command']);
		header('Content-type: text/json');
		switch($command){
			case 'folder_list':
//echo base64_decode($_POST['path']);break;
$r = fs_folder_list(base64_decode($_POST['path']));echo json_encode($r);break;
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

?>
