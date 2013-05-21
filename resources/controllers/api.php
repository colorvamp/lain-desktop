<?php
	function api_main(){
		
	}

	function api_fs(){
		include_once('api.fs.php');
		if(isset($_POST['subcommand'])){switch($_POST['subcommand']){
			case 'folder_list':
				if(!isset($_POST['fileRoute']) || empty($_POST['fileRoute'])){break;}
				$r = fs_folder_list(base64_decode($_POST['fileRoute']));
				echo json_encode($r);
				break;
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
				$r = fs_file_stream($fileName,$fileRoute);
				print_r($r);
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
	}
?>
