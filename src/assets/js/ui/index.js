import {qs, sw} from '../libs';

export function Ui(){
	dropdowns()
	swipers()
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