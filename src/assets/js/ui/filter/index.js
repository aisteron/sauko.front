import { debounce, load_toast, qs, qsa,isEmpty } from "../../libs";
import { service } from "../../services";
import { store, search_thunk } from "./store";


export function Filter(){

	store.subscribe(_ => {
		let state = store.getState()
		console.log(state)

		let tbody = qs('section.table .table .tbody')
		state.loading
			? tbody.classList.add('loading')
			: tbody.classList.remove('loading')

			!isEmpty(state.results) && draw(state.results)
	})

	
	// onPageLoad()
	
	set_current_month()
	by_input()
	by_period()


	reset_query_cross()

	
	
}

function by_input(){

	async function onSearch(e){
		
		if(e.target.value.length < 3){
			await load_toast()
			new Snackbar('Меньше 2 знаков нельзя')
			return;
		}
		
		store.dispatch(search_thunk({query: e.target.value}))

	}

	let input = qs('.table.sbor .table .thead input')
	let debouncedInput = debounce(onSearch, 500);
	input.listen("keyup", debouncedInput)
	
}

function by_period(){
	
	let label = qs('.item.month .label')
	
	label.listen("click", async e => {

		let y = +label.getAttribute('y')
		let m = +label.getAttribute('m') < 10
			? '0'+(+label.getAttribute('m')+1)
			: +label.getAttribute('m')

		//const url = new URL(location);
		//url.searchParams.set("period", `${m}.${y}`);
		//history.replaceState({}, "", url);

		let obj = { period: `${m}.${y}` }
		store.dispatch(search_thunk(obj))


	})
}

function set_current_month(){

	let label = qs('.item.month .label')
	let prev_arrow = label.previousElementSibling

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
		}

		if(dir == 'prev'){
			if(prev_arrow.classList.contains('disabled')) return
			m == 0 && (m=12, y--)
			draw_month(month[m-1],y)
			
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

function onPageLoad(){
	const url = new URL(location);
	state.query = url.searchParams.get('query')
	state.period = url.searchParams.get('period')
}


function draw(obj){
	// obj.ex[], obj.schedule[]

	obj = JSON.parse(JSON.stringify(obj));
	let {ex, schedule} = obj
	let s = [];

	s = schedule.map(el => {
		let t = ex.find(e => e.exid == el.exid)

		el.name = t.name
		el.distance = t.distance
		el.duration = t.duration
		el.uri = t.uri

		return el
		
	})

	let r = s.reduce((acc, current) => {

		if(!acc[current.date]){
			acc[current.date] = []
		}
		acc[current.date].push(current)
		return acc
	},[])

	let ordered = []
	Object.keys(r)
		.sort((a,b) => Date.parse(a) - Date.parse(b))
		.forEach(k=>ordered[k] = r[k])
	
	let str = ``
	Object.keys(ordered).forEach(k => {
		let date = k.split('.')
		//console.log(date)
		date = `${date[0]}.${date[1]}`
		str += `<div class="row"> <span class="date">${date}</span>`
		
		ordered[k].forEach(el => {
			let adult = el.price.split(',')[0]
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
}

function reset_query_cross(){

	// reset by cross click

	//const url = new URL(location);
	// url.searchParams.set("query", e.target.value);
	// history.replaceState({}, "", url);

	let cross = qs('section.table .name .close')
	if(!cross) return

		cross.listen("click", async e => {

			url.searchParams.delete('query');
			history.replaceState({}, "", url);
			input.value = ''
			
			
			
			//await service.search_ex()

		})

}