import { qs, sw,fancy } from "../libs";

export function Ui(){
	swipes()
	fancy.init()
	toggle_aside_nav()
}

async function swipes(){

	let reviews_swiper = qs('.widget.reviews')
	let person_swiper = qs('.person-swiper')
	
	if(reviews_swiper){
		await sw.load()

		let options = {
			slidesPerView: 1,
			navigation: {
				nextEl: qs(".next", reviews_swiper),
				prevEl: qs(".prev", reviews_swiper)
			}
		};
		sw.init(qs(".swiper", reviews_swiper), options);
		
	}
	if(person_swiper){
		await sw.load()

		let options = {
			slidesPerView: 1,
			pagination: {
        el: qs(".swiper-pagination", person_swiper),
      },
		};
		sw.init(qs(".swiper", person_swiper), options);
		
	}
}

function toggle_aside_nav(){
	// слева аккордион навигации
	qs('nav.main .head').listen("click", e => {
		e.target.closest('li').classList.toggle('open')
	})
}