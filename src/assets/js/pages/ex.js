import { qs, qsa, sw } from "../libs"

export function Ex(){

	// главный слайдер
	page_swiper()

	// клик по красной кнопке "Узнать цену"
	get_know_price()

	// клик по ссылкам
	// "Программа сборной экскурсии"
	// "Забронировать место"
	top_links_book()
}

async function page_swiper() {
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


function get_know_price(){

	let button = qs('.get_to_know_price')
	let cb_dialog = qs('#cb_dialog')
	button?.listen("click", _ => cb_dialog?.showModal())

	// close by cross
	qs('.head svg', cb_dialog)?.listen("click",_=> cb_dialog.close())

	// send to server
	qs('#cb_dialog button')?.listen("click", async _ => {
		let input = qs('.body input', cb_dialog)
		
		if(!input.value){
			await load_toast()
			new Snackbar('Поле телефона не может быть пустым')
			return
		}

		let obj = {
			phone: input.value,
			title: document.title
		}

		process.env.NODE_ENV == 'production' && (cfg.host = '')
		let res = await xml("cb_form", obj, cfg.host+'/api/')
		
		res = JSON.parse(res)
		await load_toast()
		if(res.success){
			new Snackbar("✅ Успешно отправлено")
			input.value = ''
			ym(44704858,'reachGoal','lead')
		} else {
			new Snackbar("❌ Ошибка отправки")
		}

	})

	
}


function top_links_book(){
	qsa('.ex-page section.content ul.sbor li')?.forEach(el => {

		el.listen("click", e => {

			let exid = +e.target.getAttribute('exid')
			let timid = +e.target.getAttribute('timid')
			let tab = e.target.getAttribute('tab')

			let detail = {
				exid: exid,
				timid: timid,
				open: true
			}

			tab && (detail.tab = tab)
			
			
			const modalOrder = new CustomEvent("modalOrderOpen", {detail});
			
			document.dispatchEvent(modalOrder)
		})
	})
}


