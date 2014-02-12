	<div id='lainBackground'></div>
	<img class='logo' src='r/images/colorvampLogoSimpleWhite.png'/>
	<div id='null'></div>

	<div id='lainDesktop' class="lainDesktop">
		<b class="lainLeyend">LAIN Project ~12.10 "REBIRTH" by sombra2eternity <span onclick="test(event);">test</span></b>
		<div id='lainMenu' class="lainMenu"></div>
		<div id="mouseTrayIcon"><img onclick="_desktop.mouse_controlDialog();" src='r/images/t.gif'/></div>
		<div id='lainFlowIcon'></div>
		<ul id='systemTray'>
			<li><div class="perm"><a href="{%baseURL%}logout"><i class="icon-user"></i> {%user_userName%}</a></div></li>
			<li id="tray_desktop_progress"><div class="perm"><i class="icon-user"></i></div></li>
			<li id="tray_desktop_tasks"><div class="perm"><i class="icon-reorder"></i></div></li>
		</ul>
		<ul id="lainIcons" class="wodIconCanvas"></ul>
		<ul id='lainWindows'></ul>
		<div class="lainStorage">
			<div class="apps">{%JSON.apps%}</div>
			<div class="places">{%JSON.places%}</div>
		</div>
<div id='log' style='position:absolute;top:0;right:0;background:white;z-index:1000;'></div>
	</div>
