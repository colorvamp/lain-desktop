<?php
	function api_main(){
		
	}

	function api_test(){
		//include_once('fs/inc.fs.gdrive.php');
		//fs_gdrive_sync('52f7fd3dc8086');
		//include_once('api.drives.php');
		//drives_status();
	}

	function api_fs(){
		include_once('api.fs.php');
		if(isset($_POST['subcommand'])){switch($_POST['subcommand']){
			case 'folder.list':
				if(!isset($_POST['fileRoute']) || empty($_POST['fileRoute'])){break;}
				$r = fs_folder_list(base64_decode($_POST['fileRoute']));
				echo json_encode($r);
				break;
			case 'file.move':
				$fileOBs = json_decode(base64_decode($_POST['files']),1);
				$target = json_decode(base64_decode($_POST['target']),1);
				$r = fs_move($fileOBs,$target);echo json_encode($r);break;
			case 'file_copy':$r = fs_file_copy(base64_decode($_POST['files']),base64_decode($_POST['target']));echo json_encode($r);break;
			case 'file.rename':
				$fileOB = json_decode(base64_decode($_POST['file']),1);
				$fileName = json_decode(base64_decode($_POST['name']),1);
				$r = fs_rename($fileOB,$fileName);
				echo json_encode($r);break;
			case 'file.trash':
				$fileOBs = json_decode(base64_decode($_POST['files']),1);
				$r = fs_trash($fileOBs);
				echo json_encode($r);break;
			case 'file.compress':
$r = fs_file_compress(base64_decode($_POST['files']));echo json_encode($r);break;
			case 'file_trash':$r = fs_file_trash(base64_decode($_POST['files']));echo json_encode($r);break;
			case 'transfer_fragment':
				$neededParams = array('fileName','fileRoute','base64string_sum','base64string_len','fragment_string','fragment_num','fragment_sum');
				foreach($neededParams as $param){
					if(!isset($_POST[$param]) || $_POST[$param] === ''){print_r(array('errorDescription'=>'INVALID_PARAMS:'.$param,'file'=>__FILE__,'line'=>__LINE__));exit;}
				}
				$r = fs_transfer_fragment($_POST['fileName'],$_POST['fileRoute'],$_POST['base64string_sum'],$_POST['base64string_len'],$_POST['fragment_string'],$_POST['fragment_num'],$_POST['fragment_sum']);
				echo json_encode($r);
				break;
		}}
		if(func_num_args()){$args = func_get_args();$subcommand = array_shift($args);switch($subcommand){
			case 'file_stream':
				//FIXME: también hacerlo con un único argumento
				foreach($args as $k=>$arg){$args[$k] = base64_decode(str_replace(' ','+',$args[$k]));}
				list($fileName,$fileRoute) = $args;
//echo $fileRoute,'/',$fileName;exit;
				$r = fs_file_stream($fileName,$fileRoute);
				exit;
		}}
		exit;
	}

	function api_users(){
		include_once('api.users.php');
		if(isset($_POST['subcommand'])){switch($_POST['subcommand']){
			case 'get':
				//FIXME: selectString
				$users = users_getWhere(1,array());
				echo json_encode($users);
				break;
			case 'create':
				if(!users_checkModes('admin')){echo json_encode(array('errorDescription'=>'PREMISSION_DENIED','file'=>__FILE__,'line'=>__LINE__));break;}
				if(!isset($_POST['userPass']) || !isset($_POST['userPassR'])){echo json_encode(array('errorDescription'=>'PASSWORDS_NOT_MATCH','file'=>__FILE__,'line'=>__LINE__));break;}
				if($_POST['userPass'] !== $_POST['userPassR']){echo json_encode(array('errorDescription'=>'PASSWORDS_NOT_MATCH','file'=>__FILE__,'line'=>__LINE__));break;}
				$user = users_create($_POST);
				/* Activate the new user so he can log into the system */
				$r = users_update($user['userMail'],array('userStatus'=>1,'userCode'=>''));
				echo json_encode($user);
				break;
			case 'remove';
				if(!users_checkModes('admin')){echo json_encode(array('errorDescription'=>'PREMISSION_DENIED','file'=>__FILE__,'line'=>__LINE__));break;}
				if(!isset($_POST['users']) || empty($_POST['users'])){echo json_encode(array('errorDescription'=>'INVALID_INPUT','file'=>__FILE__,'line'=>__LINE__));break;}
				$_POST['users'] = base64_decode($_POST['users']);
				if(strpos($_POST['users'],'[') === 0){$_POST['users'] = json_decode($_POST['users'],1);}
				//FIXME: con una conexion global a la base de datos funcionaría mejor
				foreach($_POST['users'] as $userMail){
					$r = users_remove($userMail);
					if(isset($r['errorDescription'])){echo json_encode($r);exit;}
				}
				echo json_encode($_POST['users']);
				break;
		}}
		exit;
	}

	function api_desktop(){
		include_once('api.desktop.php');
		if(func_num_args()){$args = func_get_args();$subcommand = array_shift($args);switch($subcommand){
			case 'background_set':
				foreach($args as $k=>$arg){$args[$k] = base64_decode(str_replace(' ','+',$args[$k]));}
				list($filePath) = $args;
				$r = desktop_background_set($filePath);
				echo json_encode($r);
				exit;
			case 'background_get':
				//FIXME: los diferentes tamaños
				$r = desktop_background_get();
				exit;
		}}

		if(isset($_POST['subcommand'])){switch($_POST['subcommand']){
			case 'data.set':
//FIXME: a fuego
				$r = report_data_save('mouse.speed',1250,array('db.user'=>$GLOBALS['user']['id']));
print_r($r);
				exit;
		}}
	}

	function api_drives($mod = false){
		include_once('api.drives.php');
		if(isset($_POST['subcommand'])){switch($_POST['subcommand']){
			case 'list':$r = drives_list();echo json_encode(array('drives'=>$r));break;
			case 'status':$r = drives_status();echo json_encode(array('drives'=>$r));break;
			case 'create':
				$params = array();foreach($_POST as $k=>$v){$params[$k] = base64_decode($v);}
				$r = drives_create($params);
				echo json_encode($r);
				break;
			case 'sync':
				if(!isset($_POST['driveID']) || empty($_POST['driveID'])){break;}
				$driveID = preg_replace('/[^a-z0-9:]/','',base64_decode($_POST['driveID']));
//FIXME: debería ser genérico para todos los $driveTypes
include_once('fs/inc.fs.gdrive.php');
				$r = fs_gdrive_sync($driveID);
				echo json_encode($r);
				break;
		}}

		$GLOBALS['COMMON']['BASE'] = 'base.dummy';
		$TEMPLATE = &$GLOBALS['TEMPLATE'];
		if($mod){switch($mod){
//FIXME: control de errores
			case 'code':
				$args = func_get_args();
				array_shift($args);/* Eliminamos $mod */
				if(!$args){echo 'No args';exit;}
				$driveID = preg_replace('/[^a-z0-9:]/','',array_shift($args));
				if(empty($driveID)){echo 'No exists';exit;}
				/* Comprobamos que el drive exista realmente */
				$exists = drives_getSingle('(pool = \''.$driveID.'\')');
				if(!$exists){echo 'No exists';exit;}
				$driveType = substr($driveID,0,6);
				$driveHash = substr($driveID,7);
				/* INI-check for the lib */
				$lib = 'fs/inc.fs.'.$driveType.'.php';
				if(!file_exists($lib)){echo 'No support';exit;}
				include_once($lib);
				/* END-check for the lib */
				$retURL = parse_url('http://'.$_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI']);
				$retURL = $retURL['scheme'].'://'.$retURL['host'].$retURL['path'];

				if(isset($_GET['code'])){
					$_GET['code'] = preg_replace('/[^a-zA-Z0-9:\/\._\-]/','',$_GET['code']);
					if(isset($_GET['state']) && $_GET['state'] != $driveID){/* FIXME: */}
//FIXME: hacer llamada generica con $func
					$r = fs_gdrive_code_set($driveHash,$_GET['code']);
					if(isset($r['errorDescription'])){print_r($r);exit;}
					$r = fs_gdrive_token_request($driveHash,$retURL);
//FIXME: actualizar el global de la lib
//FIXME:recuperar token
//print_r($_GET);
//exit;
					return common_renderTemplate('drives/drive.approved');
				}

				/* INI-check for the func */
				$func = 'fs_'.$driveType.'_code_request';
				if(!function_exists($func)){echo 'No support';exit;}
				/* END-check for the func */

				$location = $func($driveHash,$retURL);
				if(is_array($location) && isset($location['errorCode'])){print_r($location);exit;}
				//header('Location: '.$location);exit;
				$TEMPLATE['drive.url'] = $location;
				return common_renderTemplate('drives/drive.approval');
		}}
	}

	function api_apt(){
		include_once('api.apt.php');
		if(isset($_POST['subcommand'])){switch($_POST['subcommand']){
			case 'sourcesReload':
				include_once('inc.flush.php');
				$GLOBALS['ajax'] = true;
				$r = apt_get_update();
				break;
			case 'packageSearch':
				if(!isset($_POST['searchString']) || empty($_POST['searchString'])){break;}
				$r = apt_get_search(base64_decode($_POST['searchString']));
				echo json_encode($r);
				break;
		}}
		exit;
	}
?>
