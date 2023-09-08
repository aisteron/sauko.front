import {qs, sw} from '../libs';

export async function Ui(){
	dropdowns()
	swipers()

	await calendar.load()
	calendar.init(qs('.column3 .calendar'))

}

export const calendar = {
	async load(){
		return new Promise(resolve => {

			if(qs('[calendar]')){
				resolve(true)
				return
			}
			let script = document.createElement('script')
			script.src = "/vendors/flatpickr/flatpickr.js"
			script.setAttribute('calendar','')
			qs('.scripts-area').appendChild(script)
			
			script.onload = () => {
				// ru locale
				let script = document.createElement('script')
				script.src = "/vendors/flatpickr/ru.js"
				qs('.scripts-area').appendChild(script)
				script.onload = () => {
					resolve(true)
				}

			}
		})
		
	},
	init(el){
		flatpickr(el, {
			"locale": "ru",
			"dateFormat": "d.m",
		  "inline": true,

			onChange: function(selectedDates, dateStr, instance) {
				console.log(dateStr)
				console.log(Date.parse(selectedDates))
			},
			onDayCreate: function(dObj, dStr, fp, dayElem){
		
				//let cd = Date.parse(dayElem.dateObj)
				
				
		}
	});
	}

}

function dropdowns(){
	
	// header tel
	if(qs('header .tel.dd')){
		qs('header .tel.dd span.head').addEventListener("click", event => {
			qs('header .tel.dd').classList.toggle("open")
		})
	}

	//header currency
	if(qs('header .cur.dd')){
		qs('header .cur.dd span.head').addEventListener("click", event => {
			qs('header .cur.dd').classList.toggle("open")
		})
	}
}

async function swipers(){

	let reviews = qs('.box.reviews .swiper.reviews');
	
	let sliders = [qs('.asdf'), reviews];

	sliders.every(async el => { 
		if(el){
			await sw.load();
			run();
			return;
		}
	})

	function run(){

		sliders.forEach(el => {
				
			if(el == reviews){

				let config = {
					el: reviews,
					options: {
						navigation: {
							prevEl: qs('.box.reviews .prev.icon-tr'),
							nextEl: qs('.box.reviews .next.icon-tr'),
						},
					}
				}

				sw.init(config)
			}
		})

	}
	
}
