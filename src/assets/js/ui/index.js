import { qs, sw,fancy, load_swiped } from "../libs";
import { currency } from "../services";

export function Ui(){
	
	swipes()
	fancy.init()
	toggle_aside_nav()
	mobile_menu()
	load_swiped()

	currency.init()
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
