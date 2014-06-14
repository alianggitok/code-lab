//load JavaScript
function loadScript(urls,callback){
	var script = document.creatElement("script");
	script.type = "text/javascript";
	if (script.readyState){ //IE
		script.onreadystatechange = function(){
			if(script.readyState == "loaded"||script.readyState == "complete"){
				script.readystatechange = null;
				callback();
			};
		};
	}else{ //Others
		script.onload = function(){
			callback();
		};
	}
	script.src = url;
	document.body.appendChild(script);
};