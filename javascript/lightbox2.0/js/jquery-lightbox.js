/*========================================================*/
//	lightbox 2.0
//	Depend on jQuery v1.7.2+
//	Code by Warren Chen on 2014-10-22
//	issues: 
/*========================================================*/

;(function ($) {

	$.fn.lightBox = function lightBox(options){

		var defaults={
			},
			opts=$.extend(defaults,options);

		/********** functions **********/
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
		function changeBoxPic(current){
			//console.log('===>'+current+': '+origPicSrc[current]);
			_loader.stop(false,true).fadeIn(opts.effectDuration);
			_img.stop(false,true).fadeOut(opts.effectDuration,function(){
				init();
				_trigger.removeClass('current').eq(current).addClass('current');
				_img.attr('src',origPicSrc[current]);
				_fullLoader.stop(false,true).fadeIn(opts.effectDuration);
				checkPicLoadStatus=setInterval(function(){
					//console.log(isLoaded(_img.get(0)))
					if(isLoaded(_img.get(0))){
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
							_fullImg.attr('src',origPicSrc[current]).css({
								'width':'100%',
								'height':'100%'
							});
							resetFullPic(function(){
								_fullLoader.stop(false,true).fadeOut(opts.effectDuration);
							});
							if (opts.boxDrag) {
								drag(_box,_boxWrapper,_ref);
							}
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
				changeBoxPic(current);
			}else{
				closeBox(otherBoxs,otherMasker,function(){
					changeBoxPic(current);
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
			changeBoxPic(current-=1);
		}
		function next(){
			if(current+1>=triggerLen){
				return;
			}
			changeBoxPic(current+=1);
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
			_fullImg.attr('src',origPicSrc[current]).css({
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
			_fullLoader.hide();
			_fullPrev.append(_btnFullPrev);
			_fullNext.append(_btnFullNext);
			_fullStage.append(_fullPic).append(_fullPrev).append(_fullNext);
			$('body').append(_fullStage);
			drag(_fullPic,_fullPicDragPointer,_fullStage);
		}
		function fullStageResize(){
			_fullStage.css({
				'width':$(window).width(),
				'height':$(window).height()
			});
			_fullPrev.css('line-height',$(window).height()+'px');
			_fullNext.css('line-height',$(window).height()+'px');
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
		function resetFullPic(callback) {
			callback=typeof(callback)==='undefined'?function(){}:callback;
			_fullPic.stop(false,true).animate({
				'width':picOrigWidth+'px',
				'height':picOrigHeight+'px',
				'left':(_fullStage.width()-picOrigWidth)/2+'px',
				'top':(_fullStage.height()-picOrigHeight)/2+'px'
			},opts.effectDuration,function(){
				callback();
			});
		}
		function drag(dragObj,triggerObj,stageObj){
			dragObj=$(dragObj);
			triggerObj=dragObj.find(triggerObj);
			stageObj=typeof(stageObj)==='undefined'?$(window):$(stageObj);
			var x=0,y=0,
				oX=0,oY=0,
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
				reposition(x,y);
			}
			function reposition(x,y){
				dragObj.css({'left':x+'px','top':y+'px'});
			}
			function dragStart(){
				//console.log('dragstart');
				selectSwitchOff();
				oX=parseInt(dragObj.css('left'),10)+stageObj.scrollLeft();
				oY=parseInt(dragObj.css('top'),10)+stageObj.scrollTop();
				$(document).on({
					'mousedown.drag':
					function(e){
						$(this).click();
						fixX=e.pageX-oX;
						fixY=e.pageY-oY;
						_ref.off('scroll.lightbox-boxPosition');
					},
					'mousemove.drag':
					function(e){
						x=e.pageX-fixX;
						y=e.pageY-fixY;
						stageLeft=stageObj.offset()?stageObj.offset().left:0;
						stageTop=stageObj.offset()?stageObj.offset().top:0;
						stageScrollLeft=stageObj.scrollLeft();
						stageScrollTop=stageObj.scrollTop();
						if(e.pageX<stageLeft){
							x=-fixX+stageLeft+stageScrollLeft;
						}else if(e.pageX>stageLeft+stageObj.width()+stageScrollLeft){
							x=stageObj.width()-fixX+stageLeft+stageScrollLeft;
						}
						if(e.pageY<stageTop){
							y=-fixY+stageTop+stageScrollTop;
						}else if(e.pageY>stageTop+stageObj.height()+stageScrollTop){
							y=stageObj.height()-fixY+stageTop+stageScrollTop;
						}
						x=x-stageScrollLeft;
						y=y-stageScrollTop;
						draging(x,y);
					},
					'mouseup.drag':
					function(e){
						$(this).mousemove();
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
				if(opts.picResize){
					events.refScrollBoxPosition();
				}
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
				_btnFullPrev.off('click.lightbox').on({
					'click.lightbox':
					function(e){
						prev();
						e.preventDefault();
					}
				});
				_btnFullNext.off('click.lightbox').on({
					'click.lightbox':
					function(e){
						next();
						e.preventDefault();
					}
				});
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

