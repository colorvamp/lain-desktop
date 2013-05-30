<?php
	$GLOBALS['tables']['sources'] = array('_source_'=>'TEXT NOT NULL','_dist_'=>'TEXT NOT NULL','pools'=>'TEXT NOT NULL','status'=>'INTEGER DEFAULT 1','updated'=>'TEXT');
	$GLOBALS['tables']['packages'] = array('_id_'=>'INTEGER AUTOINCREMENT','package'=>'TEXT NOT NULL','status'=>'INTEGER DEFAULT 0','version'=>'TEXT',
		'filename'=>'TEXT UNIQUE NOT NULL','md5sum'=>'TEXT','priority'=>'TEXT',
		'section'=>'TEXT','architecture'=>'TEXT','installedsize'=>'TEXT','size'=>'INTEGER',
		'maintainer'=>'TEXT','originalmaintainer'=>'TEXT','depends'=>'TEXT','predepends'=>'TEXT','recommends'=>'TEXT',
		'suggests'=>'TEXT','conflicts'=>'TEXT','breaks'=>'TEXT','provides'=>'TEXT','replaces'=>'TEXT','enhances'=>'TEXT',
		'pythonversion'=>'TEXT','builtusing'=>'TEXT','sha1'=>'TEXT','sha256'=>'TEXT','supported'=>'TEXT',
		'task'=>'TEXT','bugs'=>'TEXT','essential'=>'TEXT',
		'origin'=>'TEXT','source'=>'TEXT','multiarch'=>'TEXT','tag'=>'TEXT','homepage'=>'TEXT','description'=>'TEXT');
	$GLOBALS['api']['apt'] = array('db'=>'../db/api.apt.db','tablePackages'=>'packages','tableSources'=>'sources');

	function apt_sources_getSingle($whereClause = false,$params = array()){
		include_once('inc.sqlite3.php');
		$shouldClose = false;if(!isset($params['db']) || !$params['db']){$params['db'] = sqlite3_open($GLOBALS['api']['apt']['db'],SQLITE3_OPEN_READONLY);$shouldClose = true;}
		if(!isset($params['indexBy'])){$params['indexBy'] = false;}
		$r = sqlite3_getSingle($GLOBALS['api']['apt']['tableSources'],$whereClause,$params);
		if($shouldClose){sqlite3_close($params['db']);}
		return $r;
	}
	function apt_sources_getWhere($whereClause = false,$params = array()){
		include_once('inc.sqlite3.php');
		$shouldClose = false;if(!isset($params['db']) || !$params['db']){$params['db'] = sqlite3_open($GLOBALS['api']['apt']['db'],SQLITE3_OPEN_READONLY);$shouldClose = true;}
		if(!isset($params['indexBy'])){$params['indexBy'] = false;}
		$r = sqlite3_getWhere($GLOBALS['api']['apt']['tableSources'],$whereClause,$params);
		if($shouldClose){sqlite3_close($params['db']);}
		return $r;
	}
	function apt_packages_getSingle($whereClause = false,$params = array()){
		include_once('inc.sqlite3.php');
		$shouldClose = false;if(!isset($params['db']) || !$params['db']){$params['db'] = sqlite3_open($GLOBALS['api']['apt']['db'],SQLITE3_OPEN_READONLY);$shouldClose = true;}
		if(!isset($params['indexBy'])){$params['indexBy'] = false;}
		$r = sqlite3_getSingle($GLOBALS['api']['apt']['tablePackages'],$whereClause,$params);
		if($shouldClose){sqlite3_close($params['db']);}
		return $r;
	}
	function apt_packages_getWhere($whereClause = false,$params = array()){
		include_once('inc.sqlite3.php');
		$shouldClose = false;if(!isset($params['db']) || !$params['db']){$params['db'] = sqlite3_open($GLOBALS['api']['apt']['db'],SQLITE3_OPEN_READONLY);$shouldClose = true;}
		if(!isset($params['indexBy'])){$params['indexBy'] = false;}
		$r = sqlite3_getWhere($GLOBALS['api']['apt']['tablePackages'],$whereClause,$params);
		if($shouldClose){sqlite3_close($params['db']);}
		return $r;
	}

	function apt_get_search($searchString){
		$searchString = preg_replace('/[\']*/','',$searchString);if(empty($searchString) || strlen($searchString) < 3){$searchString = '';}
		/* Search for packet name directly */
		if(strpos($searchString,' ') === false){$searchQuery = '(package LIKE \'%'.$searchString.'%\')';$packages = apt_packages_getWhere($searchQuery);if($packages){return $packages;}}

		$searchArray = array();
		if(strpos($searchString,'"') !== false){
			$pos = 0;$init = -1;$las = 0;
			while(($pos = strpos($searchString,'"',$pos)) !== false){
				if($pos === false){break;}
				$pos++;if($init < 0){$str = substr($searchString,$las,($pos-$las-1));$searchArray = array_merge($searchArray,array_diff(array_unique(explode(' ',$str)),array('')));$init = $pos;}
				else{$searchArray[] = substr($searchString,$init,($pos-$init-1));$init = -1;}
				$las = $pos;
			}
			$str = substr($searchString,$las);$searchArray = array_merge($searchArray,array_diff(array_unique(explode(' ',$str)),array('')));
		}else{
			$searchArray = array_unique(explode(' ',$searchString));
			$searchArrayCount = count($searchArray);
			$a = $searchArray;$letterLimit = 3;
			foreach($a as $k=>$p){if(strlen($a[$k]) < $letterLimit){unset($a[$k]);}}
			if($a){$searchArray = $a;}
		}

		$searchQuery = '(';
		/* If only a word given, we must search, even if is less than 3 letters */
		foreach($searchArray as $element){$searchQuery .= '(package LIKE \'%'.$element.'%\') OR ';}
		$totalStars = count($searchArray);$searchQuery = substr($searchQuery,0,-4);$searchQuery .= ')';

		$packages = apt_packages_getWhere($searchQuery,array('limit'=>100));
		/* The value of $i is decremental becaise we estimate that the first positions of words has
		 * more weight in the search string */
		foreach($packages as $hid=>$package){
		    $i = $totalStars;$packages[$hid]['searchRate'] = 0;
		    foreach($searchArray as $searchItem){$ret = strpos(strtolower($package['package']),strtolower($searchItem));if($ret !== false){$package[$hid]['package'] += $i;}$i--;}
		}

		/* If there is multiple packages, we order by searchRate */
		$o = function($a,$b){if ($a['searchRate'] == $b['searchRate']){return 0;}return ($a['searchRate'] > $b['searchRate']) ? -1 : 1;};
		if(count($packages)){usort($packages,$o);}

		return $packages;
	}

//apt_get_update();
	function apt_get_update(){
		//FIXME: hardcoded
		$arch = 'i386';
		$sources = apt_sources_getWhere(1);
		foreach($sources as $source){
			$pools = explode(',',$source['pools']);
			foreach($pools as $pool){
				$packageFileIn = $source['source'].'/dists/'.$source['dist'].'/'.$pool.'/binary-'.$arch.'/Packages.bz2';
				$packageFileOut = '/tmp/'.uniqid().'Packages.bz2';
				$in = @fopen($packageFileIn,'rb');if(!$in){break;}
				$out = fopen($packageFileOut,'wb');while($chunk = fread($in,8192)){fwrite($out,$chunk,8192);}fclose($in);fclose($out);

				$deflatedFile = '/tmp/'.uniqid().'packages';
				$bz = bzopen($packageFileOut,'r');if(!$bz){return false;}
				$out = fopen($deflatedFile,'wb');while(!feof($bz)){fwrite($out,bzread($bz,4096),4096);}fclose($bz);fclose($out);
				unlink($packageFileOut);

				$r = apt_cache_generate($source['source'],$deflatedFile);
				unlink($deflatedFile);
			}
		}

return true;
		//FIXME: quizá podemos sacar que es ubuntu de uname -a
		$release = apt_helper_get_ubuntu_release();
		$codename = $release['codename'];
	}

	function apt_cache_generate($source = '',$file = false,$db = false){
		//$file = '/var/lib/dpkg/available';
		if(!file_exists($file)){return false;}
		include_once('inc.sqlite3.php');
		$fp = fopen($file,'r');
		if(!$fp){return false;}

		$shouldClose = false;if(!$db){$db = sqlite3_open($GLOBALS['api']['apt']['db']);sqlite3_exec('BEGIN',$db);$shouldClose = true;}
		$allowedKeys = array_keys($GLOBALS['tables']['packages']);
		$package = array();$lastProp = false;$oldpackage = array();
		while(($b = fgets($fp,4096)) !== false){
			if($b == PHP_EOL){
				if(isset($package['filename'])){$package['filename'] = $source.'/'.$package['filename'];}
				$packageKeys = array_keys($package);
				$diff = array_diff($packageKeys,$allowedKeys);
				if($diff){$package = array_diff_key($package,array_flip($diff));}
				$r = sqlite3_insertIntoTable($GLOBALS['api']['apt']['tablePackages'],$package,$db);
				if(!$r['OK']){if($shouldClose){sqlite3_close($db);}return array('errorCode'=>$r['errno'],'errorDescription'=>$r['error'],'file'=>__FILE__,'line'=>__LINE__);}
				$oldpackage = $package;
				$package = array();
				continue;
			}
			if($b[0] == ' '){$package[$lastProp] .= substr($b,1);continue;}
			$pos = strpos($b,':');
			$prop = substr($b,0,$pos);
			$lastProp = strtolower(str_replace('-','',$prop));
			/* Quirks */
			if($lastProp == 'origmaintainer'){$lastProp = 'originalmaintainer';}
			//if($lastProp != 'package' || !isset($GLOBALS['tables']['packages'][$lastProp])){continue;}
			$package[$lastProp] = substr($b,$pos+2,-1);
		}
		fclose($fp);
		if($shouldClose){$r = sqlite3_exec('COMMIT;',$db);$GLOBALS['DB_LAST_ERRNO'] = $db->lastErrorCode();$GLOBALS['DB_LAST_ERROR'] = $db->lastErrorMsg();if(!$r){sqlite3_close($db);return array('OK'=>false,'errno'=>$GLOBALS['DB_LAST_ERRNO'],'error'=>$GLOBALS['DB_LAST_ERROR'],'file'=>__FILE__,'line'=>__LINE__);}sqlite3_close($db);}
		return true;
	}

	function apt_helper_get_ubuntu_release(){
		$r = shell_exec('lsb_release -a');
		$lines = explode(PHP_EOL,$r);
		$release = array();
		foreach($lines as $line){$pos = strpos($line,':');if($pos === false){continue;}$prop = strtolower(str_replace(' ','',substr($line,0,$pos)));$release[$prop] = substr($line,$pos+2);}
		return $release;
	}
//apt_helper_parse_sources();
	function apt_helper_parse_sources($db = false){
		include_once('inc.sqlite3.php');
		$rawsources = array();
		$fileSources = '/etc/apt/sources.list';
		$fp = fopen($fileSources,'r');
		if(!$fp){return false;}
		while(($b = fgets($fp,4096)) !== false){
			if($b[0] == '#'){continue;}
			if(substr($b,0,4) != 'deb '){continue;}
			$rawsources[] = substr($b,4,-1);
		}
		fclose($fp);

		$sources = array();
		foreach($rawsources as $rawsource){
			$pools = explode(' ',$rawsource);
			$base = array_shift($pools);
			$dist = array_shift($pools);
			$base = parse_url($base);$base['path'] = basename($base['path']);
			$base = $base['scheme'].'://'.$base['host'].'/'.$base['path'];
			if(!isset($sources[$base][$dist])){$sources[$base][$dist] = $pools;}
			else{$sources[$base][$dist] = array_unique(array_merge($sources[$base][$dist],$pools));}
		}

		$shouldClose = false;if(!$db){$db = sqlite3_open($GLOBALS['api']['apt']['db']);sqlite3_exec('BEGIN',$db);$shouldClose = true;}
		foreach($sources as $base=>$dists){foreach($dists as $dist=>$pools){
			$node = array('_source_'=>$base,'_dist_'=>$dist,'pools'=>implode(',',$pools));
			$r = sqlite3_insertIntoTable($GLOBALS['api']['apt']['tableSources'],$node,$db);
			if(!$r['OK']){if($shouldClose){sqlite3_close($db);}return array('errorCode'=>$r['errno'],'errorDescription'=>$r['error'],'file'=>__FILE__,'line'=>__LINE__);}
		}}
		if($shouldClose){$r = sqlite3_exec('COMMIT;',$db);$GLOBALS['DB_LAST_ERRNO'] = $db->lastErrorCode();$GLOBALS['DB_LAST_ERROR'] = $db->lastErrorMsg();if(!$r){sqlite3_close($db);return array('OK'=>false,'errno'=>$GLOBALS['DB_LAST_ERRNO'],'error'=>$GLOBALS['DB_LAST_ERROR'],'file'=>__FILE__,'line'=>__LINE__);}sqlite3_close($db);}
		return true;
	}
?>
