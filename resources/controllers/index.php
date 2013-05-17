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
?>
