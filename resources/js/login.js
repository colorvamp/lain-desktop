function userLogin(h){
	var h = $fix(h).$P({'className':'user'});if(!h){return;}
	var ops = $parseForm(h);if(ops.userMail.length==0 || ops.userPass.length==0){return;}
	ops.subcommand = 'userLogin';
	ajaxPetition('',$toUrl(ops),function(ajax){var r = jsonDecode(ajax.responseText);
		if(typeof r.errorDescription != 'undefined'){
//FIXME: TODO
alert(ajax.responseText);
return;	
		}
		document.location.reload();
	});
}

function expandAvatar(el){
	if(!el.src.match(/av64.jpg/) || el.eEaseH){return;}
	var user = el.$P({'className':'user'});if(!user){return;}
	var loginBox = $_('loginBox',{'.visibility':'hidden'});
	eEaseHeight(el,64,function(el){
		user.appendChild(loginBox);
		eFadein(loginBox,function(loginBox){loginBox.$T('INPUT')[0].focus();});
	});
return false;
	var imgs = $_('cmsLogin').$T('IMG');
	$A(imgs).each(function(img){if(img != el && img.src.match(/av128.jpg/) && !img.eEaseH){eEaseHeight(img,-64,function(img){img.src = img.src.replace('128','64');});}});
	var userAlias = el.className.match(/zzzzzz[a-z0-9]{18}/);

	var h = el;while(h.parentNode && h.className!='wodTheme'){h = h.parentNode;}if(!h.parentNode){return;}
	h = h.lastChild;while(!h.tagName || h.tagName.toUpperCase() != 'DIV'){h = h.previousSibling;}

	if(!el.src.match(/av64.jpg/) || el.eEaseH){return;}

	var i = $_("info_loginForm",{".visibility":"hidden"});
	var i = info_create('loginForm',{'':'',".visibility":"hidden"},h,"center");
	h = i.infoContainer.empty();

	$C("DIV",{innerHTML:"Introduce tu contraseña"},h);
	$C("INPUT",{name:"user",type:"hidden",value:userAlias},h);
	$C("INPUT",{name:"pass",type:"password",onkeydown:function(e){if(e.keyCode != 13){return true;}userLogin(h);}},$C("DIV",{className:"inputText"},h));
	var btHolder = $C("DIV",{className:"buttonHolder"},h);
	gnomeButton_create("Aceptar",function(){userLogin(i);},btHolder);
	$C("I",{className:"floatSeparator"},btHolder);

	eEaseHeight(el,64,function(el){el.src = el.src.replace('64','128');eFadein(i,function(i){i.$T('INPUT')[1].focus();});});
}
