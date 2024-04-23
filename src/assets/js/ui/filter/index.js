import { debounce, load_toast, qs, qsa, isEmpty, xml } from "../../libs";
import { store, search_thunk } from "./store";
import { exlist_open_modal } from '../../pages/index'
import { currency } from "../../services";


export function Filter(){

	if(!qs('section.table.sbor')) return // only sbor
	

	store.subscribe(_ => {
		let state = store.getState()
		console.log(state)

		// SIDE EFFECTS

		!isEmpty(state.results) && draw(state.results)

		let tbody = qs('section.table .table .tbody')
		state.loading
			? tbody.classList.add('loading')
			: tbody.classList.remove('loading')
		

		let input = qs('section.table .table .thead input')
		state.query == null && (input.value = '')

		qsa('.item.active').forEach(el => el.classList.remove('active'))

		state.period?.includes('.')
			? qs('.item.month').classList.add('active')
			: qs('.item.'+state.period)?.classList.add('active')
		
		// URL search params
		
		const url = new URL(location);
		
		state.period
			? url.searchParams.set("period", state.period)
			: (url.searchParams.delete("period"), set_current_month())
		
		state.query
			? url.searchParams.set("query", state.query)
			: url.searchParams.delete("query")	
		
		history.replaceState({}, "", url);	


			
	})

	
	set_current_month()
	by_input()
	by_period()


	reset_query_cross()

	total_reset()

	count_ex_for_periods()

	
	
}

function by_input(){

	async function onSearch(e){
		
		if(!e.target.value) return
		if(e.target.value.length < 3){
			await load_toast()
			new Snackbar('Меньше 2 знаков нельзя')
			return;
		}
		
		store.dispatch(search_thunk({query: e.target.value}))

	}

	let input = qs('section.table .table .thead input')
	let debouncedInput = debounce(onSearch, 500);
	input?.listen("keyup", debouncedInput)
	
}

function by_period(){


	// < Апрель >
	
	let month = qs('.item.month .label')
	
	month?.listen("click", e => {

		let y = +month.getAttribute('y')
		let m = +month.getAttribute('m') < 10
			? +month.getAttribute('m')+1
			: +month.getAttribute('m')
		let item = e.target.closest('.item')
		let period = item.classList.contains('active') ? null : `${m}.${y}`
		
		let obj = { period: period }
		store.dispatch(search_thunk(obj))

	});


	let today = qs('.item.today .label');
	let tomorrow = qs('.item.tomorrow .label');
	let week = qs('.item.week .label');

	[today, tomorrow, week].forEach(el => {
		el?.listen("click", e => {
			let item = e.target.closest('.item')
			let period = item.classList.contains('active') ? null : item.classList[1]
			store.dispatch(search_thunk({period: period}))
		})
	})


}

function set_current_month(){

	let label = qs('.item.month .label')
	if(!label) return
	let prev_arrow = label?.previousElementSibling

	const month = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
	let d = new Date();
	let name = month[d.getMonth()];
	let year = d.getFullYear()
	
	draw_month(name,year)

	// switch month
	qsa('.item.month img').forEach(el => {
		el.listen("click", e => set_month(e.target.classList[0]) )
	})

	function set_month(dir){
		let m = +label.getAttribute('m')
		let y = +label.getAttribute('y')


		if(dir == 'next'){

			m == 11 && (y++, m = -1)
			draw_month(month[m+1],y)
			store.dispatch(search_thunk({ period: `${m+2}.${y}` }))
		}

		if(dir == 'prev'){
			if(prev_arrow.classList.contains('disabled')) return
			m == 0 && (m=12, y--)
			draw_month(month[m-1],y)
			store.dispatch(search_thunk({ period: `${m}.${y}` }))
			
		}

		

		
	}

	function draw_month(name,year){
		
		label.setAttribute('m', month.indexOf(name))
		label.setAttribute('y', year)
		label.innerHTML = `${name}, ${year}`;

		// prev arrow disable
		let d = new Date();
		let current_m = month[d.getMonth()];
		let current_year = d.getFullYear()
		

		if(current_m == name && year == current_year){
			prev_arrow.classList.add('disabled')
		} else {
			prev_arrow.classList.remove('disabled')
		}
	}

	
}


function draw(obj){
	// obj.ex[], obj.schedule[]
	if(obj?.success == false){
		qs('.table .tbody').innerHTML = '<h3 class="nf404">Экскурсии не найдены</h4>'
		return;
	}

	obj = JSON.parse(JSON.stringify(obj));
	let {ex, schedule} = obj
	let s = [];

	// flat
	s = schedule.map(el => {
		let t = ex.find(e => e.exid == el.exid)

		el.name = t.name
		el.distance = t.distance
		el.duration = t.duration
		el.uri = t.uri

		return el
		
	})

	// group
	let r = s.reduce((acc, current) => {

		if(!acc[current.date]){
			acc[current.date] = []
		}
		acc[current.date].push(current)
		return acc
	},[])

	// sort
	let ordered = []
	Object.keys(r)
		.sort((a,b) => {
			
			var pattern = /(\d{2})\.(\d{2})\.(\d{4})/;
			a = new Date(a.replace(pattern,'$3-$2-$1'));
			a = Date.parse(a)
			
			b = new Date(b.replace(pattern,'$3-$2-$1'));
			b = Date.parse(b)

			return a - b
		})
		.forEach(k=>ordered[k] = r[k])
		

	let str = ``
	let current = currency.current()
	

	Object.keys(ordered).forEach(k => {
		
		let date = k.split('.')
		//console.log(date)
		date = `${date[0]}.${date[1]}`
		str += `<div class="row"> <span class="date">${date}</span>`
		
		ordered[k].forEach(el => {
			let adult = el.price.split(',')[0]
			if(current !== 'BYN')
				adult = currency.calc(adult, current)
			
			str +=`
			<div class="record">
				<span class="time">${el.time}</span>
				<a href="${el.uri}">${el.name}</a>

				<span class="seats">${el.seats}</span>
					<div class="price">
						<span byn="${adult}">${adult}</span>
						<span class="cur">BYN</span>
					</div>
					<span class="book">
						<span exid="${el.exid}" timid="${el.timid}">Бронь</span>
					</span>
				</div>
			`
		})
		

		str +=`</div>`
	})

	qs('.table .tbody').innerHTML = str
	exlist_open_modal()
}

function reset_query_cross(){

	// reset search by cross click

	let cross = qs('section.table .name .close')
	
	if(!cross) return

	cross.listen("click", e => {
		store.dispatch(search_thunk({query: null}))
	})

}

function total_reset(){
	let reset = qs('.filter .reset')
	reset?.listen("click", _ => store.dispatch(search_thunk({})))
}

async function count_ex_for_periods(){
	let host = process.env.NODE_ENV == 'development' ? 'http://new.sauko.by': ''
	await xml('count_ex_for_periods', null, host+'/api/')
}