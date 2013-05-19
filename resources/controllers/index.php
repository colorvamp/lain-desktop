<?php
	function index_main(){
		$TEMPLATE = &$GLOBALS['TEMPLATE'];
		include_once('api.fs.php');
		$desktopIcons = fs_folder_list('/');
		$HTML_icons = '';
		foreach($desktopIcons['folders'] as $f){$HTML_icons .= J.'<li class="desktop_icon wodIcon icon32_folder dragable" onmousedown="_littleDrag.onMouseDown(event);"><i>'.json_encode($f).'</i><div class="icon32_imgHolder"><img src="r/images/t.gif" class="icon32_folder"/></div><div class="icon32_textHolder">'.$f['fileName'].'</div></li>'.N;}
		foreach($desktopIcons['files'] as $f){
			$shortedText = (strlen($f['fileName']) > 13) ? substr($f['fileName'],0,10).'...' : $f['fileName'];
			$HTML_icons .= J.'<li class="desktop_icon wodIcon icon32_'.$f['fileMime'].' dragable" onmousedown="_littleDrag.onMouseDown(event);"><i>'.json_encode($f).'</i><div class="icon32_imgHolder"><img class="icon32_generic icon32_'.$f['fileMime'].'" src="resources/images/t.gif"/></div><div class="icon32_textHolder">'.$shortedText.'</div></li>'.N;
		}
		$TEMPLATE['HTML_icons'] = $HTML_icons;

		common_renderTemplate('desktop');
	}

	function index_login(){
		$TEMPLATE = &$GLOBALS['TEMPLATE'];
		if(users_isLogged()){header('Location: '.$GLOBALS['baseURL']);exit;}

		if(isset($_POST['subcommand'])){switch($_POST['subcommand']){
			case 'userLogin':
				$r = users_login($_POST['userMail'],$_POST['userPass']);
				echo json_encode($r);
				exit;
		}}

		/* get all the users */
		$users = users_getWhere(1,array('indexBy'=>'userMail'));
		$usersGrid = '';
		foreach($users as $user){
			$user['loginName'] = $user['userName'];
			$usersGrid .= common_loadSnippet('snippets/login.user',$user);
		}
		$TEMPLATE['usersGrid'] = $usersGrid;
		$TEMPLATE['BLOG_SCRIPTS'][] = '{%baseURL%}r/js/login.js';
		common_renderTemplate('login');
	}

	function index_logout(){
		users_logout();
		header('Location: '.$GLOBALS['baseURL']);exit;
	}
?>
