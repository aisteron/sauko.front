import { qs, sw,fancy, load_swiped, xml, cfg, load_toast, debounce, qsa, declension } from "../libs";
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

function org_search(){
	let input = qs('section.table.org .thead input')
	if(!input) return
	let arr = []
	
	qsa('section.table .tbody .row')?.forEach(el => arr.push({
		name: qs('a', el).innerHTML,
		url: qs('a', el).href,
		img: qs('img',el).src,
		duration: +qs('.duration', el).innerHTML,
		distance: +qs('.distance', el).innerHTML,
	}))

	
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
			<div class="row">
				<div class="name">
					<img src="${el.img}" width="36" height="36">
					<a href="${el.url}">${el.name}</a>
				</div>
				<span class="duration">${el.duration}</span>
				<span class="distance">${el.distance}</span>
      </div>
			`
		})

		qs('section.table.org .tbody').innerHTML = str


	}

	// reset by cross
	let cross = input.nextElementSibling
	cross.listen("click", e => {
		input.value = ''
		draw(arr)
	})
}

function currency_head(){

	qs('header .currency .head')?.listen("click", e=> {
		e.target.closest('.currency').classList.toggle('open')
	})

	// dispatch
	qsa('header .currency ul li').forEach(el => {
		
		el.listen('click', e => {
			let cur_str = e.target.innerHTML.toUpperCase()

			const c = new CustomEvent("change_currency", {
				detail: { selected: cur_str },
			});
	
			document.dispatchEvent(c)

			qs('header .currency .head span').innerHTML = cur_str
			qs('header .currency').classList.remove('open')

		})
	})

	// on load
	let currency_lS = localStorage.getItem('cur')

	if(!currency_lS){

		const intervalId = setInterval(function() {
			if(localStorage.getItem('cur')){
				clearInterval(intervalId)
				draw(localStorage.getItem('cur'))
			}
		}, 200)
	} else {
		draw(currency_lS)
	}

	function draw(lS){
		lS = JSON.parse(lS)
		if(lS.selected && lS.selected !== 'BYN'){
			
			qs('header .currency .head span').innerHTML = lS.selected
		}
	}

}