import "regenerator-runtime/runtime.js";

export let doc=document,
    qsa=(s,o=doc)=>o?.querySelectorAll(s),
    qs=(s,o=doc)=>o?.querySelector(s);

export function loadCSS(n,e,o,d){"use strict";var t=window.document.createElement("link"),i=e||window.document.getElementsByTagName("script")[0],l=window.document.styleSheets;return t.rel="stylesheet",t.href=n,t.media="only x",d&&(t.onload=d),i.parentNode.insertBefore(t,i),t.onloadcssdefined=function(n){for(var e,o=0;o<l.length;o++)l[o].href&&l[o].href===t.href&&(e=!0);e?n():setTimeout(function(){t.onloadcssdefined(n)})},t.onloadcssdefined(function(){t.media=o||"all"}),t}

export function onloadCSS(n,e){
	n.onload=function(){
		n.onload=null,e&&e.call(n)
	},"isApplicationInstalled"in navigator&&"onloadcssdefined"in n&&n.onloadcssdefined(e);
}

export async function load_toast(){

	// https://github.com/joostlawerman/SnackbarLightjs

	// new Snackbar("Hey! Im a snackbar");

	return new Promise(resolve => {
		let script = document.createElement('script')
		script.src = '/vendors/snackbar/snackbarlight.min.js'
		qs('.scripts-area').appendChild(script)
		script.onload = () => {
			let style = loadCSS('/vendors/snackbar/snackbarlight.min.css')
			onloadCSS(style, () => {
				resolve('toast assets loaded')
			})
		}
	})
}

export async function xml(action, data, path){
  
  data && (data = JSON.stringify(data))


  return new Promise(resolve => {

		let xhr = new XMLHttpRequest();
		let body = `action=${action}${data ? `&data=`+data : ""}`

		//process.env.NODE_ENV == 'production' && (cfg.host = '')
    


		xhr.open("POST", path, true);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

		xhr.onreadystatechange = function () {

			if (this.readyState != 4) return
			resolve(this.responseText)
		}

		xhr.send(body);
	})
}