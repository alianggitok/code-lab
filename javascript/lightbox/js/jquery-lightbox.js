/*========================================================*/
//	lightbox 1.0
//	Depend on jQuery v1.7.2+
//	Code by Warren Chen on 2014-7-9
//	issues：ie6 image resize has faults,
//			全屏下有滚动条时拖拽定位问题
/*========================================================*/

;(function ($) {
	browserAgent=navigator.userAgent,
	browser={
		isIE6: function(){
			return /msie 6/i.test(browserAgent);
		},
		isIE7: function(){
			return /msie 7/i.test(browserAgent);
		},
		isIE8: function(){
			return /msie 8/i.test(browserAgent);
		},
		isIE9: function(){
			return /msie 9/i.test(browserAgent);
		}
	};
	$.fn.lightBox = function lightBox(options){
		//console.log('===>'+lightBox.name)
		var defaults={
				boxClass:'.lightbox',//弹层 class 名
				boxWrapperClass:'.wrapper',//盒子 class 名
				picHolderClass:'.picholder',//图片占位层 class 名
				fullScreen:true,//是否开启全屏展示功能
				fullStageClass:'.lightbox-fullstage',//图片占位层 class 名
				origPicSrcAttr:'href',//原图src属性名
				mask:true,//是否开启遮罩层
				masker:'.masker',//遮罩层 class 名
				maskerBgColor:'#000',//是否开启遮罩层
				maskerZIndex:1001,//遮罩层层级
				maskerOpacity:.5,//遮罩透明度
				navPrevHTML:'<div class="nav nav-prev"></div>',//导航上一张触发层 HTML
				navNextHTML:'<div class="nav nav-next"></div>',//导航下一张触发层 HTML
				btnPrevHTML:'<a class="btn" title="上一张"><i class="ico"></i><span class="tit">上一张</span></a>',//导航翻上一张按钮 HTML
				btnNextHTML:'<a class="btn" title="下一张"><span class="tit">下一张</span><i class="ico"></i></a>',//导航翻下一张按钮 HTML
				btnCloseHTML:'<a class="btn btn-close" title="关闭"><i class="ico"></i><span class="tit">关闭</span></a>',//关闭按钮 HTML
				btnFullHTML:'<a class="btn btn-full" title="全屏"><i class="ico"></i><span class="tit">[全屏]</span></a>',//全屏按钮 HTML
				btnZoomInHTML:'<a class="btn btn-zoomin" title="放大"><i class="ico"></i><span class="tit">放大</span></a>',//全屏下放大按钮 HTML
				btnZoomOutHTML:'<a class="btn btn-zoomout" title="缩小"><i class="ico"></i><span class="tit">缩小</span></a>',//全屏下缩小按钮 HTML
				btnResetHTML:'<a class="btn btn-reset" title="还原"><i class="ico"></i><span class="tit">还原</span></a>',//全屏下图片大小还原按钮 HTML
				btnCloseFullHTML:'<a class="btn btn-closefull" title="退出全屏"><i class="ico"></i><span class="tit">退出全屏</span></a>',//退出全屏按钮 HTML
				zoomRate:.3,
				ref:window,//定位及尺寸参照元素对象
				refPaddingFixX:10,//定位及尺寸参照元素的内边距修正
				refPaddingFixY:10,//定位及尺寸参照元素的内边距修正
				effectDuration:300,//动画持续时长
				checkFreq:200,//检查图片状态的频率
				picResize:true//是否随参照元素调整图片大小（等比例）
			},
			opts=$.extend(defaults,options),
			boxHTML=''+
				'<div class="'+opts.boxClass.replace('.','')+'">'+
				'	<div class="'+opts.boxWrapperClass.replace('.','')+'">'+
				'		<div class="'+opts.picHolderClass.replace('.','')+'"><div class="loader"></div></div>'+
				'		<div class="info">'+
				'			<div class="tit"></div>'+
				'			<div class="page"></div>'+
				'		</div>'+
				'		<div class="exec"></div>'+
				'	</div>'+
				'</div>',
			_box=$(boxHTML),
			_boxWrapper=_box.find(opts.boxWrapperClass),
			_ref=$(opts.ref),
			_refProto=_ref.get(0),
			_picHolder=_box.find(opts.picHolderClass),
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
			_btnFull=$(opts.btnFullHTML),
			_btnZoomIn=$(opts.btnZoomInHTML),
			_btnZoomOut=$(opts.btnZoomOutHTML),
			_btnReset=$(opts.btnResetHTML),
			_btnCloseFull=$(opts.btnCloseFullHTML),
			_fullStage=$('<div class="lightbox-fullstage"><div class="exec"></div></div>'),
			_fullPic=$('<div class="lightbox-fullpic"><img alt=""></div>'),
			_fullPicDragPointer=$('<div class="dragpointer"></div>'),
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
			windowOverflowWhenboxOpen='auto',
			windowOrigOverflow='auto',
			windowOrigScrollTop='0',
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
			zoomTimer=null,
			verticalAlignPatchHTML='<span style="display:inline-block; font-size:0; width:0; overflow:hidden; vertical-align:middle; visibility:hidden">&nbsp;</span>',
			events={};

		for(var i=0; i<triggerLen; i++){
			origPicSrc[i]=_trigger.eq(i).attr(opts.origPicSrcAttr);
			title[i]=_trigger.eq(i).attr('title');
		}

		//console.log(
		//	'selector: '+triggerSelector+'\n'+
		//	'title: '+title+'\n'+
		//	'origPicSrc:'+origPicSrc
		//);

		/********** functions **********/
		function init(){
			clearInterval(checkPicLoadStatus);
			clearTimeout(boxResizeDelay);
			clearTimeout(boxPositionDelay);
			clearTimeout(loadedFixDelay);
			_img.attr('src','').css({
				'width':'auto',
				'height':'auto'
			});
			if(opts.picResize){
				(opts.ref===window?$('html'):_ref).css('overflow','hidden');
			};
		}
		function checkKey(key,currentKey){
			var keyLen=key.length;
			for(var i=0; i<keyLen; i++){
				if(currentKey===key[i]){
					return;
				}
			}
		}
		function isLoaded(obj){
			//console.log(
			//	'checking: '+
			//	'[obj.complete: '+obj.complete+'], \n'+
			//	'[obj.readyState: '+obj.readyState+'], \n'+
			//	'[obj.readyState: '+obj.readyState+']\n'
			//);
			
			return obj.complete || obj.readyState === 'complete' || obj.readyState === 'loaded';
		}
		function boxInit(current){
			init();
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
			if(opts.fullScreen){
				_btnFull.appendTo(_exec);
			};
			_prev.appendTo(_boxWrapper).append(_btnPrev).append(verticalAlignPatchHTML);
			_next.appendTo(_boxWrapper).append(_btnNext).append(verticalAlignPatchHTML);
			_btnClose.appendTo(_exec);
			$(opts.boxClass).removeClass('active');
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
				'width':navRefWidth*0.45+'px',
				'height':navRefHeight+'px',
				'line-height':navRefHeight+'px'
			},opts.effectDuration,function(){
				if(_prev.width()<_btnPrev.outerWidth()||_prev.height()<_btnPrev.outerHeight()){
					_btnPrev.hide();
				}
			});
			_next.stop(false,true).animate({
				'width':navRefWidth*0.45+'px',
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
			},opts.effectDuration,function(){
				_img.stop(false,true).fadeIn(opts.effectDuration);
			});
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
			var hasPropertyOffset=typeof(_ref.offset())!=='undefined';
			refTop=hasPropertyOffset?_ref.offset().top:0;
			refLeft=hasPropertyOffset?_ref.offset().left:0;
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
			//console.log('===>'+current+': '+origPicSrc[current]);
			_loader.stop(false,true).fadeIn(opts.effectDuration);
			_img.stop(false,true).fadeOut(opts.effectDuration,function(){
				init();
				_trigger.removeClass('current').eq(current).addClass('current');
				_img.attr('src',origPicSrc[current]);
				checkPicLoadStatus=setInterval(function(){
					//console.log(isLoaded(_imgProto))
					if(isLoaded(_imgProto)){
						maskerPosition();
						maskerResize();
						picOrigWidth=picWidth=_img.outerWidth();
						picOrigHeight=picHeight=_img.outerHeight();
						//console.log(picOrigWidth+', '+picOrigHeight);
						loadedFixDelay=setTimeout(function(){
							_boxWrapper.children().not(_picHolder).show();
							_loader.stop(false,true).fadeOut(opts.effectDuration);
							boxResize(picOrigWidth,picOrigHeight);
							boxPosition(picWidth,picHeight);
						},opts.checkFreq);
						if(opts.picResize){
							events.refScrollBoxPosition();
						}
						if(opts.mask){
							events.refScrollMaskerPosition();
						}
						events.windowResize();
						events.keyBoardNav();
						events.bindBoxElementEvents();
						clearInterval(checkPicLoadStatus);
						checkPicLoadStatus=null;
					}
				},opts.checkFreq);
			});
			_title.html(title[current]);
			_page.html(current+1+'/'+triggerLen);
		}

		function openBox(current){
			windowOrigOverflow=$('html').css('overflow');
			boxInit(current);
			if(opts.mask){
				_masker.stop(false,true).fadeTo(opts.effectDuration,opts.maskerOpacity);
			}
			_box.stop(false,true).fadeTo(opts.effectDuration,1);
			var otherBoxs=_box.siblings(opts.boxClass),
				otherMasker=_masker.siblings(opts.masker);
			if(otherBoxs.length<1){
				changePic(current);
			}else{
				closeBox(otherBoxs,otherMasker,function(){
					changePic(current);
				});
			}
			events.keyBoardEsc();
		}
		function closeBox(boxObj,maskerObj,callback){
			boxObj=typeof(boxObj)==='undefined'?_box.siblings(opts.boxClass).andSelf():boxObj;
			maskerObj=typeof(maskerObj)==='undefined'?_masker.siblings(opts.masker).andSelf():maskerObj;
			callback=typeof(callback)!=='function'?function(){}:callback;
			events.clearBoxEvents();
			boxObj.stop(false,true).fadeOut(opts.effectDuration,function(){
				boxObj.removeClass('active').remove();
				boxObj.prev(opts.boxClass).addClass('active');
				init();
				(opts.ref===window?$('html'):_ref).css('overflow',windowOrigOverflow);
				//console.log('closed');
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
		function prev(){
			if(current<=0){
				return;
			}
			changePic(current-=1);
		}
		function next(){
			if(current+1>=triggerLen){
				return;
			}
			changePic(current+=1);
		}
		function fullStageInit(){
			_fullStage.css({
				'z-index':opts.maskerZIndex+2,
				'display':'none'
			});
			_fullStage.find('.exec').css({
				'z-index':opts.maskerZIndex+3
			});
			_fullStage.find('.exec').append(_btnZoomIn).append(_btnZoomOut).append(_btnReset).append(_btnCloseFull);
			fullStageResize();
			_fullPic.css({
				'position':'absolute',
				'width':picOrigWidth+'px',
				'height':picOrigHeight+'px',
				'left':(_fullStage.width()-picOrigWidth)/2+'px',
				'top':(_fullStage.height()-picOrigHeight)/2+'px'
			}).append(_fullPicDragPointer);
			_fullPic.find('img').attr('src',origPicSrc[current]).css({
				'width':'100%',
				'height':'100%'
			});
			_fullPicDragPointer.css({
				'position':'absolute',
				'width':'100%',
				'height':'100%',
				'left':'0',
				'top':'0',
				'background':'#fff',
				'cursor':'move'
			}).fadeTo(0,0);
			drag(_fullPic,_fullPicDragPointer,_fullStage);
			_fullStage.append(_fullPic).appendTo('body');
		}
		function fullStageResize(){
			_fullStage.css({
				'width':$(window).width(),
				'height':$(window).height()
			});
		}
		function openFullStage(){
			windowOverflowWhenboxOpen=$('html').css('overflow');
			windowOrigScrollTop=$(window).scrollTop();
			$('html').css({
				'overflow':'hidden'
			});
			fullStageInit();
			_fullStage.siblings(opts.fullStageClass).remove();
			_fullStage.stop(false,true).fadeIn(opts.effectDuration);
			$('html,body').scrollTop(0);
			$(window).on('scroll.lightbox-fullstage',function(){
				$('html,body').scrollTop(0);
			});
			events.bindFullStageEvents();
		}
		function closeFullStage(){
			$('html').css({
				'overflow':windowOverflowWhenboxOpen
			});
			_fullStage.stop(false,true).fadeOut(opts.effectDuration,function(){
				_fullPic.remove();
				_fullStage.remove();
			});
			$(window).off('scroll.lightbox-fullstage');
			$('html,body').scrollTop(windowOrigScrollTop);
			events.clearFullStageEvents();
		}
		function zoomIn(){
			var width=_fullPic.width(),
				height=_fullPic.height(),
				zoomWidth=width+width*opts.zoomRate,
				zoomHeight=height+height*opts.zoomRate,
				top=parseInt(_fullPic.css('top'),10)+(height-zoomHeight)/2,
				left=parseInt(_fullPic.css('left'),10)+(width-zoomWidth)/2;
			_fullPic.stop().animate({
				'width':zoomWidth+'px',
				'height':zoomHeight+'px',
				'top':top+'px',
				'left':left+'px'
			})
		}
		function zoomOut(){
			var width=_fullPic.width(),
				height=_fullPic.height(),
				zoomWidth=width-width*opts.zoomRate,
				zoomHeight=height-height*opts.zoomRate,
				top=parseInt(_fullPic.css('top'),10)+(height-zoomHeight)/2,
				left=parseInt(_fullPic.css('left'),10)+(width-zoomWidth)/2;
			_fullPic.stop().animate({
				'width':zoomWidth+'px',
				'height':zoomHeight+'px',
				'top':top+'px',
				'left':left+'px'
			})
		}
		function resetFullPic() {
			_fullPic.stop(false,true).animate({
				'width':picOrigWidth+'px',
				'height':picOrigHeight+'px',
				'left':(_fullStage.width()-picOrigWidth)/2+'px',
				'top':(_fullStage.height()-picOrigHeight)/2+'px'
			})
		}
		function drag(dragObj,triggerObj,stageObj){
			dragObj=$(dragObj);
			triggerObj=dragObj.find(triggerObj);
			stageObj=typeof(stageObj)==='undefined'?$(window):$(stageObj);
			var x=0,y=0,oX=0,oY=0,
				fixX=0,fixY=0;
			//var minX=minY=0;
			var islteIE9=browser.isIE6()||browser.isIE7()||browser.isIE8()||browser.isIE9();
			//var maxX=$(window).width();
			//var maxY=$(window).height();
			function selectSwitchOff(){
				islteIE9?$('body').on('selectstart.drag',function(){return false;}):$('body').addClass('lightbox-noselect lightbox-onmove');
			}
			function selectSwitchOn(){
				islteIE9?$('body').off('selectstart.drag'):$('body').removeClass('lightbox-noselect lightbox-onmove');
			}
			function draging(x,y){
				//console.log('draging, x:'+x+', y:'+y);
				reposition(x,y)
			}
			function reposition(x,y){
				dragObj.css({'left':x+'px','top':y+'px'});
			}
			function dragStart(){
				//console.log('dragstart');
				selectSwitchOff();
				oX=parseInt(dragObj.css('left'),10)+$(window).scrollLeft();
				oY=parseInt(dragObj.css('top'),10)+$(window).scrollTop();
				$(document).on({
					'mousedown.drag':
					function(e){
						$(this).click();
						fixX=e.pageX-oX;
						fixY=e.pageY-oY;
						x=e.pageX-fixX;
						y=e.pageY-fixY;
					},
					'mousemove.drag':
					function(e){
						x=e.pageX-fixX;
						y=e.pageY-fixY;
						if(e.pageX<0){
							x=-fixX;
						}else if(e.pageX>$(window).width()+$(window).scrollLeft()){
							x=$('body').width()-fixX;
						}
						if(e.pageY<0){
							y=-fixY;
						}else if(e.pageY>$(window).height()+$(window).scrollTop()){
							y=$('body').height()-fixY;
						}
						draging(x,y);
					},
					'mouseup.drag':
					function(){
						x=x-$(window).scrollLeft();
						y=y-$(window).scrollTop();
						dragOver();
					}
				});
			}
			function dragOver(){
				$(document).off('mousemove.drag mousedown.drag mouseup.drag');
				if(x!==0){
					reposition(x,y);
				}
				selectSwitchOn();
				//console.log('dragover');
			}
			
			triggerObj.mousedown(function(){
				dragStart();
			});
			

		};

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
						if(opts.fullScreen&&_fullStage.is(':visible')){
							fullStageResize();
						};
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
						if(checkKey([33,34,35,36,37,38,39,40],keyCode)){
							e.preventDefault();
						}
						if(keyCode===37){
							prev();
						}else if(keyCode===39){
							next();
						}
					}
				});
			},
			keyBoardEsc:function(){
				$(document).off('keydown.lightbox-keyBoardEsc').on({
					'keydown.lightbox-keyBoardEsc':
					function(e){
						var keyCode=e.which||e.keyCode;
						if(checkKey([27],keyCode)){
							e.preventDefault();
						}
						if(keyCode===27){
							if (_fullStage.is(':visible')) {
								closeFullStage();
							}else{
								closeBox();
							}
						}
					}
				});
			},
			bindBoxElementEvents:function(){
				_btnClose.off('click.lightbox').on({
					'click.lightbox':
					function(e){
						closeBox();
						e.preventDefault();
					}
				});
				if(opts.fullScreen){
					_btnFull.off('click.lightbox').on({
						'click.lightbox':
						function(e){
							openFullStage();
							e.preventDefault();
						}
					});
				}
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
			clearBoxEvents:function(){
				$(window).off('resize.lightbox-resize');
				_ref.off('scroll.lightbox-boxPosition scroll.lightbox-maskerPosition');
				$(document).off('keydown.lightbox-keyBoardEsc keydown.lightbox-keyBoardNav');
				_btnClose.off('.lightbox');
				if(opts.fullScreen){
					_btnFull.off('.lightbox');
				};
				_btnPrev.off('.lightbox');
				_btnNext.off('.lightbox');
				_prev.off('.lightbox');
				_next.off('.lightbox');
			},
			bindFullStageEvents:function(){
				_btnZoomIn.off('click.lightbox').on({
					'click.lightbox':
					function(e){
						zoomIn();
						e.preventDefault();
					}
				})
				_btnZoomOut.off('click.lightbox').on({
					'click.lightbox':
					function(e){
						zoomOut();
						e.preventDefault();
					}
				})
				_btnReset.off('click.lightbox').on({
					'click.lightbox':
					function(e){
						resetFullPic();
						e.preventDefault();
					}
				})
				_btnCloseFull.off('click.lightbox').on({
					'click.lightbox':
					function(e){
						closeFullStage();
						e.preventDefault();
					}
				})
				_fullPic.off('mousewheel.lightbox DOMMouseScroll.lightbox').on({
					'mousewheel.lightbox DOMMouseScroll.lightbox':
					function(e) {
						var wheelOrien=null;
						if(e.originalEvent.wheelDelta){
							wheelOrien=e.originalEvent.wheelDelta>0?'up':'down'
						}else{
							wheelOrien=e.originalEvent.detail>0?'down':'up'
						}
						if (wheelOrien==='up') {
							zoomIn();
						}else{
							zoomOut();
						}
						e.preventDefault();
						e.stopPropagation();
					}
				})
				_fullStage.off('mousewheel.lightbox DOMMouseScroll.lightbox').on({
					'mousewheel.lightbox DOMMouseScroll.lightbox':
					function(e) {
						e.preventDefault();
					}
				})
			},
			clearFullStageEvents:function(){
				_btnZoomIn.off('.lightbox');
				_btnZoomOut.off('.lightbox');
				_btnReset.off('.lightbox');
				_btnCloseFull.off('.lightbox');
				_fullPic.off('.lightbox');
				_fullStage.off('.lightbox');
			}
		};

		/********** exec **********/
		_trigger.off('click.lightbox').on('click.lightbox',function(e){
			current=$(this).index(triggerSelector);
			openBox(current);
			e.preventDefault();
		});


	};

} (jQuery));

