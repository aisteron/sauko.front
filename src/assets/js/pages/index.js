import { qs, qsa, sw } from "../libs"

export const Pages = () => {
	ex_page_swiper()
}

async function ex_page_swiper() {
	if(!qs('.ex-page')) return
	let ex_swiper = qs('.ex-swiper')

	if(!ex_swiper){
		console.warn('У экскурсии должен быть свайпер')
		return
	}

	await sw.load()

	let options = {
		slidesPerView: 1,

		pagination: {
			el: qs(".swiper-pagination", ex_swiper),
		},
	};

	sw.init(qs(".swiper", ex_swiper), options);

	// lazy
	qsa('[data-src]', ex_swiper).forEach(el => el.src = el.dataset.src)
}