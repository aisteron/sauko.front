import { qs, sw } from "../libs";

export function Ui(){
	swipes()
}

async function swipes(){
	let reviews_swiper = qs('.widget.reviews')
	
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
}