var uaxpUI={
	wordsEllipsis: function(obj,ellipsisSymb,adjustLen){
		adjustLen=(typeof adjustLen=='undefined'?3:adjustLen);
		ellipsisSymb=(typeof ellipsisSymb=='undefined'?'<span class="ua-ellipsissymb">…</span>':ellipsisSymb);
		var n=0;
		function exec(execObj){
			if(n>=$(obj).length){return false};
			execObj=$(obj).eq(n);
			var objMaxHeight=parseInt(execObj.css('max-height'));
			var objHeight=execObj.height();
			var objLineHeight=parseInt(execObj.css('line-height'));
			var heightFix=objHeight/objLineHeight; //lte ie7
			var wrapperClassName='ua-maxlen-wrapper';
			var wrapper='<div class="'+wrapperClassName+'">';
			execObj.wrapInner(wrapper);
			var wrapperObj=execObj.children('.'+wrapperClassName);
			wrapperObj.html(wrapperObj.html().replace(/</g,'&lt;').replace(/>/g,'&gt;'));
		
			setTimeout(function(){
				var len=wrapperObj.html().length;
				while(wrapperObj.height()-heightFix>objHeight||wrapperObj.height()-heightFix>objMaxHeight){
					len--;
					wrapperObj.html(wrapperObj.html().substr(0,len));
					if(wrapperObj.height()-heightFix<=objHeight||wrapperObj.height()-heightFix<=objMaxHeight){
						wrapperObj.html(wrapperObj.html().substr(0,len-adjustLen)+ellipsisSymb);
					};
				};
				execObj.html(wrapperObj.html());
				exec($(obj).eq(n++));
			},10);
		};
		exec($(obj).eq(n));
	}
	
};

