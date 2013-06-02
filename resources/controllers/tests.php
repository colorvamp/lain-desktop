<?php
	function tests_main(){

	}

	function tests_table(){
		$TEMPLATE = &$GLOBALS['TEMPLATE'];
		$TEMPLATE['BLOG_SCRIPTS'][] = '{%baseURL%}r/js/tests/table.js';
		common_renderTemplate('tests/table');
	}
?>
