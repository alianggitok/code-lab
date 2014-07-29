/*========================================================*/
//	lightbox 1.0
//	Depend on jQuery v1.7.2+
//	Code by Warren Chen on 2014-7-9
//	已知问题：样式调整
/*========================================================*/

;(function ($) {

	$.fn.lightBox = function lightBox(options){
		console.log('===>'+lightBox.name)
		var defaults={
				box:'.lightbox',/*主 class 名*/
				boxWrapper:'.wrapper',/*盒子 class 名*/
				picHolder:'.picholder',/*图片占位层 class 名*/
				origPicSrcAttr:'href',/*原图src属性名*/
				mask:true,/*是否开启遮罩层*/
				masker:'.masker',/*遮罩层 class 名*/
				maskerBgColor:'#000',/*是否开启遮罩层*/
				maskerZIndex:1001,/*遮罩层层级*/
				maskerOpacity:.5,/*遮罩透明度*/
				navPrevHTML:'<div class="nav nav-prev"></div>',/*导航上一张触发层 HTML*/
				navNextHTML:'<div class="nav nav-next"></div>',/*导航下一张触发层 HTML*/
				btnPrevHTML:'<a class="btn" title="上一张"><i class="ico"></i>上一张</a>',/*导航翻上一张按钮 HTML*/
				btnNextHTML:'<a class="btn" title="下一张">下一张<i class="ico"></i></a>',/*导航翻下一张按钮 HTML*/
				btnCloseHTML:'<a class="btn btn-close" title="关闭"><i class="ico"></i>关闭</a>',/*关闭按钮 HTML*/
				ref:window,/*定位及尺寸参照元素对象*/
				refPaddingFixX:10,/*定位及尺寸参照元素的内边距修正*/
				refPaddingFixY:10,/*定位及尺寸参照元素的内边距修正*/
				effectDuration:300,/*动画持续时长*/
				checkFreq:200,/*检查图片状态的频率*/
				picResize:true/*是否随参照元素调整图片大小（等比例）*/
			},
			opts=$.extend(defaults,options),
			boxHTML=''+
				'<div class="'+opts.box.replace('.','')+'">'+
				'	<div class="'+opts.boxWrapper.replace('.','')+'">'+
				'		<div class="'+opts.picHolder.replace('.','')+'"><div class="loader"></div></div>'+
				'		<div class="info">'+
				'			<div class="tit"></div>'+
				'			<div class="page"></div>'+
				'		</div>'+
				'		<div class="exec"></div>'+
				'	</div>'+
				'</div>',
			_box=$(boxHTML),
			_boxWrapper=_box.find(opts.boxWrapper),
			_ref=$(opts.ref),
			_refProto=_ref.get(0),
			_picHolder=_box.find(opts.picHolder),
			_img=$('<img class="pic" src="" alt="">'),
			_imgProto=_img.get(0),
			_loader=_picHolder.find('.loader'),
			_title=_box.find('.info .tit'),
			_page=_box.find('.info .page'),
			_exec=_box.find('.exec'),
			_prev=$(opts.navPrevHTML),
			_btnPrev=$(opts.btnPrevHTML),
			_next=$(opts.navNextHTML),
			_btnNext=$(opts.btnNextHTML),
			_btnClose=$(opts.btnCloseHTML),
			maskerCSS='position:absolute; display:none; padding:0; margin:0; border:none; top:0; left:0; width:auto; height:auto',
			maskerHTML='<div class="'+opts.masker.replace('.','')+'" style="'+maskerCSS+'"></div>',
			_masker=$(maskerHTML),
			_trigger=$(this),
			triggerSelector=$(this).selector,
			triggerLen=_trigger.length,
			current=0,
			refTop=0,
			refLeft=0,
			refWidth=0,
			refHeight=0,
			origPicSrc=[],
			title=[],
			picOrigWidth=0,
			picOrigHeight=0,
			picWidth=0,
			picHeight=0,
			picScaleX=1,
			picScaleY=1,
			checkPicLoadStatus=null,
			boxResizeDelay=null,
			boxPositionDelay=null,
			loadedFixDelay=null,
			events={};

		for(var i=0; i<triggerLen; i++){
			origPicSrc[i]=_trigger.eq(i).attr(opts.origPicSrcAttr);
			title[i]=_trigger.eq(i).attr('title');
		}

		console.log(
			'selector: '+triggerSelector+'\n'+
			'title: '+title+'\n'+
			'origPicSrc:'+origPicSrc
		);

		/********** functions **********/
		function init(){
			clearInterval(checkPicLoadStatus);
			clearTimeout(boxResizeDelay);
			clearTimeout(boxPositionDelay);
			clearTimeout(loadedFixDelay);
			_img.attr('src','');
			_img.css({
				'width':'auto',
				'height':'auto'
			});
		}
		function checkKey(key,currentKey){
			var keyLen=key.length;
			for(var i=0; i<keyLen; i++){
				if(currentKey===key[i]){
					return true;
				}
			}
		}
		function isLoaded(obj){
			console.log(
				'checking: '+
				'[obj.complete: '+obj.complete+'], '+
				'[obj.readyState: '+obj.readyState+'], '+
				'[obj.readyState: '+obj.readyState+']'
			);
			return obj.complete || obj.readyState === 'complete' || obj.readyState === 'loaded';
		}
		function boxInit(current){
			init();
			if(opts.picResize){
				if(opts.ref===window){
					$('html').css('overflow','hidden');
				}else{
					_ref.css('overflow','hidden');
				}
			};
			var trigger=_trigger.eq(current);
			_trigger.removeClass('current');
			trigger.addClass('current');
			if(opts.mask){
				_masker.css({
					'display':'none',
					'background-color':opts.maskerBgColor,
					'z-index':opts.maskerZIndex
				}).appendTo('body');
			}
			maskerPosition();
			maskerResize();
			_btnClose.appendTo(_exec);
			_prev.appendTo(_boxWrapper).append(_btnPrev);
			_next.appendTo(_boxWrapper).append(_btnNext);
			$(opts.box).removeClass('active');
			_box.addClass('active').css({
				'display':'none',
				'position':'absolute',
				'top':trigger.offset().top,
				'left':trigger.offset().left,
				'z-index':Number(opts.maskerZIndex)+1
			}).appendTo('body');
			var width=trigger.width()-(_box.outerWidth()-_box.width()),
				height=trigger.height()-(_box.outerHeight()-_box.height());
			_picHolder.css({
				'width':width+'px',
				'height':height+'px',
				'line-height':height+'px',
				'text-align':'center',
				'vertical-align':'middle',
				'font-size':'0'
			});
			_boxWrapper.children().not(_picHolder).css('display','none');
			_img.css({
				'display':'none',
				'vertical-align':'middle',
				'-ms-interpolation-mode':'bicubic'
			}).appendTo(_picHolder);
			_loader.css({
				'display':'none'
			});
			_btnPrev.css({
				'display':'none'
			});
			_btnNext.css({
				'display':'none'
			});
		}
		function navInit(navRefWidth,navRefHeight){
			_prev.stop(false,true).animate({
				'width':navRefWidth*0.5+'px',
				'height':navRefHeight+'px',
				'line-height':navRefHeight+'px'
			},opts.effectDuration,function(){
				if(_prev.width()<_btnPrev.outerWidth()||_prev.height()<_btnPrev.outerHeight()){
					_btnPrev.hide();
				}
			});
			_next.stop(false,true).animate({
				'width':navRefWidth*0.5+'px',
				'height':navRefHeight+'px',
				'line-height':navRefHeight+'px'
			},opts.effectDuration,function(){
				if(_next.width()<_btnNext.outerWidth()||_next.height()<_btnNext.outerHeight()){
					_btnNext.hide();
				}
			});
			if(current<=0){
				_btnPrev.hide();
			}
			if(current>=triggerLen-1){
				_btnNext.hide();
			}
		}
		function boxResize(picOrigWidth,picOrigHeight){
			var picPaddingX=_box.outerWidth()-_picHolder.width(),
				picPaddingY=_box.outerHeight()-_picHolder.height(),
				boxWidth=picPaddingX+picOrigWidth,
				boxHeight=picPaddingY+picOrigHeight;
			refWidth=_ref.outerWidth()-opts.refPaddingFixX*2;
			refHeight=_ref.outerHeight()-opts.refPaddingFixY*2;
			function getWidth(){
				picWidth=refWidth-picPaddingX;
				picScaleX=picWidth/picOrigWidth;
				picHeight=picOrigHeight*picScaleX;
			}
			function getHeight(){
				picHeight=refHeight-picPaddingY;
				picScaleY=picHeight/picOrigHeight;
				picWidth=picOrigWidth*picScaleY;
			}
			if(opts.picResize){
				if(boxWidth>=refWidth){
					getWidth();
					if(picHeight>=refHeight-picPaddingY){
						getHeight();
					}
				}
				if(boxHeight>=refHeight){
					getHeight();
					if(picWidth>=refWidth-picPaddingX){
						getWidth();
					}
				}
				if(boxWidth<refWidth&&boxHeight<refHeight){
					picWidth=picOrigWidth;
					picHeight=picOrigHeight;
				}
			}else{
				picWidth=picOrigWidth;
				picHeight=picOrigHeight;
			}
			_picHolder.stop(false,true).animate({
				'width':picWidth+'px',
				'height':picHeight+'px',
				'line-height':picHeight+'px'
			},opts.effectDuration);
			_img.stop(false,true).animate({
				'width':picWidth+'px',
				'height':picHeight+'px'
			},opts.effectDuration);
			navInit(picWidth,picHeight);
		}
		function boxPosition(picWidth,picHeight){
			refWidth=_ref.outerWidth();
			refHeight=_ref.outerHeight();
			var boxWidth=_box.outerWidth()-_picHolder.outerWidth()+picWidth,
				boxHeight=_box.outerHeight()-_picHolder.outerHeight()+picHeight,
				boxTop=(boxHeight>refHeight?_ref.scrollTop():(refHeight-boxHeight)/2+_ref.scrollTop())+refTop,
				boxLeft=(boxWidth>refWidth?_ref.scrollLeft():(refWidth-boxWidth)/2+_ref.scrollLeft())+refLeft;

			_box.stop(false,true).animate({
				'left':boxLeft,
				'top':boxTop
			},opts.effectDuration);
		}
		function maskerPosition(){
			refTop=_refProto.hasOwnProperty('offsetTop')?_ref.offset().top:0;
			refLeft=_refProto.hasOwnProperty('offsetLeft')?_ref.offset().left:0;
			if(opts.mask){
				_masker.css({
					'top':_ref.scrollTop()+refTop+'px',
					'left':_ref.scrollLeft()+refLeft+'px'
				});
			};
		}
		function maskerResize(){
			refWidth=_ref.outerWidth();
			refHeight=_ref.outerHeight();
			if(opts.mask){
				_masker.css({
					'width':refWidth+'px',
					'height':refHeight+'px'
				});
			};
		}
		function changePic(current){
			console.log('===>'+current+': '+origPicSrc[current]);
			_loader.stop(false,true).fadeIn(opts.effectDuration);
			_trigger.removeClass('current').eq(current).addClass('current');
			_img.stop(false,true).fadeOut(opts.effectDuration,function(){
				init();
				_img.attr('src',origPicSrc[current]);
				checkPicLoadStatus=setInterval(function(){
					if(isLoaded(_imgProto)){
						picOrigWidth=picWidth=_img.outerWidth();
						picOrigHeight=picHeight=_img.outerHeight();
						maskerPosition();
						maskerResize();
						loadedFixDelay=setTimeout(function(){
							console.log(picOrigWidth+', '+picOrigHeight);
							_boxWrapper.children().not(_picHolder).show();
							_loader.stop(false,true).fadeOut(opts.effectDuration);
							_img.stop(false,true).show(opts.effectDuration);
							boxResize(picOrigWidth,picOrigHeight);
							boxPosition(picWidth,picHeight);
							if(opts.picResize){
								events.refScrollBoxPosition();
							}
							if(opts.mask){
								events.refScrollMaskerPosition();
							}
							events.windowResize();
							events.keyBoardNav();
							events.bindElementEvents();
						},opts.checkFreq);
						clearInterval(checkPicLoadStatus);
						checkPicLoadStatus=null;
					}
				},opts.checkFreq);
			});
			_title.html(title[current]);
			_page.html(current+1+'/'+triggerLen);
		}

		function open(current){
			boxInit(current);
			if(opts.mask){
				_masker.stop(false,true).fadeTo(opts.effectDuration,opts.maskerOpacity);
			}
			_box.stop(false,true).fadeTo(opts.effectDuration,1);
			var otherBoxs=_box.siblings(opts.box),
				otherMasker=_masker.siblings(opts.masker);
			if(otherBoxs.length<1){
				changePic(current);
			}else{
				close(otherBoxs,otherMasker,function(){
					changePic(current);
				});
			}
			events.keyBoardEsc();
		}
		function prev(){
			if(current<=0){
				return false;
			}
			changePic(current-=1);
		}
		function next(){
			if(current+1>=triggerLen){
				return false;
			}
			changePic(current+=1);
		}
		function close(boxObj,maskerObj,callback){
			boxObj=typeof(boxObj)==='undefined'?_box.siblings(opts.box).andSelf():boxObj;
			maskerObj=typeof(maskerObj)==='undefined'?_masker.siblings(opts.masker).andSelf():maskerObj;
			callback=typeof(callback)!=='function'?function(){}:callback;
			events.clearEvents();
			boxObj.stop(false,true).fadeOut(opts.effectDuration,function(){
				boxObj.removeClass('active').remove();
				boxObj.prev(opts.box).addClass('active');
				if(opts.picResize){
					if(opts.ref===window){
						$('html').css('overflow','auto');
					}else{
						_ref.css('overflow','auto');
					}
				}
				init();
				console.log('closed');
				callback();
			});
			if(opts.mask){
				maskerObj.stop(false,true).fadeOut(opts.effectDuration,function(){
					maskerObj.remove();
				});
			}else{
				$(opts.masker).stop(false,true).fadeOut(opts.effectDuration,function(){
					$(opts.masker).remove();
				});
			}
		}

		/********** events **********/
		events={
			windowResize:function(){
				$(window).off('resize.lightbox-resize').on({
					'resize.lightbox-resize':
					function(){
						maskerResize();
						maskerPosition();
						clearTimeout(boxResizeDelay);
						clearTimeout(boxPositionDelay);
						boxResizeDelay=setTimeout(function(){
							boxResize(picOrigWidth,picOrigHeight);
						},100);
						boxPositionDelay=setTimeout(function(){
							boxPosition(picWidth,picHeight);
						},100);
					}
				});
			},
			refScrollBoxPosition:function(){
				_ref.off('scroll.lightbox-boxPosition').on({
					'scroll.lightbox-boxPosition':
					function(){
						clearTimeout(boxPositionDelay);
						boxPositionDelay=setTimeout(function(){
							boxPosition(picWidth,picHeight);
						},100);
						maskerPosition();
					}
				});
			},
			refScrollMaskerPosition:function(){
				_ref.off('scroll.lightbox-maskerPosition').on({
					'scroll.lightbox-maskerPosition':
					function(){
						maskerPosition();
					}
				});
			},
			keyBoardNav:function(){
				$(document).off('keydown.lightbox-keyBoardNav').on({
					'keydown.lightbox-keyBoardNav':
					function(e){
						var keyCode=e.which||e.keyCode;
						if(keyCode===37){
							prev();
						}else if(keyCode===39){
							next();
						}
						if(checkKey([33,34,35,36,37,38,39,40],keyCode)){
							e.preventDefault();
						}
					}
				});
			},
			keyBoardEsc:function(){
				$(document).off('keydown.lightbox-keyBoardEsc').on({
					'keydown.lightbox-keyBoardEsc':
					function(e){
						var keyCode=e.which||e.keyCode;
						if(keyCode===27){
							close();
						}
						if(checkKey([27],keyCode)){
							e.preventDefault();
						}
					}
				});
			},
			bindElementEvents:function(){
				_btnClose.off('click.lightbox').on({
					'click.lightbox':
					function(e){
						close();
						e.preventDefault();
					}
				});
				_btnPrev.off('click.lightbox').on({
					'click.lightbox':
					function(e){
						prev();
						e.preventDefault();
					}
				});
				_btnNext.off('click.lightbox').on({
					'click.lightbox':
					function(e){
						next();
						e.preventDefault();
					}
				});
				_prev.off('mouseenter.lightbox mouseleave.lightbox').on({
					'mouseenter.lightbox':
					function(){
						if(current>0){
							_btnPrev.stop(false,true).fadeIn(opts.effectDuration);
						}
					},
					'mouseleave.lightbox':
					function(){
						_btnPrev.stop(false,true).fadeOut(opts.effectDuration);
					}
				});
				_next.off('mouseenter.lightbox mouseleave.lightbox').on({
					'mouseenter.lightbox':
					function(){
						if(current<triggerLen-1){
							_btnNext.stop(false,true).fadeIn(opts.effectDuration);
						}
					},
					'mouseleave.lightbox':
					function(){
						_btnNext.stop(false,true).fadeOut(opts.effectDuration);
					}
				});
			},
			clearEvents:function(){
				$(window).off('resize.lightbox-resize');
				_ref.off('scroll.lightbox-boxPosition scroll.lightbox-maskerPosition');
				$(document).off('keydown.lightbox-keyBoardEsc keydown.lightbox-keyBoardNav');
				_btnClose.off('.lightbox');
				_btnPrev.off('.lightbox');
				_btnNext.off('.lightbox');
				_prev.off('.lightbox');
				_next.off('.lightbox');
			}
		};

		/********** exec **********/
		_trigger.off('click.lightbox').on('click.lightbox',function(e){
			current=$(this).index(triggerSelector);
			open(current);
			e.preventDefault();
		});


	};

} (jQuery));

