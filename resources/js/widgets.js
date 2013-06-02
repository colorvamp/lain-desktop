function widget(widgetname,params){
	function w(){};
	w.prototype = window[widgetname];
	var f = new w;
	return f.init(params);
}

var _widgets = {
	getScrollBarWidth: function(){
		var inner = $C('P',{'.width':'100%','.height':'200px'});
		var outer = $C('DIV',{'.position':'absolute','.top':'0px','.left':'0px','.visibility':'hidden','.width':'200px','.height':'150px','.overflow':'hidden'});
		outer.appendChild(inner);document.body.appendChild(outer);var w1 = inner.offsetWidth;outer.style.overflow = 'scroll';var w2 = inner.offsetWidth;if(w1 == w2){w2 = outer.clientWidth;}document.body.removeChild(outer);
		return (w1 - w2);
	}
}

var _wodTable = {
	vars: {},
	init: function(params){
		var wodTable = $C('DIV',{className:'wodTable',
			'thead':false,'tbody':false,
			'vars':{'hasScrollbars':false},
			'reflow': function(params){return _wodTable.reflow(wodTable);},
			'columns':{
				'childs': [],
				'add': function(params){return _wodTable.column_add(wodTable,params);}
			},
			'rows':{
				'childs': [],
				'add': function(params){return _wodTable.row_add(wodTable,params);}
			}
		});
		extend(wodTable,{
			'tbody':$C('DIV',{className:'wodTbody'},wodTable),
		});
		return wodTable;
	},
	reflow: function(wodTable){
		var width = wodTable.tbody.clientWidth;
		wodTable.vars.hasScrollbars = (wodTable.tbody.scrollHeight > wodTable.tbody.clientHeight);

		var reservedWidth = 0;var columnsAuto = 0;
		/* Calculate the reserved space first */
		$each(wodTable.columns.childs,function(k,v){
			if(v.widthCalc == 'auto'){columnsAuto++;return;}
			//TODO
			//reservedWidth -= ..
		});
		width = width-reservedWidth;
		var columnsWidth = width/columnsAuto;
		$each(wodTable.columns.childs,function(k,v){
			if(v.widthCalc != 'auto'){return;}
			//FIXME: habría que convertirlo a porcentaje
			wodTable.columns.childs[k].width = columnsWidth+'px';
		});

		if(wodTable.thead){$each(wodTable.thead.firstChild.childNodes,function(k,v){if(!v.nodeType){return;}v.style.width = wodTable.columns.childs[k].width;});}
		$each(wodTable.rows.childs,function(j,row){$each(row.childNodes,function(k,v){if(!v.nodeType){return;}v.style.width = wodTable.columns.childs[k].width;});});
	},
	header_add: function(wodTable){var el = $C('DIV',{className:'wodThead'});$C('DIV',{className:'wodTr'},el);wodTable.insertBefore(el,wodTable.firstChild);wodTable.thead = el;},
	column_add: function(wodTable,params){
		/* params = {'columName':'TEXT','columnIndex':'INTEGER'} */
		//FIXME: comprobar args
		if(params.columnName && !wodTable.thead){_wodTable.header_add(wodTable);}
		//FIXME: no hacemos push si hay undex
		extend(params,{'widthCalc':'auto'});// auto | fixed
		wodTable.columns.childs.push(params);
		if(params.columnName){$C('DIV',{className:'wodTd',innerHTML:params.columnName},wodTable.thead.firstChild);}

		wodTable.reflow();
		return true;
	},
	row_add: function(wodTable,params){
		/* params = ['value-1','value-n'] */
		var tr = $C('DIV',{className:'wodTr'},wodTable.tbody);
		$each(params,function(k,v){$C('DIV',{className:'wodTd','.width':wodTable.columns.childs[k].width,innerHTML:v},tr);});
		//FIXME: no hacemos push si hay undex
		wodTable.rows.childs.push(tr);

		var hasScrollbars = (wodTable.tbody.scrollHeight > wodTable.tbody.clientHeight);
		if(hasScrollbars != wodTable.vars.hasScrollbars){wodTable.reflow();}
	}
};
