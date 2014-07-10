//========================================================
//	uaLightBox
//	Depend on jQuery v1.7.2+
//	Code by Warren Chen
//	Create date: 2014-7-9
//========================================================

;(function (global) {

	var browserAgent = navigator.userAgent,
		browser = {
			isIE6: function () {
				return (/msie 6/i).test(browserAgent);
			},
			isIE7: function () {
				return (/msie 7/i).test(browserAgent);
			}
		};

	/**********functions**********/

	global.lightBox = function(options){
		
		var defaults=({
				trigger:'.upload-pic .pic a',
				boxClass:'lightbox',
				boxPicClass:'pic',
				origPicSrcAttr:'href',
				navPrevHTML:'<a class="btn nav-prev" title="上一张"><i class="ico"></i></a>',
				navNextHTML:'<a class="btn nav-next" title="下一张"><i class="ico"></i></a>'
			}),
			opts=$.extend(defaults,options),
			_ref=$(window),
			_trigger=$(opts.trigger),
			boxHTML=''+
				'<div class="'+defaults.boxClass+'">'+
				'	<div class="wrapper">'+
				'		<div class="'+defaults.boxPicClass+'">'+
				'			<img src="">'+
				'			'+defaults.navPrevHTML+
				'			'+defaults.navNextHTML+
				'		</div>'+
				'		<div class="info">'+
				'			<span class="tit"></span>'+
				'			<span class="page"></span>'+
				'		</div>'+
				'		<a class="btn btn-close" title="关闭"><i class="ico"></i>关闭</a>'+
				'	</div>'+
				'</div>',
			_box=$(boxHTML),
			_boxPic=_box.find('.'+opts.boxPicClass),
			_boxImg=_boxPic.find('img'),
			_title=_box.find('.info .tit'),
			_page=_box.find('.info .page'),
			_navPrev=_box.find('.pic .nav-prev'),
			_navNext=_box.find('.pic .nav-next'),
			len=_trigger.length,
			current=0,
			bigSrc={},
			title={};
		for(var i=0; i<len; i++){
			bigSrc[i]=_trigger.eq(i).attr(opts.origPicSrcAttr);
			title[i]=_trigger.eq(i).attr('title');
		};

		function boxInit(trigger){
			_box.css({
				'display': 'none',
				'position': 'absolute',
				'top': trigger.offset().top,
				'left': trigger.offset().left
			});
			_boxPic.css({
				'width': trigger.width()+'px',
				'height': trigger.height()+'px'
			});
		};
		function boxFixed(){
			var refHeight=_ref.outerHeight(),
				refWidth=_ref.outerWidth(),
				boxHeight=_box.outerHeight(),
				boxWidth=_box.outerWidth(),
				boxTop=(refHeight-boxHeight)/2,
				boxLeft=(refWidth-boxWidth)/2,
				picOrigWidth=_boxImg.outerWidth(),
				picOrigHeight=_boxImg.outerHeight();
			_boxPic.stop(false,true).animate({
				'width':picOrigWidth+'px',
				'height':picOrigHeight+'px'
			},300);
			_box.stop(false,true).animate({
				'top':boxTop+'px',
				'left':boxLeft+'px'
			},300);
		};

		function change(current){
			_boxImg.attr('src',bigSrc[current]);
			_title.html(title[current]);
			_page.html(current+1+'/'+len);
		};

		_trigger.on('click',function(e){
			current=$(this).index(opts.trigger);
			change(current);
			boxInit($(this));
			_box.appendTo('body').fadeIn();
			boxFixed();
			e.preventDefault();
		});
		_navPrev.on('click',function(){
			if(current<=0){
				return false;
			};
			change(current-=1);
		});
		_navNext.on('click',function(){
			if(current+1>=len){
				return false;
			};
			change(current+=1);
		});

		$(window).off('resize.lightbox').on('resize.lightbox',function(){
			boxFixed();
		});

	};

} (window));

