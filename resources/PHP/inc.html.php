<?php
	function html_petition($url,$data = false){
		$context = stream_context_create();

		$uinfo = parse_url(trim($url));
		$port = 80;$scheme = 'tcp';
		if($uinfo['scheme'] == 'https'){
			$scheme = 'ssl';$port = 443;
			$r = stream_context_set_option($context,'ssl','verify_host',true);
			$r = stream_context_set_option($context,'ssl','allow_self_signed',true);
		}
		if(!isset($uinfo['path'])){$uinfo['path'] = '/';}
		$fp = stream_socket_client($scheme.'://'.$uinfo['host'].':'.$port,$errno,$errstr,30,STREAM_CLIENT_CONNECT,$context);
		if(!$fp){return $errstr.' ('.$errno.')';}
		$CR = "\r\n";

		$header = (isset($data['post']) ? 'POST' : 'GET').' '.$uinfo['path'].((isset($uinfo['query']) && !empty($uinfo['query'])) ? '?'.$uinfo['query'] : '').' HTTP/1.1'.$CR.
		'Host: '.$uinfo['host'].$CR.
		'User-Agent: '.'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:10.0.2) Gecko/20100101 Firefox/10.0.2'.$CR.
		(isset($data['acceptLanguage']) ? 'Accept-Language: '.$data['acceptLanguage'].$CR : '').
		'Connection: Close'.$CR.
		(isset($data['referer']) ? 'Referer: '.$data['referer'].$CR : '').
		'Accept-Encoding: deflate'.$CR;

		if(isset($data['cookies']) && count($data['cookies']) > 0){
			$cookieData = '';foreach($data['cookies'] as $cookie){list($key,$value) = each($cookie);$cookieData .= $key.'='.$value.'; ';}
			if($cookieData == ''){$cookieData = substr($cookieData,0,-2);}
			$header .= 'Cookie: '.$cookieData.$CR;
		}

		if(isset($data['post'])){
			$postData = http_build_query($data['post']);
			$header .= 'Content-Type: application/x-www-form-urlencoded'.$CR.
			'Content-Length: '.strlen($postData).$CR;
			unset($data['post']);
		}

		$header .= $CR;
		if(isset($postData)){$header .= $postData;}
//print_r($header)."\n\n\n\n";

		fwrite($fp,$header);$buffer = '';while(!feof($fp)){$buffer .= fgets($fp,1024);}fclose($fp);
		$break = strpos($buffer,$CR.$CR)+4;
		$header = substr($buffer,0,$break);
		$content = substr($buffer,$break);
		unset($buffer);
		if(strpos(strtolower($header),'transfer-encoding: chunked') !== false){$content = html_unchunkHttp11($content);}

		/* Salvando cookies */
		//FIXME: necesitamos ponerle domain
		$cookies = array();$m = preg_match_all('/Set-Cookie: (.*)/',$header,$arr);
		if($m){foreach($arr[0] as $k=>$v){
			$cookie = array();$m = preg_match_all('/([a-zA-Z0-9\-_\.]*)=([^;]+)/',$arr[1][$k],$c);foreach($c[0] as $k=>$v){$cookie[$c[1][$k]] = $c[2][$k];}$cookies[] = $cookie;
		}}
		if(isset($data['cookies'])){$cookies = array_merge($data['cookies'],$cookies);}
		$data['cookies'] = $cookies;
		//print_r($cookies);exit;

		/* Follow Location */
		$m = preg_match('/Location: (.*)/',$header,$arr);
		if($m && isset($data['followLocation']) && $data['followLocation'] === true){
			$uri = $arr[1];if(substr($uri,0,4) != 'http'){$uri = $uinfo['scheme'].'://'.$uinfo['host'].((strpos($arr[1],0,1) == '/') ? '' : '/').$arr[1];}
			return html_petition($uri,$data);
		}

		$r = array('currentURL'=>$url,'pageHeader'=>$header,'pageContent'=>$content,'cookies'=>$cookies);
		if(isset($data['acceptLanguage'])){$r['acceptLanguage'] = $data['acceptLanguage'];}
		return $r;
	}
	function html_unchunkHttp11($data){
		$fp = 0;$outData = '';$CR = "\r\n";
		while($fp < strlen($data)){$rawnum = substr($data,$fp,strpos(substr($data,$fp),$CR)+2);$num = hexdec(trim($rawnum));$fp += strlen($rawnum);$chunk = substr($data,$fp,$num);$outData .= $chunk;$fp += strlen($chunk);}
		return $outData;
	}
?>
