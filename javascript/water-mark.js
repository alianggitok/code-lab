/**
 * 水印
 * @author Warren
 * @param {*} options 参数见 example
 * @example
    waterMark({
        id:'water-mark', // cover 模式下水印层的 id
        mode:'cover', // mat|cover，放置模式，默认 mat（cover模式下为确保水印覆盖到，请检查载体宽高，mat 模式下水印的打印是非强制的，可能丢失）
        // carrierElem:document.getElementById('article'), // 水印层加载，默认在根元素（body）下
        text:inputUser,
        fontStyle:'lighter 16px hei',
        fillStyle:'black', // canvas fillStyle
        opacity:0.1, // 默认 0.1
        rotateDegree:-20, // 旋转角度
        margin:0, // repeat 时每个水印的间距
        padding:50, // 每个水印自身的内边距
        // needClip:false, // 是否裁切掉空白，默认true
        // position:'center center', // 水印位置（css background-position）
        // repeat:'no-repeat', // 水印铺设方式（css background-repeat）
        // tuning:true // 调试模式
    })
 */

function waterMark(options){
    function draw(
        txt='watermark',
        fontStyle='normal 16px serif',
        fillStyle='rgba(0,0,0,1)',
        rotateDegree=0,
        margin=0,
        padding=0,
        opacity=0.1,
        needClip=true,
        tuning=false,
        callback
    ){
        function draft(){
            let canvas = document.createElement('canvas'); // 创建canvas元素
            let ctx=canvas.getContext('2d');
            let setTxtProp=(txt)=>{
                ctx.font=fontStyle;
                ctx.fillStyle = fillStyle;
                ctx.textAlign='start';
                ctx.textBaseline = 'top';
                return ctx.measureText(txt);
            }
            let txtProp=setTxtProp(txt)
            let contWidth=txtProp.actualBoundingBoxRight +txtProp.actualBoundingBoxLeft;
            let contHeight=txtProp.actualBoundingBoxDescent +txtProp.actualBoundingBoxAscent;
            let radius=Math.sqrt(Math.pow(contWidth/2,2)+Math.pow(contHeight/2,2)); //圆弧半径（依据文字中心点到最远距离，用勾股定理算出半径）
            let maxRadius=radius+padding; // 带 padding 的半径
            let contOffsetX=maxRadius-contWidth/2;
            let contOffsetY=maxRadius-contHeight/2;
            let txtX=-maxRadius+contOffsetX+txtProp.actualBoundingBoxLeft;
            let txtY=-maxRadius+contOffsetY+txtProp.actualBoundingBoxAscent;
            let originAxis=[
                [-contWidth/2,-contHeight/2], // 上左
                [contWidth/2,-contHeight/2], // 上右
                [contWidth/2,contHeight/2], // 下右
                [-contWidth/2,contHeight/2] // 下左
            ];
            let radian=rotateDegree*Math.PI/180; // 旋转角度
            let newAxis=originAxis.map(axis=>{
                // 获取旋转后的四点新坐标
                return [
                    axis[0]*Math.cos(radian)-axis[1]*Math.sin(radian),
                    axis[0]*Math.sin(radian)+axis[1]*Math.cos(radian)
                ]
            });
            let clipStartAxis=[
                Math.min(...newAxis.map(axis=>axis[0]))-padding,
                Math.min(...newAxis.map(axis=>axis[1]))-padding
            ];
            let clipSize=[
                Math.max(...newAxis.map(axis=>axis[0]))+padding,
                Math.max(...newAxis.map(axis=>axis[1]))+padding
            ].map(value=>value*2);

            if(tuning){
                canvas.width = maxRadius*2+margin;
                canvas.height = maxRadius*2+margin;

                ctx.globalAlpha=opacity;
                ctx.translate(maxRadius,maxRadius); // 为旋转设置轴心
                // 旋转
                ctx.rotate(radian);

                // text
                // console.log('text',txtX,txtY)
                setTxtProp(txt);
                ctx.fillText(txt,txtX,txtY);

                // 辅助绘制：
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                // 文字背景
                ctx.beginPath();
                ctx.rect(-maxRadius+contOffsetX,-maxRadius+contOffsetY,contWidth,contHeight);
                ctx.closePath();
                ctx.fill();

                // 水平线
                ctx.setLineDash([5,15])
                ctx.beginPath();
                ctx.moveTo(-maxRadius, 0);
                ctx.lineTo(maxRadius, 0);
                ctx.closePath();
                ctx.stroke();
                
                ctx.rotate(-radian);
                ctx.setLineDash([])
                
                // 旋转轨道
                ctx.beginPath();
                ctx.arc(0, 0, maxRadius-padding, 0, Math.PI*2);
                ctx.closePath();
                ctx.stroke();
                
                // padding
                ctx.beginPath();
                ctx.arc(0, 0, maxRadius, 0, Math.PI*2);
                ctx.closePath();
                ctx.stroke();
                
                // 矩形区域坐标点
                newAxis.forEach(axis=>{
                    ctx.fillStyle = 'red';
                    ctx.beginPath();
                    ctx.arc(axis[0], axis[1], 1.5, 0, Math.PI*2);
                    ctx.closePath();
                    ctx.fill();
                })

                if(tuning){
                    // 标出裁切区域
                    ctx.fillStyle = 'rgba(0,0,0,0.15)';
                    ctx.beginPath();
                    ctx.rect(...clipStartAxis,...clipSize);
                    ctx.closePath();
                    ctx.fill();
                }
            }

            if(needClip){
                // clip
                // console.log('newAxis',newAxis,clipStartAxis,clipSize)
                let imgCopy=ctx.getImageData(...clipStartAxis,...clipSize.map(value=>value+maxRadius));
                canvas.width = clipSize[0]+margin;
                canvas.height = clipSize[1]+margin;
                ctx.putImageData(imgCopy,...clipStartAxis.map(value=>value-(value+maxRadius)));
            }

            if(tuning){
                put(canvas.toDataURL('image/png'))
            }

            return {
                width: canvas.width,
                height: canvas.height,
                contWidth,
                contHeight,
                txtProp
            }
        }
        function svgDraw(params){
            let dataURL=''
            let {x,y}={
                x:(params.width-margin)/2-params.contWidth/2,
                y:(params.height-margin)/2-params.contHeight/2
            }
            let rotateParams=[rotateDegree,x+params.contWidth/2,y+params.contHeight/2].join(',')
            let svg=document.createElement('svg')
            let text=document.createElement('text')

            // <svg>
            svg.setAttribute('xmlns','http://www.w3.org/2000/svg')
            svg.setAttribute('width',params.width)
            svg.setAttribute('height',params.height)
            svg.setAttribute('version','1.1')
            svg.setAttribute('opacity',opacity)
            // <text>
            text.innerText=txt
            text.style=[
                text.style.cssText,
                `font:${fontStyle}`,
                'text-anchor:start',
                'alignment-baseline:before-edge',
            ].join('!important;')
            text.setAttribute('x',x+params.txtProp.actualBoundingBoxLeft) // svg 的 text 无法获取具体的文字渲染参数，利用 canvas 的 measureText 来修正对齐基准偏移
            text.setAttribute('y',y+params.txtProp.actualBoundingBoxAscent)
            text.setAttribute('transform',`rotate(${rotateParams})`)

            if(tuning){
                // <rect>
                let rect=document.createElement('rect')
                rect.setAttribute('x',x)
                rect.setAttribute('y',y)
                rect.setAttribute('width',params.contWidth)
                rect.setAttribute('height',params.contHeight)
                rect.setAttribute('fill','yellow')
                rect.setAttribute('stroke','red')
                rect.setAttribute('transform',`rotate(${rotateParams})`)
                svg.append(rect)
            }

            svg.append(text)

            dataURL='data:image/svg+xml;base64,'+window.btoa(unescape(encodeURIComponent(svg.outerHTML)))
            console.log('svgDraw',svg,params,dataURL)
            put(dataURL)
        }
        
        svgDraw(draft())
    }
    function put(imgURL){
        let existElem=document.getElementById(options.id)
        let elem=document.body
        if(options.mode==='cover'){
            elem=existElem||document.createElement('div')
            elem.id=options.id||'wf-water-mark'
        };
        elem.style=[
            elem.style.cssText,
            '-webkit-print-color-adjust:exact',
            'print-color-adjust:exact',
            'color-adjust:exact',
            `background-image:url(${imgURL})`,
            `background-position:${options.position||'center center'}`,
            `background-repeat:${options.repeat||'repeat'}`
        ].join('!important;');
        if(options.mode==='cover'){
            let carrierElem=options.carrierElem||document.body;

            elem.style=[
                elem.style.cssText,
                'pointer-events:none',
                'position:absolute',
                `z-index:${options.zIndex||'100000'}`,
                'top:0',
                'left:0',
                'width:100%',
                'height:100%'
            ].join('!important;');

            carrierElem.style.position='relative';
            if(!existElem){
                carrierElem.append(elem);
            }
        }
    }
    
    draw(
        options.text,
        options.fontStyle,
        options.fillStyle,
        options.rotateDegree,
        options.margin,
        options.padding,
        options.opacity,
        options.needClip,
        options.tuning,
    )
}