window.addEventListener('load',function(){
	var table = new widget('_wodTable');
	$_('test').appendChild(table);
	table.columns.add({'columnName':'test1','columnIndex':3},{'columnName':'test2'},{'columnName':'test3','columnIndex':1});
	table.rows.add('value1','value2','value3');
	table.rows.add('value3','value4');
	table.rows.add('value5','value6');
	table.columns.add({'columnName':'test4'});
	table.rows.add('value7','value8');
	table.rows.add('value9','value10');
	table.rows.add('value11','value12');
	table.rows.add('value13','value14');
	table.rows.add('value15','value16');
	table.rows.add('value17','value18');
	table.rows.add('value17','value18');
	table.columns.add({'columnName':'test5'},{'columnName':'test6'},{'columnName':'test7'},{'columnName':'test8'},{'columnName':'test9'},{'columnName':'test10'});
	//*/
},false);

