import { cfg, load_toast, qs, qsa, sw, xml } from "../libs"
import { org_search } from "../ui"

export const Pages = () => {
	ex_page_swiper()

	// table ex list open modal
	exlist_open_modal()

	// клик по красной кнопке "Узнать цену"
	ex_page_know_price()

	// клик по ссылке "Заказать звонок" в хидере
	// и в футере
	// и на странице контактов
	call_order()

	
	// страница экскурсии. клик по ссылкам
	// "Программа сборной экскурсии"
	// "Забронировать место"
	ex_page_top_links_book()


	// на главной заполнить js-ом таблицу со школьными экскурсиями
	fill_home_ex_table()


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

export function exlist_open_modal(){
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

function ex_page_know_price(){

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

function call_order(){
	qs('header li.cb')?.listen("click", _ => {
		qs('#cb_dialog')?.showModal()
	})

	qs('footer li.cb')?.listen("click", _ => {
		qs('#cb_dialog')?.showModal()
	})

	qs('.contacts-page .fake-masonry li.cb')?.listen("click", _ => {
		qs('#cb_dialog')?.showModal()
	})

}

function ex_page_top_links_book(){
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

async function fill_home_ex_table(){
	if(!qs('section.table.home')) return;
	qs('section.table.home .tabs .ex')?.classList.add('active')
	qs('[rel="school"]')?.closest('li').classList.add('active')

	// fetch on load
	let host = process.env.NODE_ENV == 'development' ? 'http://new.sauko.by' : ''
	let res = await xml('get_ex_by_tag', {tag: 'school'}, host+'/api/')

	try {
		res = JSON.parse(res)
	} catch(e){
		console.log(e)
		return;
	}
	let str = ''

	res.forEach(el => {
		str += `
		<div class="row">
      			<div class="name">
      			<img class="thumb" src="${host+el.img}" width="36" height="36" loading="lazy">
      			  <a href="${el.uri}">${el.pagetitle}</a>
      			</div>
      			<span class="duration">${el.duration}</span>
      			<span class="distance">${el.distance}</span>
      		</div>
		`
		
	})
	qs('section.table .table .tbody').innerHTML = str
	org_search()
}