<?php
	function desktop_background_set($filePath = false){
		include_once('api.fs.php');
		$fileName = basename($filePath);
		$fileRoute = dirname($filePath);

		if(strpos($fileRoute,'native:drive:') === 0){$fileRoute = substr($fileRoute,13);}
		$fileRoute = fs_helper_parsePath($fileRoute);
		if($fileRoute === false){return array('errorDescription'=>'PATH_ERROR','file'=>__FILE__,'line'=>__LINE__);}
		if(!is_dir($fileRoute)){return array('errorDescription'=>'PATH_IS_NOT_DIRECTORY','file'=>__FILE__,'line'=>__LINE__);}
		$targetFile = $fileRoute.$fileName;

		include_once('inc.images.php');
		$imgProp = getimagesize($targetFile);
		/* If $imgProp == false the path is not an image */
		if($imgProp === false){return json_encode(array('errorCode'=>1,'errorDescription'=>'NOT_AN_IMAGE','file'=>__FILE__,'line'=>__LINE__));}
		$bgDir = $GLOBALS['userPath'].'background/';if(!file_exists($bgDir)){$oldmask = umask(0);$r = @mkdir($bgDir,0777,1);umask($oldmask);}
		copy($targetFile,$bgDir.'main');
		$targetFile = $bgDir.'main';
		$image = image_mimeDecider($imgProp['mime'],$targetFile);

		/* We gonna generate a few thumbs */
		$r = image_convert($targetFile,'jpeg');
		/* Realizamos los diferentes tamaños */
		$sizes = array('32','64','128','256','306','120x160');$overWrite = true;
		foreach($sizes as $k=>$size){
			$destPath = $bgDir.$size.'.jpeg';
			//if($overWrite === false && file_exists($destPath)){continue;}
			if(!is_numeric($size[0])){unset($sizes[$k]);continue;}
			if(strpos($size,'x') !== false){$r = image_thumb($image,$destPath,$size);continue;}
			$r = image_square($image,$destPath,$size);
		}

		imagedestroy($image);
		return true;
	}

	function desktop_background_get($size = false){
		$bgDir = $GLOBALS['userPath'].'background/';
		$targetFile = $bgDir.'main.jpeg';
		if(!file_exists($targetFile)){exit;}
		readfile($targetFile);
		exit;
	}
?>
