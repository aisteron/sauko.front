import { qs, sw,fancy, load_swiped, xml, cfg, load_toast, debounce, qsa, declension, load_jq_assets, load_timepicker_assets } from "../libs";
import { mixed_open_modal } from "../pages/exlist";
import { currency } from "../services";
import { Filter } from "./filter";
import { widget_review_send } from "./review";

export function Ui(){
	
	swipes()
	fancy.init()
	toggle_aside_nav()
	mobile_menu()


	currency.init()
	Filter()
	
	// слушать свайпы на телефоне
	load_swiped()

	// снять / опубликовать ресурс с фронта
	front_pub()

	// aside поиск
	aside_search()

	// виджет отправки отзыва
	widget_review_send()

	// виджет сборных экскурсий
	widget_sbor()

	// рейтинг экскурсии, эмуляция
	aside_ex_rating()

	// поиск по огранизованным экскурсиям только на фронте
	org_search()

	// переключение валют в хидере
	currency_head()

	// переключение валют в таблице списка экскурсий
	currency_table()

	// пересчет валют/цен в таблице списка экскурсий
	currency_table_recalc()

	// widget extform расширенной формы заказа экскурсии

	widget_extform()


	// клик по ссылке "Заказать звонок" в хидере
	// и в футере
	// и на странице контактов
	call_order()

	

}

async function swipes(){

	let reviews_swiper = qs('.widget.reviews')
	let person_swiper = qs('.person-swiper')

	let content_swipes = qsa('.block.gallery')
	
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

	if(content_swipes){

		await sw.load()

		content_swipes.forEach(el => {

			let options = {
				slidesPerView: 'auto',
				navigation: {
        	nextEl: qs(".next",el),
        	prevEl: qs(".prev",el),
      	},
			};
			sw.init(qs(".swiper", el), options);
		})
	}
}

function toggle_aside_nav(){
	// слева аккордион навигации
	qs('nav.main .head').listen("click", e => {
		e.target.closest('li').classList.toggle('open')
	})
}

function mobile_menu(){

	const menu_icon = qs('#nav-icon1')
	const aside = qs('main aside')
	const underlay = qs('#underlay')
	
	if(!menu_icon) return

	const els = Array.from([menu_icon, aside,underlay])

	menu_icon.listen("click", e => {
		
		els.forEach(el => el.classList.toggle('open'))

		let is_open = underlay.classList.contains('open')
		set_full_height(underlay, is_open)
		setTimeout(()=>{drawer(aside, is_open)},100)
		
	})

	underlay.listen("click", async e => {
		drawer(aside, is_open)
		menu_icon.classList.toggle('open')
		await new Promise(resolve=>setTimeout(()=>{resolve(true)},200))
		
		els.filter(el => el !== menu_icon).forEach(el => el.classList.toggle('open'))
		let is_open = underlay.classList.contains('open')
		set_full_height(underlay, is_open)
	})

	aside.listen("swiped-left", e =>{
		underlay.click()
	})
}

function set_full_height(el, status){
	let fheight = status ? document.body.scrollHeight : 0
	el.style.height = fheight + 'px'
}

function drawer(el, status){
	
	status 
	? el.classList.add('move')
	: el.classList.remove('move')
}

function front_pub(){
	qs('#edit_panel label.pub input')?.listen("change", async e =>{

		let obj = {
			exid: qs('body')?.getAttribute("exid"),
			checked: e.target.checked
		}
		
		if(!obj.exid){
			await load_toast()
			new Snackbar("У body отсутствует exid")	
			return
		}
		process.env.NODE_ENV == 'production' && (cfg.host = '')
		let res = await xml("front_pub",obj, cfg.host+'/api/')
		res = JSON.parse(res)
		
		await load_toast()
		
		res.success
			? new Snackbar(`Успешно ${e.target.checked ? 'опубликовано':'снято с публикации'}`)
			: new Snackbar('Что-то пошло не так')

	})
}

function aside_search(){

	async function onSearch(e){
		
		if(e.target.value.length < 3){
			await load_toast()
			new Snackbar("Меньше 2 знаков нельзя")
			qs('aside .search .results')?.remove()
			return;
		}

		process.env.NODE_ENV == 'production' && (cfg.host = '')
		let res =  await xml('aside_search', {query: e.target.value}, cfg.host+'/api/')
		res = JSON.parse(res)
		
		if(!res.length && !res?.success){
			await load_toast()
			res.message 
				? new Snackbar(res.message)
				: new Snackbar('Ошибка поиска')
			return	
		}

		draw(res)
	}

	let input = qs('aside .search input')
	let debouncedInput = debounce(onSearch, 500);
	input.listen("keyup", debouncedInput)


	function draw(res){
		let str = `<div class="results"><ul>`;
		
		res.forEach(el => {
			str += `<li><a href="${el.uri}">${el.pagetitle}</a></li>`
		})

		str +=`</ul></div>`
		qs('aside .search .results')?.remove()
		qs('aside .search').insertAdjacentHTML('beforeend', str)
	}
	
}

function widget_sbor(){

	// open modal
	qsa('.widget.sbor .price')?.forEach(el => {
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

	// subscribe for change currency

	document.listen("change_currency", e => draw(e.detail.selected) )

	// on load
	//let selected = JSON.parse(localStorage.getItem('cur'))?.selected
	
	let selected;
	try {
		selected = JSON.parse(localStorage.getItem('cur'))
	} catch(e){
		console.log('ERROR: not valid value in lS')
		return;
	}
	selected = selected?.selected
	
	draw(selected)

	function draw(selected){
		if(!selected) return

		qsa('.widget.sbor [byn]')?.forEach(el => {
			let b = +el.getAttribute('byn')
			
			el.innerHTML = 
				selected == 'BYN'
					? b
					: currency.calc(b, selected)
			
			el.nextElementSibling.innerHTML = selected.toUpperCase()


		})
	}

}

function aside_ex_rating(){

	qsa('.widget.star input')?.forEach(el => {
		el.listen("change", e => {

			let votes = +qs('.widget.star .votes').innerHTML
			save(+e.target.value, votes+1)

		})
	})

	
	function save(rating, votes){
		let ratinglS = localStorage.getItem('rating')

		if(!ratinglS){
			let obj = []
			obj.push({
				uri: document.location.href,
				rating,
				votes
			})

			localStorage.setItem('rating', JSON.stringify(obj))
			
			let str = `Рейтинг экскурсии <br> на основе <span class="votes">${votes}</span> ${votes % 10 == 1 ? 'голоса': 'голосов'}`
			qs('.widget.star .count').innerHTML = str
			return;
		}

		ratinglS = JSON.parse(ratinglS)
		let s = ratinglS.find(el => el.uri == document.location.href)
		
		if(s){
			
			ratinglS = ratinglS.map(el => {
				if(el.uri == document.location.href){
					el.rating = rating
					return el
				}
				return el
			})

			localStorage.setItem('rating', JSON.stringify(ratinglS))
		} else {

			let obj = {
				uri: document.location.href,
				rating,
				votes
			}

			ratinglS.push(obj)
			localStorage.setItem('rating', JSON.stringify(ratinglS))
		}

		
	}

	// on page load

	let ratinglS = localStorage.getItem('rating')

	if(ratinglS){
		
		ratinglS = JSON.parse(ratinglS)
		
		let s = ratinglS.find(el => el.uri == document.location.href)
		
		if(s){
			qs(`.widget.star input[value="${s.rating}"]`).checked = true
			let str = `Рейтинг экскурсии <br> на основе <span class="votes">${s.votes}</span> ${s.votes % 10 == 1 ? 'голоса': 'голосов'}`
			qs('.widget.star .count').innerHTML = str
		}

	}
	
}

export function org_search(){
	let input = qs('section.table.org .thead input')
	if(!input) return
	let arr = []
	fill_arr(arr)
	//console.log(arr)
	
	// subscribe
	document.listen("change_currency", async e => {

		await new Promise((resolve) => setTimeout(()=>{resolve()},500))
		arr = fill_arr([])
		
		console.log(arr)
	})
	
	

	
	input?.listen("keyup", e => {
		let q = e.target.value.toLowerCase()
		if(!q){
			draw(arr)
			return
		}
		
		let res = arr.filter(el => el.name.toLowerCase().indexOf(q) !== -1)
		draw(res)
	})



	function draw(res){

		
		if(!res.length){
			qs('section.table .tbody').innerHTML = '<h3 class="nf404">Экскурсии не найдены</h3>'
			return
		}

		let str = ''
		res.forEach(el => {
			str += `
			<div class="row ${el.sbor ? 'sbor': ''}">
				<div class="name">
					<img src="${el.img}" width="36" height="36">
					<a href="${el.url}">${el.name}</a>
					`;

			if(el.sbor){
				str += `
				<ul class="schedule">
            <li class="date">${el.sbor.date}</li>
            <li class="time">${el.sbor.time}</li>
            <li class="seats">${el.sbor.seats}</li>
            <li class="price">
						<span byn="${el.sbor.byn}">${el.sbor.price}</span>
						<span class="cur">${el.sbor.cur}</span></li>
            
						<li class="cart" exid="${el.sbor.exid}" timid="${el.sbor.timid}">
						<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
							<mask id="mask0_774_611" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="18" height="18">
							<rect width="18" height="18" fill="#D9D9D9"></rect>
							</mask>
							<g mask="url(#mask0_774_611)">
							<path d="M8.25 6.75V4.5H6V3H8.25V0.75H9.75V3H12V4.5H9.75V6.75H8.25ZM5.25 16.5C4.8375 16.5 4.48438 16.3531 4.19063 16.0594C3.89688 15.7656 3.75 15.4125 3.75 15C3.75 14.5875 3.89688 14.2344 4.19063 13.9406C4.48438 13.6469 4.8375 13.5 5.25 13.5C5.6625 13.5 6.01562 13.6469 6.30937 13.9406C6.60313 14.2344 6.75 14.5875 6.75 15C6.75 15.4125 6.60313 15.7656 6.30937 16.0594C6.01562 16.3531 5.6625 16.5 5.25 16.5ZM12.75 16.5C12.3375 16.5 11.9844 16.3531 11.6906 16.0594C11.3969 15.7656 11.25 15.4125 11.25 15C11.25 14.5875 11.3969 14.2344 11.6906 13.9406C11.9844 13.6469 12.3375 13.5 12.75 13.5C13.1625 13.5 13.5156 13.6469 13.8094 13.9406C14.1031 14.2344 14.25 14.5875 14.25 15C14.25 15.4125 14.1031 15.7656 13.8094 16.0594C13.5156 16.3531 13.1625 16.5 12.75 16.5ZM0.75 3V1.5H3.20625L6.39375 8.25H11.6438L14.5688 3H16.275L12.975 8.9625C12.8375 9.2125 12.6531 9.40625 12.4219 9.54375C12.1906 9.68125 11.9375 9.75 11.6625 9.75H6.075L5.25 11.25H14.25V12.75H5.25C4.6875 12.75 4.25937 12.5063 3.96562 12.0188C3.67188 11.5312 3.6625 11.0375 3.9375 10.5375L4.95 8.7L2.25 3H0.75Z" fill="#028F68" fill-opacity="0.84"></path>
							</g>
						</svg>
					</li>
				</ul>
				`
			}

			if(el.tags){
				str +=`<ul class="tags">`
				el.tags.forEach(t => {

					str += t.uri
						? `<li class="link"><a href="${t.uri}">${t.label}</a></li>`
						: `<li><span>${t.label}</span>`

				})
				str +=`</ul>`
			}
			str += `</div>
				<span class="duration">${el.duration}</span>
				<span class="distance">${el.distance}</span>
      </div>
			`
		})

		qs('section.table.org .tbody').innerHTML = str

		mixed_open_modal()


	}

	// reset by cross
	let cross = input.nextElementSibling
	cross.listen("click", e => {
		input.value = ''
		draw(arr)
	})
}

function fill_arr(arr){


	
	function get_cur(el){
		let currency_lS = localStorage.getItem('cur')
		let src_cur = qs('.cur', el).innerHTML
		
		if(!currency_lS || currency_lS == 'undefined'){
			return src_cur
		}

		try {
			currency_lS = JSON.parse(currency_lS)
		} catch(e){
			console.log(e)
			return src_cur
		}
		
		if(!currency_lS?.selected || currency_lS?.selected == 'BYN'){
			return src_cur
		}

		return currency_lS.selected
	}

	function get_price(el){
		let currency_lS = localStorage.getItem('cur')
		let src_price = +qs('[byn]', el).getAttribute('byn')
		
		
		if(!currency_lS || currency_lS == 'undefined'){
			return src_price
		}

		try {
			currency_lS = JSON.parse(currency_lS)
		} catch(e){
			console.log(e)
			return src_price
		}

		if(!currency_lS?.selected || currency_lS?.selected == 'BYN'){
			return src_price
		}

		return currency.calc(src_price,currency_lS.selected)
	}

	qsa('section.table .tbody .row')?.forEach(el => {
		let obj = {
			name: qs('a', el).innerHTML,
			url: qs('a', el).href,
			img: qs('img',el).src,
			duration: +qs('.duration', el).innerHTML,
			distance: +qs('.distance', el).innerHTML,
		}

		if(qsa('ul.tags li', el)){

			obj.tags = []
			qsa('ul.tags li',el).forEach(li => {
				let o = {
					label: qs('a',li)?.innerHTML || qs('span',li).innerHTML
				}
				if(qs('a',li)){
					o.uri = qs('a',li).getAttribute('href')
				}
				obj.tags.push(o)
			})
		}
	

		if(el.classList.contains('sbor')){
			obj.sbor = {

				exid: +qs('[exid]', el).getAttribute('exid'),
				timid: +qs('[timid]', el).getAttribute('timid'),

				date: qs('.date', el).innerHTML,
				time: qs('.time', el).innerHTML,
				seats: qs('.seats', el).innerHTML,
				byn: +qs('[byn]', el).getAttribute('byn'),
				price: get_price(el),
				cur: get_cur(el),
			}

			
		}

		arr.push(obj)
	})

	return arr
}

function currency_head(){
	const head = qs('header .currency .head') 
	
	// show / hide

	head?.listen("click", e => {
		head.closest('.currency').classList.toggle('open')
	})

	// subscribe

	document.listen("change_currency", e => {
			
		let c = e.detail.selected
		qs('span', head).innerHTML = c

	})

	// dispatch
	qsa('li', head.closest('.currency')).forEach(el => {
		
		el.listen('click', e => {
			let c = e.target.innerHTML.toUpperCase()
			const ev = new CustomEvent("change_currency", {
				detail: { selected: c },
			});
	
			document.dispatchEvent(ev)

			// side

			qs('span', head).innerHTML = c

			head.closest('.currency').classList.remove('open')

		})
	})

	// on load
	let selected = JSON.parse(localStorage.getItem('cur'))?.selected
	if(selected) qs('span', head).innerHTML = selected

}

function currency_table(){
	let head = qs('section.table .table .thead .price .head')
	if(!head) return
	
	// open / hide
	head?.listen("click", e =>{
		e.target.closest('.price').classList.toggle('open')
	})

	// dispatch
	qsa('li', head?.closest('.price')).forEach(el =>{
		el.listen("click", e => {
			let c = e.target.innerHTML.toUpperCase()
			const ev = new CustomEvent("change_currency", {
				detail: { selected: c },
			});
	
			document.dispatchEvent(ev)

			// side
			head.closest('.price').classList.remove('open')
			qs('span', head).innerHTML = c
		})
	})

	// subscribe

	document.listen("change_currency", e => {
		
		let c = e.detail.selected
		qs('span', head).innerHTML = c
	})


	// on load

	let selected = JSON.parse(localStorage.getItem('cur'))?.selected
	if(selected) qs('span', head).innerHTML = selected

	


}

function currency_table_recalc(){

	// on load
	
	let selected = localStorage.getItem('cur')
	try {
		selected = JSON.parse(selected)
	} catch(e){
		console.log(e)
		return
	}
	selected = selected?.selected
	
	draw(selected)
	
	
	// subscribe

	document.listen("change_currency", e => {

		draw(e.detail.selected)
	})

	function draw(cur){

		if(!cur) return

		qsa('section.table .tbody [byn]').forEach(el =>{
			const b = +el.getAttribute('byn')
			el.innerHTML = cur == 'BYN'
				? b
				: currency.calc(b, cur)
		})
		
		// vault
		qsa('section.table .tbody .row .cur').forEach(el => {
			el.innerHTML = cur
			
		})
	}

}


async function widget_extform(){

	if(!qs('.widget.extform')) return

	await load_jq_assets()

	$.datepicker.setDefaults( $.datepicker.regional[ "ru" ] )
	$( "#datepicker" ).datepicker()

	await load_timepicker_assets()

	$('#datetimepicker2').datetimepicker({
		datepicker:false,
		format:'H:i'
	});




	//arrows count tourists
	
	
	qsa('.widget.extform .arrows button').forEach(el => {

		let input = qs('.widget.extform input[type="number"]')

		el?.listen("click",e => {
			let dir = e.target.classList[0]
			
			
			if(dir == 'up'){
				input.value = !input.value ? 2 : +input.value+1;
			}
			if(dir == 'down'){
				if(input.value == 1) return
				if(input.value < 1) {input.value = 1; return};
				input.value = input.value-1;
			}
		})
	})

	// to server

	qs('.widget.extform form').listen("submit", async e => {
		e.preventDefault()
		
		let fields = [
			{
				name: 'name',
				label: 'Имя',
				el: qs('[name="name"]', e.target)
			},
			{
				name: 'phone',
				label: 'Телефон',
				el: qs('[name="phone"]', e.target)
			},
			{
				name: 'count',
				label: 'Кол-во туристов',
				el: qs('[name="count"]', e.target)
			},
			{
				name: 'date',
				label: 'Предпочитаемая дата',
				el: qs('#datepicker', e.target),
			},
			{
				name: 'time',
				label: 'Предпочитаемое время',
				el: qs('#datetimepicker2', e.target),
			}
		];

		let obj = fields.map(el => {
			el.value = el.el.value; 
			return el
		})
		
		obj = obj.map(a => {return {...a}})
		obj = obj.map(a => {delete a.el; return a})



		let radio = qs('span.l', 
			qs('[type=radio]:checked', e.target).closest('label'))

		obj.push({name:'type', value:radio.innerHTML, label:'Тип экскурсии'})
		obj.push({name:'pagetitle', value:document.title, label:'Заголовок страницы'})

		let path = process.env.NODE_ENV == 'development'
			? 'http://new.sauko.by': ''	
		
		let res = await xml("get_extform_data", obj, path+'/api/');

		await load_toast()

		try {
			res = JSON.parse(res)
		} catch(e){
			console.log(e)
			new Snackbar('Неожиданный ответ сервера')
			return
		}

		if(!res.success){
			new Snackbar('Ошибка отправки')
		} else {
			new Snackbar('Успешно отправлено!')
			fields.forEach(el => {
				el.el.value = ''
			})
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