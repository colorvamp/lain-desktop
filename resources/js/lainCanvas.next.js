var _lc = {
	/* blurCompensation: en ocasiones los procesadores de gama baja fallan bastante en operaciones de
	 * doble precisión, por lo que la imágen blur se verá desplazada, más aún con cada sample, este
	 * parámetro se usa para corregir la desviación en cada sample.
	 */
	vars: {blurCompensation:0},
	init: function(){},
	getContext: function(elem){
		if(!elem.tagName && elem.tagName.toUpperCase() != "CANVAS"){return;}
		var ctx = elem.getContext("2d");ctx.canvasWidth = elem.width;ctx.canvasHeight = elem.height;
		ctx = extend(ctx,{
			$arc: function(x,y,radius,startAngle,endAngle,anticlockwise){this.arc(x,y,radius,startAngle,endAngle,anticlockwise);return this;},
			$at: function(obj){for(var o in obj){this[o] = obj[o];}return this;},
			$beginPath: function(){this.beginPath();return this;},
			$bezierCurveTo: function(cp1x,cp1y,cp2x,cp2y,x,y){this.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,x,y);return this;},
			$clip: function(){this.clip();return this;},
			$closePath: function(){this.closePath();return this;},
			$createLinearGradient: function(x1,y1,x2,y2,start,end){var g = this.createLinearGradient(x1,y1,x2,y2);g.addColorStop(0,start);g.addColorStop(1,end);this.fillStyle = g;return this;},
			$drawImage: function(img,sx,sy,sw,sh,dx,dy,dw,dh){var args = this.$drawImage.arguments;this.drawImage.apply(this,args);return this;},
			$empty: function(offsetTop,offsetRight,offsetBottom,offsetLeft){
				offsetTop = parseFloat(offsetTop) || 0;offsetRight = parseFloat(offsetRight) || 0;offsetBottom = parseFloat(offsetBottom) || 0;offsetLeft = parseFloat(offsetLeft) || 0;
				this.clearRect(0+offsetLeft,0+offsetTop,this.canvasWidth+offsetRight,this.canvasHeight+offsetBottom);return this;
			},
			$fill: function(){this.fill();return this;},
			$fillRect: function(x,y,width,height){this.fillRect(x,y,width,height);return this;},
			$fillText: function(text,x,y,limit){if(!limit){limit = false;}this.fillText(text,x,y,limit);return this;},
			$horizontalLine: function(y){this.$beginPath().$moveTo(0,y-1).$lineTo(this.canvasWidth,y-1).$lineTo(this.canvasWidth,y).$lineTo(0,y).$closePath().$fill();return this;},
			$lineTo: function(x,y){this.lineTo(x,y);return this;},
			$moveTo: function(x,y){this.moveTo(x,y);return this;},
			$restore: function(){this.restore();return this;},
			$save: function(){this.save();return this;},
			$scale: function(x,y){this.scale(x,y);return this;},
			$stroke: function(){this.stroke();return this;},
			$strokeText: function(text,x,y){this.strokeText(text,x,y);return this;},
			$translate: function(x,y){this.translate(x,y);return this;},
			$textBox: function(x,y,text,lineLengths,textAlign,fontSize,lineHeight){return _lc.textBox(this,x,y,text,lineLengths,textAlign,fontSize,lineHeight);}
		});
		return ctx;
	},
	newImage: function(src,callback){var img = new Image();img.onload = function(){callback(img);};img.src = src;},
	renderHTML: function(el,canvas){
		var ths = this;
		if(!canvas){canvas = $C('CANVAS',{'.position':'absolute','.left':'-1px','.top':'50px'});}
		var p = $getOffsetPosition(el);
		canvas.$B({'width':p.width,'height':p.height});
		var ctx = this.getContext(canvas);
		var st = window.getComputedStyle(el,null);
		var canvasOffsets = {'top':0,'right':0,'bottom':0,'left':0};
		/* Border */
		if(!isEmpty(st.borderTopWidth)){ctx.$at({fillStyle:st.borderTopColor}).$fillRect(0,0,canvas.width,parseInt(st.borderTopWidth));}
		if(!isEmpty(st.borderRightWidth)){var v = parseInt(st.borderRightWidth);canvasOffsets.right = v;ctx.$at({fillStyle:st.borderRightColor}).$fillRect((canvas.width-v),0,canvas.width,canvas.height);}
		if(!isEmpty(st.borderBottomWidth)){var v = parseInt(st.borderBottomWidth);ctx.$at({fillStyle:st.borderBottomColor}).$fillRect(0,canvas.height-v,canvas.width,canvas.height);}
		if(!isEmpty(st.borderLeftWidth)){var v = parseInt(st.borderLeftWidth);canvasOffsets.left = v;ctx.$at({fillStyle:st.borderLeftColor}).$fillRect(0,0,v,canvas.height);}
//FIXME: si hay borde, hay que establecer offsets

		var style = {textBaseline:'top'};
		var fontFamily = st.getPropertyValue('font-family');
		var fontSize = st.getPropertyValue('font-size');
		if(!isEmpty(fontFamily) && !isEmpty(fontSize)){style.font = fontSize+' '+fontFamily;}
		ctx.$at(style);
		var lineHeight = parseInt(st.getPropertyValue('line-height'));
//FIXME: hardcoded
		var textAlign = 'justify';

		//FIXME: calcular los 
		$each(el.childNodes,function(k,v){
			//Calcular x e y con offsetLeft y cosas así
			if(v.nodeType == 3){ctx.$textBox(canvasOffsets.left,1,v.nodeValue,[(canvas.width-canvasOffsets.left-canvasOffsets.right)],textAlign,fontSize,lineHeight);}
			else{var aux = ths.renderHTML(v);ctx.$drawImage(aux,v.offsetLeft,v.offsetTop,aux.width,aux.height);}
		});

		//el.appendChild(canvas);
		return canvas;
	},
	textBox: function(ctx,x,y,text,lineLengths,textAlign,fontSize,lineHeight){
		var words = $A(text.split(' ')).cleanEmptyValues();
		var numWords = words.length;
		fontSize = parseInt(fontSize);
		lineHeight = parseInt(lineHeight);
		var lineHeightDiff = lineHeight-fontSize;

		var index = 0;
		var offsetTop = y+(Math.ceil(lineHeightDiff/2));
		var lineLimit = lineLengths[0];
		var spaceMeasure = ctx.measureText(' ').width;
		while(words[index]){
			if(lineLengths[index]){lineLimit = lineLengths[index];}
			var lineWords = 0;
			var lineWidth = 0;
			var lineString = '';
			var wordMeasures = [];

			while(words[index] && lineWidth < lineLimit){
				var wordWidth = ctx.measureText(words[index]).width;
				if(isEmpty(lineString)){lineString += words[index];lineWidth = wordWidth;index++;lineWords++;wordMeasures.push(wordWidth);continue;}

				lineWidth += spaceMeasure+wordWidth;
				if(lineWidth > lineLimit){continue;}

				lineString += ' '+words[index];index++;lineWords++;
				wordMeasures.push(wordWidth);
			}

			/* Debemos ver si lo que sobra lo podemos distribuir entre los espacios, hay que ver el número de espacios 
			 * disponibles. Si hay que repartir espacio sobrante sólo podemos usar un porcentage del mismo sobre las 
			 * separaciones entre palabras. */
			var withoutSpaces = 0;for(var a in wordMeasures){withoutSpaces += wordMeasures[a];}
			//var withoutSpaces = ctx.measureText(lineString.replace(/ /g,"")).width;
			var space2realloc = lineLimit-withoutSpaces;
			var unitarySpace = space2realloc/(lineWords-1);
			//if(space2realloc/){}
			/* Si es la última línea no hay justificación */
			if(index >= numWords){unitarySpace = spaceMeasure;}

			var lineWords = lineString.split(' ');
			var offsetLeft = x;
			$A(lineWords).each(function(el,n){
				ctx.$fillText(el,offsetLeft,offsetTop);
				offsetLeft += (wordMeasures[n]+unitarySpace);
			});

			offsetTop += lineHeight;
		}

		return ctx;
	},
	image_resize: function(src,width,height,adjust,callback){return this.imageResize(src,width,height,adjust,callback);},
	imageResize: function(src,width,height,adjust,callback){
		this.newImage(src,function(img){
			var $maxWidth = width;var $maxHeight = height;var $imgWidth = img.width;var $imgHeight = img.height;
			$imgRatio = $imgWidth/$imgHeight;$maxRatio = $maxWidth/$maxHeight;

			switch(adjust){
				case 'max':if($imgRatio>$maxRatio){$maxHeight = $imgHeight * ($maxWidth/$imgWidth);}else{$maxWidth = $imgWidth * ($maxHeight/$imgHeight);}break;
				case 'min':if($imgRatio>$maxRatio){$maxWidth = $imgWidth * ($maxHeight/$imgHeight);}else{$maxHeight = $imgHeight * ($maxWidth/$imgWidth);}break;
				case 'none':break;
				default:return;
			}

			if(width > $maxWidth){width = $maxWidth;}
			if(height > $maxHeight){height = $maxHeight;}

			var canvas = $C('CANVAS',{'width':width,'height':height});var ctx = this.getContext(canvas);

			$offsetLeft = (width - $maxWidth)/2;
			$offsetTop = (height - $maxHeight)/2;
			ctx.drawImage(img,$offsetLeft,$offsetTop,$maxWidth,$maxHeight);

			try{callback(canvas.toDataURL('image/png'));}
			catch(e){alert('Cant load cross-domain images : '+e);}
		}.bind(this));
	},
	imageBlur: function(img,passes){
		if(!passes){passes = 2;}
		var canvas = $C('CANVAS',{width:img.width,height:img.height});
		var ctx = this.getContext(canvas).$drawImage(img,0,0);
		img = ctx.getImageData(0,0,img.width,img.height);
		var i,j,k,n,w = img.width,h = img.height,im = img.data,rounds = passes || 0,pos = step = jump = inner = outer = arr = 0;
		for(n=0;n<rounds;n++){for(var m=0;m<2;m++){
			outer = h;inner = w;step = 4;
			if(m){outer = w;inner = h;step = w*4;}
			for(i=0;i<outer;i++){jump = m === 0 ? i*w*4 : 4*i;for(k=0;k<3;k++){
				pos = jump+k;arr = 0;arr = im[pos]+im[pos+step]+im[pos+step*2];im[pos] = Math.floor(arr/3);arr += im[pos+step*3];im[pos+step] = Math.floor(arr/4);
				arr += im[pos+step*4];im[pos+step*2] = Math.floor(arr/5);
				for(j = 3; j < inner-2; j++){arr = Math.max(0,arr-im[pos+(j-2)*step]+im[pos+(j+2)*step]);im[pos+j*step] = Math.floor(arr/5);}
				arr -= im[pos+(j-2)*step];im[pos+j*step] = Math.floor(arr/4);arr -= im[pos+(j-1)*step];im[pos+(j+1)*step] = Math.floor(arr/3);
			}}
		}}
		ctx.putImageData(img,0,0);
		return canvas.toDataURL('image/png');
		return img;
	},
	blurEffect: function(r,samples){
		if(!samples){samples = 2;}
		var blur = $C('canvas',{width:r.width,height:r.height});var bctx = this.getContext(blur);bctx.drawImage(r,0,0);
		var aux = $C('canvas',{width:r.width,height:r.height});var actx = this.getContext(aux);

		var pW = r.width/2;var pH = r.height/2;
		/* blurCompensation normalmente debe ser 0 */
		for(var i = 0;i<samples;i++){actx.drawImage(blur,0,0,pW,pH);bctx.$empty().drawImage(aux,0,0,pW,pH,0,0,r.width,r.height);}
		return blur;
	}
};
