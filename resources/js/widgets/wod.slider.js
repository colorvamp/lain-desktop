widgets.wodSlider = {
	init: function(params){
		if(!params){params = {};}
		var wodSlider = $C('DIV',{className:'wodSlider',
			'vars': {'steps':false}
		});
		var con = $C('DIV',{className:'slider'},wodSlider);
		var bar = $C('DIV',{className:'bar'},con);
		var point = $C('DIV',{className:'point'},bar);
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
//FIXME: necesita un reflow
		return wodSlider;
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
					point.parentNode.style.width = eL+'%';
					var event = new CustomEvent('slider.update',{'detail':{'target':wodSlider,'percentage':eL},'bubbles':true,'cancelable':true});
					wodSlider.dispatchEvent(event);
				},
				end: function(wodSlider,e){
					var point = wodSlider.querySelector('.point');
					removeEventListener('mousemove',point.signals.mousemove,true);
					removeEventListener('mouse.up.left',point.signals.mousemove,true);
				}
			}
		}
	}
}
