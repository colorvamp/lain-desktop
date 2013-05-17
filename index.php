<?php
	date_default_timezone_set('Europe/Madrid');
	$HERE_localhost = $_SERVER['SERVER_NAME'] == 'localhost';
	if(substr($_SERVER['SERVER_NAME'],0,7) == '192.168'){$HERE_localhost = true;}

	$r = preg_match('/(?<projectName>[^\/]+.com)/',$_SERVER['SCRIPT_FILENAME'],$m);
	if(!$r){echo 'Unable to find the projectName';exit;}
	$projectName = $m['projectName'];
	$GLOBALS['indexURL'] = 'http://'.$_SERVER['SERVER_NAME'].(($HERE_localhost) ? '/testing/'.$projectName : '');
	$GLOBALS['baseURL'] = $GLOBALS['indexURL'].'/';

	$params = parse_url($_SERVER['REQUEST_URI']);$params = $params['path'];
	if($HERE_localhost){$params = substr($params,strlen('/testing/'.$projectName));}
	$controllersBase = dirname(__FILE__).'/resources/controllers/';

	/* INI-loading other resources */
	if(preg_match('/(css|js|images|font|apps)\/.*?\.([a-z]{2,4}$)/',$params,$m)){
		$m[0] = 'resources/'.$m[0];
		if(!file_exists($m[0])){exit;}
		switch($m[2]){
			case 'css':header('Content-type: text/css');break;
			case 'js':header('Content-type: application/javascript');break;
			case 'png':header('Content-type: image/png');break;
			case 'gif':header('Content-type: image/gif');break;
			case 'ttf':case 'woff':case 'otf':case 'eot':header('Content-type: application/x-unknown-content-type');break;
		}
		echo file_get_contents($m[0]);exit;
	}
	/* END-loading resources */

	session_start();
	chdir('resources/PHP/');
	if(!defined('T')){define('T',"\t");}
	if(!defined('N')){define('N',"\n");}
	if(!defined('J')){define('J',"\t\t\t\t");}
	$GLOBALS['TEMPLATE'] = array('baseURL'=>$GLOBALS['baseURL'],'indexURL'=>$GLOBALS['indexURL']);
	$VAR_loggerUser = false;

	include_once('inc.common.php');
/*include_once('API_users.php');
include_once('inc_userSecurity.php');
$GLOBALS['COMMON']['TEMPLATEPATH'] = '../ASSIS/views/';
$GLOBALS['COMMON']['JSPATH'] = '../ASSIS/js/';
$GLOBALS['COMMON']['BASE'] = 'base';
if($GLOBALS['userSecurity']['errorCode'] === 0){$VAR_loggerUser = true;users_init();}
common_init();
$GLOBALS['currentPage'] = 1;*/

	do{
		/* Obtenemos la paginación */
		if(preg_match('/page\/([0-9]+)$/',$params,$m)){
			$params = substr($params,0,-strlen($m[0]));
			$GLOBALS['currentPage'] = $m[1];if($GLOBALS['currentPage'] < 1){$GLOBALS['currentPage'] = 1;}
		}
		$params = parse_url($params);
		$params = $params['path'];
		$params = explode('/',$params);
		$params = array_diff($params,array(''));

		/* Sacamos la función que debemos llamar */
		$controller = array_shift($params);
		if($controller == NULL){$controller = 'index';}
		$controllerPath = $controllersBase.$controller.'.php';
		if(!file_exists($controllerPath)){array_unshift($params,$controller);$controller = 'index';$controllerPath = $controllersBase.$controller.'.php';}

		include_once($controllerPath);
		$command = $unshift = array_shift($params);
		if($command == NULL){$command = $controller.'_main';break;}

		$command = $controller.'_'.$command;if(function_exists($command)){break;}
		if(isset($unshift)){array_unshift($params,$unshift);}
		$command = $controller.'_main';if(function_exists($command)){break;}
	}while(false);
//$GLOBALS['TEMPLATE']['JS_controller'] = '';
//if(file_exists($GLOBALS['COMMON']['JSPATH'].$controller.'.js')){$GLOBALS['TEMPLATE']['JS_controller'] = '<script type="text/javascript" src="{%assisURL%}js/'.$controller.'.js"></script>';}
	$r = call_user_func_array($command,$params);

	echo $GLOBALS['OUTPUT'];exit;
?>
