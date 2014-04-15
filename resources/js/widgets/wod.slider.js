widgets.wodSlider = {
	init: function(params){
		if(!params){params = {};}
		var wodSlider = $C('DIV',{className:'wodSlider',
			'vars': {'mode':false,'steps':false,'percentage':false,'min':false,'max':false}
		});
		var con = $C('DIV',{className:'slider'},wodSlider);
		var bar = $C('DIV',{className:'bar'},con);
		var point = $C('DIV',{className:'point'},bar);
//FIXME: reordenar min y max si fuera necesario
		if(params.min){wodSlider.vars.min = params.min;}
		if(params.max){wodSlider.vars.max = params.max;}
		if(params.value && wodSlider.vars.min && wodSlider.vars.max){
			var sample = wodSlider.vars.max-wodSlider.vars.min;
			var current = params.value-wodSlider.vars.min;
			var perc = current/(sample/100);
			widgets.wodSlider.set.percentage(wodSlider,perc);
		}
		if(params.steps && (wodSlider.vars.steps = parseInt(params.steps))){
			var steps = $C('DIV',{className:'steps'},wodSlider);
			var i = params.steps-1;
			var w = 100/i;
			while(i--){
				var step = $C('DIV',{className:'step'},steps);
				step.style.width = w+'%';
			}
		}
		point.addEventListener('mouse.down.left',function(e){widgets.wodSlider.signals.mouse.down.left(wodSlider,e);});
		if(!params.mode){wodSlider.vars.mode = 'free';}
//FIXME: necesita un reflow
		return wodSlider;
	},
	set: {
		percentage: function(wodSlider,perc,point){
			if(!point && !(point = wodSlider.querySelector('.point'))){return false;}
			point.parentNode.style.width = perc+'%';
			wodSlider.vars.percentage = perc;
			var event = new CustomEvent('slider.update',{'detail':{'target':wodSlider,'percentage':perc},'bubbles':true,'cancelable':true});
			wodSlider.dispatchEvent(event);
		}
	},
	signals: {
		mouse: {
			down: {
				left: function(wodSlider,e){
					var x = e.detail.clientX;var y = e.detail.clientY;
					var point = e.detail.target;
					var pos = $getOffsetPosition(wodSlider);
					var s = {'startX':x,'startY':y,'h':$_('lainFlowIcon'),'elemX':parseInt(pos.left),'elemY':parseInt(pos.top),'elemW':parseInt(pos.width),'elemH':parseInt(pos.height),'signals':{}};
					point = extend(point,s);
					point.signals.mousemove = function(e){widgets.wodSlider.signals.mouse.drag.move(wodSlider,e,point);};
					point.signals.mouseup   = function(e){widgets.wodSlider.signals.mouse.drag.end(wodSlider,e,point);}
					addEventListener('mousemove',point.signals.mousemove,true);
					addEventListener('mouse.up.left',point.signals.mouseup,true);
				}
			},
			drag: {
				move: function(wodSlider,e,point){
					var x = e.clientX;var y = e.clientY;
					var eL = x - point.elemX;
					eL = (eL/point.elemW)*100;
					if(eL < 0){eL = 0;}
					if(eL > 100){eL = 100;}
					widgets.wodSlider.set.percentage(wodSlider,eL,point);
				},
				end: function(wodSlider,e){
					var point = wodSlider.querySelector('.point');
					removeEventListener('mousemove',point.signals.mousemove,true);
					removeEventListener('mouse.up.left',point.signals.mousemove,true);

//FIXME: usar api para obtener porcentaje
					var x = e.detail.clientX;var y = e.detail.clientY;
					var eL = x - point.elemX;
					eL = (eL/point.elemW)*100;
					if(eL < 0){eL = 0;}
					if(eL > 100){eL = 100;}
					widgets.wodSlider.set.percentage(wodSlider,eL,point);
					var event = new CustomEvent('slider.end',{'detail':{'target':wodSlider,'percentage':eL},'bubbles':true,'cancelable':true});
					wodSlider.dispatchEvent(event);
				}
			}
		}
	}
}
