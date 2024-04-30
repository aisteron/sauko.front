import "regenerator-runtime/runtime.js";
Node.prototype.listen = Node.prototype.addEventListener;

export const cfg = {
	host: "http://new.sauko.by"
}

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

export async function load_swiped(){

	// https://github.com/john-doherty/swiped-events/tree/master

	// document.addEventListener('swiped-left', function(e) {
	// 	console.log(e.target); // element that was swiped
	// 	console.log(e.detail); // see event data below
	// });

	return new Promise(resolve => {
		let script = document.createElement('script')
		script.src = '/vendors/swiped-events.min.js'
		qs('.scripts-area').appendChild(script)
		script.onload = () => {
			resolve('swipe assets loaded')
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

export const sw = {
	async load(){
		
		return new Promise(resolve =>{
			if(qs(['swiper'])){resolve(true); return}
			let script = document.createElement("script")
			script.src="/vendors/swiper/swiper-bundle.min.js"
			script.setAttribute("swiper","")
			qs(".scripts-area").appendChild(script)
			
			script.onload = () => {
				
				let style = loadCSS("/vendors/swiper/swiper-bundle.min.css")
				onloadCSS(style, () => {
					//console.log('%c Swiper loaded', 'color: #666')
					resolve(true)
				})
			}
		})
	},

	init(el,options){ new Swiper(el, options) }
}

export const fancy = {

	async load(){
		
		return new Promise(resolve =>{
			if(qs(['fancy'])){resolve(true); return}
			let script = document.createElement("script")
			script.src="/vendors/fancy/fancybox.umd.js"
			script.setAttribute("fancy","")
			qs(".scripts-area").appendChild(script)
			
			script.onload = () => {
				let style = loadCSS("/vendors/fancy/fancybox.css")
				onloadCSS(style, () =>  resolve(true))
			}
		})
	},
	async init(){
		
		if(!qs('[data-fancybox]')) return
		await this.load()

		Fancybox.bind("[data-fancybox]", {
			// Your custom options
		});
	}

}



export function debounce(func, wait, immediate) {
	// https://gist.github.com/ionurboz/51b505ee3281cd713747b4a84d69f434


	/////////////////////////////////
	// // DEMO:

	// function onMouseMove(e){
	// 	console.clear();
	// 	console.log(e.x, e.y);
	// }

	// // Define the debounced function
	// var debouncedMouseMove = debounce(onMouseMove, 50);

	// // Call the debounced function on every mouse move
	// window.addEventListener('mousemove', debouncedMouseMove);


  var timeout;


  return function() {

    var context = this,
      args = arguments;
    var callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(function() {
      timeout = null;

      if (!immediate) {
        func.apply(context, args);
      }
    }, wait);

    if (callNow) func.apply(context, args);
  }
}

export function isEmpty(obj) {
  for (var prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }

  return true
}

export function declension(number, declensions, cases = [2, 0, 1, 1, 1, 2]) {

	//const result = declension(10, ['монета', 'монеты', 'монет'])
	// https://gist.github.com/ShepetaAndrey/d3507a1ac72ff3544cdb734fd1a80178

  return declensions[
    number % 100 > 4 && number % 100 < 20
      ? 2
      : cases[number % 10 < 5 ? number % 10 : 5]
  ];
}

export function runMetrika(number){
	if(process.env.NODE_ENV == 'development') return;
	if(qs('#edit_panel')) return;

	(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)}; m[i].l=1*new Date(); for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }} k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
	(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
	ym(number, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true });

}

export async function load_jq_assets(){

	var j371 = new Promise((resolve, reject)=>{
		let script = document.createElement('script')
		script.src = '/vendors/jq/jquery-3.7.1.js'
		qs('.scripts-area').appendChild(script)
		script.onload = () => resolve()
	})

	var jqui = new Promise((resolve, reject)=>{
		let script = document.createElement('script')
		script.src = '/vendors/jq/jquery-ui.js'
		qs('.scripts-area').appendChild(script)
		script.onload = () => resolve()
	})

	

	var jstyles = new Promise((resolve, reject)=>{
		var s = loadCSS('/vendors/jq/jquery-ui.css')
		onloadCSS(s, () => resolve())
	})

	await Promise.all([j371, jqui, jstyles])
	
	return await new Promise((resolve, reject)=>{
		let script = document.createElement('script')
		script.src = '/vendors/jq/datepicker-ru.js'
		qs('.scripts-area').appendChild(script)
		script.onload = () => resolve()
	})
	


}

export async function load_timepicker_assets(){
	
	var j = new Promise((resolve, reject)=>{
		let script = document.createElement('script')
		script.src = '/vendors/jq/jquery.datetimepicker.full.js'
		qs('.scripts-area').appendChild(script)
		script.onload = () => resolve()
	})

	var style = new Promise((resolve, reject)=>{
		var s = loadCSS('/vendors/jq/jquery.datetimepicker.min.css')
		onloadCSS(s, () => resolve())
	})

	return await Promise.all([j,style])
}