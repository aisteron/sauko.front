import { qs, sw,fancy, load_swiped, xml, cfg, load_toast, debounce } from "../libs";
import { currency } from "../services";
import { Filter } from "./filter";

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
