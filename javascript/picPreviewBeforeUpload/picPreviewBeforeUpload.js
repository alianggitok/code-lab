//Picture preview on local when upload by jQuery.
//Warren Chen
//2013-9-6

function picPreviewBeforeUpload(inputObj,previewObj,previewObjWidth,blankSrcforIE) {//图片上传前的本地预览
	var Browser_Name = navigator.appName;
	var is_IE = (Browser_Name == "Microsoft Internet Explorer");
	var url='';
	previewObj.hide();
	if (is_IE) {
		// IE
		url=inputObj.value;
		previewObj.parent().append('<div class="fixImgSizeRef"></div>');
		previewObj.siblings('.fixImgSizeRef').css({
			"position":"absolute",
			"z-index":"1000",
			"width":"100%",
			"height":"100%",
			'filter':'progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled="true",sizingMethod="image",src=\"'+url+'\")',
			"visibility":"hidden"
		}).hide('300',function(){
			var oWidth=previewObj.siblings('.fixImgSizeRef').width();
			var oHeight=previewObj.siblings('.fixImgSizeRef').height();
			var sizeRateWH=oWidth/oHeight;
			previewObj.attr('src',blankSrcforIE).css({
				'width':(previewObjWidth=='auto'?oWidth:previewObjWidth)+'px',
				'height':(previewObjWidth=='auto'?oHeight:(previewObjWidth/sizeRateWH))+'px',
				'filter':'progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled="true",sizingMethod="scale",src=\"'+url+'\")'
			});
		});
	}else{
		// Use HTML5 feature when not ie.
		if(inputObj.files&&inputObj.files[0]){
			var reader=new FileReader();
			reader.onload=function(){
				url=this.result;
				previewObj.attr('src',url).width(previewObjWidth);
			};
			reader.readAsDataURL(inputObj.files[0]);
		};
	};
	previewObj.show();
};