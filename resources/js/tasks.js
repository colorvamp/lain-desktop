_tasks = {
	init: function(){
		
	},
	taskAdd: function(task){
		var h = $_('tray_desktop_tasks');
		var info = info_create('tray_desktop_tasks',{},h);
		var h = info.infoContainer;

		var fd = $C('DIV',{className:'taskNode','.height':0},h);
		var c = $C('DIV',{className:'taskMargin'},fd);
		$C('DIV',{className:'title',innerHTML:task.name},c);
		var info = $C('DIV',{className:'info'},c);
		var pbar = $C('DIV',{className:'progressBar'},c);
		var pbgr = $C('DIV',{className:'background'},pbar);
		var pfgr = $C('DIV',{className:'foreground'},pbar);
		eEaseEnter(fd);

		if(task.href){
			var xhr = new XMLHttpRequest();
			xhr.open('POST',task.href,true);
			xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
			xhr.send($toUrl(task.params));
			var offset = 0;
			var timer = window.setInterval(function(){
				if(xhr.readyState == XMLHttpRequest.DONE){
					window.clearTimeout(timer);_tasks.taskParseCommand('{"command":"processEnd"}',pbar);
					eEaseLeave(fd,{'callback':function(el){el.parentNode.removeChild(el);_tasks.taskCleanUp();}});
				}
				var text = xhr.responseText.substr(offset);
				if(!isEmpty(text)){var cmds = text.split("\n");$each(cmds,function(k,v){
					if(isEmpty(v)){return false;}
					if(v.substr(0,1) != '{'){/*FIXME: informar del error*/alert(v);return;}
					_tasks.taskParseCommand(v,pbar);
				});}
				offset = xhr.responseText.length;
			},1000);
		}

		info_reflow(info);
	},
	taskParseCommand: function(str,progressBar){
		var json = jsonDecode(str);
		if(!json || json.errorDescription){return false;}
		if(!json.command){return false;}

		switch(json.command){
			case 'processTotal':
				progressBar.setAttribute('data-total',json.total);
				progressBar.setAttribute('data-count',0);
				progressBar.$L('foreground')[0].style.width = '0%';
				break;
			case 'processStep':
				var foreground = progressBar.$L('foreground')[0];
				//var indicator = runModule.getElementsByClassName('progressCounter')[0];
				var total = parseInt(progressBar.getAttribute('data-total'));
				var count = parseInt(progressBar.getAttribute('data-count'));
				count++;
				var percentage = ((count/total)*100);
				progressBar.setAttribute('data-count',count);
				foreground.style.width = percentage+'%';
				//indicator.innerHTML = $round(percentage)+'%';
				break;
			case 'processEnd':
				var foreground = progressBar.$L('foreground')[0];
				foreground.style.width = '100%';
				break;
		}
	},
	taskCleanUp: function(){
		var info = $_('info_tray_desktop_tasks');if(!info){return;}
		var h = info.infoContainer;
		if(!h.childNodes.length){info_destroy(info);}
	}
}
