<?php
	function index_main(){
		$TEMPLATE = &$GLOBALS['TEMPLATE'];
		include_once('api.desktop.php');
		include_once('api.fs.php');
		if(!file_exists($GLOBALS['userPath'])){
			//FIXME: arreglarlo en condiciones
			echo $GLOBALS['userPath'];exit;
			users_logout();header('Location: '.$GLOBALS['baseURL']);exit;
		}
		$apps = desktop_app_getWhere('(appStatus = 1)');
		//FIXME: hack
		if(!$apps){$apps = array(array('appCode'=>'synaptic','appName'=>'Synaptic'),array('appCode'=>'users','appName'=>'Users and groups'));}
		$HTML_apps = '';foreach($apps as $app){$HTML_apps .= J.'<li onclick="launchApp(\''.$app['appCode'].'\');">'.$app['appName'].'</li>'.N;}
		$TEMPLATE['HTML_apps'] = $HTML_apps;

		$desktopIcons = fs_folder_list('/');
		$HTML_icons = '';
		foreach($desktopIcons['files'] as $f){
			$shortedText = (strlen($f['fileName']) > 13) ? substr($f['fileName'],0,10).'...' : $f['fileName'];
			$HTML_icons .= J.'<li class="desktop_icon wodIcon icon32_'.$f['fileMime'].' dragable" onmousedown="_littleDrag.onMouseDown(event);"><i>'.json_encode($f).'</i><div class="icon32_imgHolder"><img class="icon32_generic icon32_'.$f['fileMime'].'" src="resources/images/t.gif"/></div><div class="icon32_textHolder">'.$shortedText.'</div></li>'.N;
		}
		$TEMPLATE['HTML_icons'] = $HTML_icons;

		common_renderTemplate('desktop');
	}

	function index_av($id = '',$s = 32){
		$id = preg_replace('/[^0-9]*/','',$id);
		$s = preg_replace('/[^0-9]*/','',$s);if(empty($s)){$s = 32;}
		$imagePath = $GLOBALS['api']['users']['dir.users'].$id.'/avatar/'.$s.'.jpeg';
		if(!file_exists($imagePath)){$imagePath = '../images/avatars/default/av'.$s.'.jpeg';}
		$imgProp = @getimagesize($imagePath);
		header('Content-Type: '.$imgProp['mime']);
		readfile($imagePath);exit;
	}

	function index_login(){
		$TEMPLATE = &$GLOBALS['TEMPLATE'];
		if(users_isLogged()){header('Location: '.$GLOBALS['baseURL']);exit;}

		if(isset($_POST['subcommand'])){switch($_POST['subcommand']){
			case 'ajax.user.login':$r = users_login($_POST['userMail'],$_POST['userPass']);
				unset($r['userPass'],$r['userCode'],$r['userStatus']);echo json_encode($r);exit;
			case 'user.register':
				$users = users_getSingle(1);if($users){break;}
				if(!isset($_POST['userPass']) || !isset($_POST['userPassR']) || $_POST['userPass'] != $_POST['userPassR']){echo 'passwords mismatch';exit;}
				$r = users_create($_POST);if(isset($r['errorDescription'])){print_r($r);exit;}
				$user = $r;
				/* Activate the new user so he can log into the system */
				$r = users_update($user['userMail'],array('userStatus'=>1,'userModes'=>',regular,admin,','userCode'=>''));
				users_getPath($user['id'],'',true);
				header('Location: '.$GLOBALS['baseURL']);exit;
		}}

		/* INI-print all the allowed users */
		$users = users_getWhere('(userModes LIKE \'%,admin,%\' OR userModes LIKE \'%,writer,%\' OR userModes LIKE \'%,publisher,%\')',array('indexBy'=>'userMail'));
		if(!$users){return common_renderTemplate('u/register');}
		$usersGrid = '';
		foreach($users as $user){
			$user['loginName'] = $user['userName'];
			$usersGrid .= common_loadSnippet('snippets/login.user',$user);
		}
		$TEMPLATE['usersGrid'] = $usersGrid;
		/* INI-print all the allowed users */

		$TEMPLATE['BLOG_TITLE'] = 'Login';
		$TEMPLATE['HTML_DESCRIPTION'] = 'Login';
		$TEMPLATE['BLOG_SCRIPTS'][] = '{%baseURL%}r/js/login.js';
		common_renderTemplate('login');
	}

	function index_logout(){
		users_logout();
		header('Location: '.$GLOBALS['baseURL']);exit;
	}
?>
