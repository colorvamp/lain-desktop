window.addEventListener('load',function(){
	var table = new widget('_wodTable');
	$_('test').appendChild(table);
	table.columns.add({'columnName':'test1'});
	table.columns.add({'columnName':'test2'});
	table.rows.add(['value1','value2']);
	table.rows.add(['value3','value4']);
	table.rows.add(['value5','value6']);
	table.rows.add(['value7','value8']);
	table.rows.add(['value9','value10']);
	table.rows.add(['value11','value12']);
	table.rows.add(['value13','value14']);
	table.rows.add(['value15','value16']);
	table.rows.add(['value17','value18']);
},false);

