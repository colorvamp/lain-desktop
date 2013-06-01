	<div id='lainBackground'></div>
	<img class='logo' src='r/images/colorvampLogoSimpleWhite.png'/>
	<div id='null'></div>

	<div id='lainDesktop'>
		<b class="lainLeyend">LAIN Project ~12.10 "REBIRTH" by sombra2eternity</b>
		<div id='lainMenu'>
			<div id='lainAppsMenu' onclick='menu_switch(this);'>
				<h1>Applications</h1>
				<ul>
					<li onclick="launchApp('greenEnergy',launchApp_createHolder('greenEnergy'));">green Energy</li>
					<li onclick="launchApp('lainJukebox',launchApp_createHolder('lainJukebox'));">Lain Jukebox</li>
					<li onclick="launchApp('melodiamePlayer',launchApp_createHolder('melodiamePlayer'));">Melodiame Player</li>
					<li onclick="launchApp('synaptic',launchApp_createHolder('synaptic'));">Synaptic</li>
				</ul>
			</div>
			<div id='lainPlacesMenu' onclick='menu_switch(this);'>
				<h1>Places</h1>
				<ul id='lainPlacesMenu_itemList'>
					<li class='icon_desktop' onclick='launchApp("lainExplorer",launchApp_createHolder("lainExplorer"),"native:drive:/");'>Desktop</li>
					<li class='icon_desktop' onclick='launchApp("lainExplorer",launchApp_createHolder("lainExplorer"),"native:trash:/");'>Trash</li>
					<?php //echo desktop_placesToCanvas(); ?>
					<li class='icon_insert_link dropLeyend'>Drop folders here</li>
				</ul>
			</div>
		</div>
		<div id="mouseTrayIcon"><img onclick="_desktop.mouse_controlDialog();" src='r/images/t.gif'/></div>
		<div id='lainFlowIcon'></div>
		<ul id='systemTray'>
			<li><div class="perm"><a href="{%baseURL%}logout"><i class="icon-user"></i> {%user_userName%}</a></div></li>
			<li id="tray_desktop_progress"><div class="perm"><i class="icon-user"></i></div></li>
			<li id="tray_desktop_tasks"><div class="perm"><i class="icon-reorder"></i></div></li>
		</ul>
		<ul id="lainIcons">{%HTML_icons%}</ul>
		<ul id='lainWindows'></ul>
<div id='log' style='position:absolute;top:0;right:0;background:white;z-index:1000;'></div>
	</div>
