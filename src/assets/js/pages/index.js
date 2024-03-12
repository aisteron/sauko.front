import { qs, qsa, sw } from "../libs"

export const Pages = () => {
	ex_page_swiper()

	// table ex list open modal
	exlist_open_modal()
	
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
			clickable: true
		},
	};

	sw.init(qs(".swiper", ex_swiper), options);

	// lazy
	qsa('[data-src]', ex_swiper).forEach(el => el.src = el.dataset.src)
}

function exlist_open_modal(){
	// открывает попап по кнопке "Бронь"
	// в таблице сборных экскурсий
	
	if(!qs('.table.sbor')) return

	qsa('.table.sbor .table .book').forEach(el => {
		el.listen("click", e => {

			let exid = +e.target.getAttribute('exid')
			let timid = +e.target.getAttribute('timid')
			
			const modalOrder = new CustomEvent("modalOrderOpen", {
				detail: {
					exid: exid,
					timid: timid,
					open: true
				},
			});

			document.dispatchEvent(modalOrder)
		})
	})

}