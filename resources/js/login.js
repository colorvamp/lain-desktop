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
	var user = el.$P({'className':'user'});if(!user){return;}
	if(parseInt(user.getAttribute('data-expanded')) || el.eEaseH){return;}
	user.setAttribute('data-expanded',1)
	var loginBox = $_('loginBox',{'.visibility':'hidden'});
	eEaseHeight(el,64,function(el){
		user.appendChild(loginBox);
		eFadein(loginBox,function(loginBox){loginBox.$T('INPUT')[0].focus();});
	});
}
